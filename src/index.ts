import { createServer } from "node:http";

import { getPlatformSnapshot } from "./prisma/platform";

const port = Number(process.env.PORT ?? 3000);

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,OPTIONS",
  "access-control-allow-headers": "content-type",
};

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
    const userId = url.searchParams.get("userId") ?? "ada-lovelace";
    const snapshot = await getPlatformSnapshot(userId);

    response.writeHead(200, {
      "content-type": "application/json",
      ...corsHeaders,
    });
    response.end(JSON.stringify(snapshot));
  } catch (error) {
    console.error("Failed to query platform snapshot:", error);
    response.writeHead(500, {
      "content-type": "application/json",
      ...corsHeaders,
    });
    response.end(
      JSON.stringify({ error: "Could not query platform snapshot yet." }),
    );
  }
}).listen(port, "0.0.0.0", () => {
  console.log(`Server running at http://localhost:${port}`);
});
