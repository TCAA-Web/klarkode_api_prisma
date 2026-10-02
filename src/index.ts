import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";

import { HttpError } from "./prisma/errors";
import { getPlatformSnapshot } from "./prisma/platform";
import { submitLesson } from "./prisma/submissions";
import { enrollInClassroom } from "./prisma/subscriptions";

const port = Number(process.env.PORT ?? 3000);

const MAX_BODY_BYTES = 64 * 1024;
const MAX_CODE_LENGTH = 20_000;

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,OPTIONS",
  "access-control-allow-headers": "content-type",
};

function sendJson(response: ServerResponse, status: number, body: unknown) {
  response.writeHead(status, {
    "content-type": "application/json",
    ...corsHeaders,
  });
  response.end(JSON.stringify(body));
}

async function readJson(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      throw new HttpError(413, "Request body too large.");
    }
    chunks.push(chunk);
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new HttpError(400, "Request body must be valid JSON.");
  }
}

function parseSubmission(body: unknown) {
  const { userId, lessonId, code } = (body ?? {}) as Record<string, unknown>;

  if (
    typeof userId !== "string" ||
    !userId ||
    typeof lessonId !== "string" ||
    !lessonId
  ) {
    throw new HttpError(400, "userId and lessonId are required.");
  }
  if (typeof code !== "string" || code.length > MAX_CODE_LENGTH) {
    throw new HttpError(
      400,
      `code must be a string of at most ${MAX_CODE_LENGTH} characters.`,
    );
  }

  // Any `ok` sent by the client is ignored; the server decides the verdict.
  return { userId, lessonId, code };
}

function parseEnrollment(body: unknown) {
  const { userId, classroomId } = (body ?? {}) as Record<string, unknown>;

  if (
    typeof userId !== "string" ||
    !userId ||
    typeof classroomId !== "string" ||
    !classroomId
  ) {
    throw new HttpError(400, "userId and classroomId are required.");
  }

  return { userId, classroomId };
}

createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    response.writeHead(204, corsHeaders);
    response.end();
    return;
  }

  try {
    const url = new URL(
      request.url ?? "/",
      `http://${request.headers.host ?? "localhost"}`,
    );
    if (request.method === "POST" && url.pathname === "/submissions") {
      const result = await submitLesson(
        parseSubmission(await readJson(request)),
      );
      sendJson(response, 200, result);
      return;
    }

    if (request.method === "POST" && url.pathname === "/subscriptions") {
      const result = await enrollInClassroom(
        parseEnrollment(await readJson(request)),
      );
      sendJson(response, 200, result);
      return;
    }

    const userId = url.searchParams.get("userId") ?? "ada-lovelace";
    sendJson(response, 200, await getPlatformSnapshot(userId));
  } catch (error) {
    if (error instanceof HttpError) {
      sendJson(response, error.status, { error: error.message });
      return;
    }

    console.error("Request failed:", error);
    sendJson(response, 500, {
      error: "Could not query platform snapshot yet.",
    });
  }
}).listen(port, "0.0.0.0", () => {
  console.log(`Server running at http://localhost:${port}`);
});
