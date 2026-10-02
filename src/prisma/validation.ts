import variant from "@jitl/quickjs-singlefile-mjs-release-sync";
import { DOMParser } from "linkedom";
import postcss from "postcss";
import {
  newQuickJSWASMModule,
  shouldInterruptAfterDeadline,
} from "quickjs-emscripten";

// Server-side counterpart of Platform_Frontend/src/lib/validation. Keep the check semantics in sync.

export type CheckRow = {
  type: string;
  message: string;
  selector: string | null;
  property: string | null;
  value: string | null;
  parent: string | null;
  child: string | null;
  count: number | null;
  attribute: string | null;
  text: string | null;
  expectedTag: string | null;
  name: string | null;
  args: unknown;
  expected: unknown;
};

export type ValidationResult = { ok: boolean; message: string };

type Predicate<Context> = (
  context: Context,
  check: CheckRow,
) => boolean | Promise<boolean>;

const PASSED: ValidationResult = {
  ok: true,
  message: "✓ Korrekt! Opgaven er bestået.",
};

const required = <T>(value: T | null | undefined): T => {
  if (value == null) throw new Error("Validation check is missing a field.");
  return value;
};

// Stops at the first failing check and reports its message.
async function runChecks<Context>(
  checks: CheckRow[],
  handlers: Record<string, Predicate<Context>>,
  context: Context,
): Promise<ValidationResult> {
  for (const check of checks) {
    try {
      if (await handlers[check.type]?.(context, check)) continue;
    } catch {
      // Invalid selectors or user code that throws count as a failed check.
    }
    return { ok: false, message: check.message };
  }

  return PASSED;
}

const htmlHandlers: Record<string, Predicate<Document>> = {
  hasElement: (doc, c) => doc.querySelector(required(c.selector)) !== null,
  hasClass: (doc, c) => doc.querySelector(required(c.selector)) !== null,
  hasChild: (doc, c) =>
    doc
      .querySelector(required(c.parent))
      ?.querySelector(`:scope > ${required(c.child)}`) != null,
  hasChildrenCount: (doc, c) =>
    doc
      .querySelector(required(c.parent))
      ?.querySelectorAll(`:scope > ${required(c.child)}`).length === c.count,
  hasAttribute: (doc, c) => {
    const actual = doc
      .querySelector(required(c.selector))
      ?.getAttribute(required(c.attribute));
    return actual != null && (c.value == null || actual === c.value);
  },
  textIncludes: (doc, c) =>
    !!c.text &&
    !!doc.querySelector(required(c.selector))?.textContent?.includes(c.text),
  semanticTag: (doc, c) =>
    doc.querySelector(required(c.selector))?.tagName.toLowerCase() ===
    c.expectedTag,
};

function validateHTML(code: string, checks: CheckRow[]) {
  const doc = new DOMParser().parseFromString(
    code,
    "text/html",
  ) as unknown as Document;
  return runChecks(checks, htmlHandlers, doc);
}

type Rules = Map<string, Record<string, string>>;

const STYLE_TAG = /<style[^>]*>([\s\S]*?)<\/style>/gi;

const normalizeSelector = (selector: string) =>
  selector
    .trim()
    .replace(/\s*([>+~])\s*/g, "$1")
    .replace(/\s+/g, " ");

const normalizeValue = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s*,\s*/g, ",")
    .replace(/\s+/g, " ");

// Accepts either raw CSS or HTML containing <style> blocks.
function parseRules(code: string): Rules {
  const blocks = Array.from(code.matchAll(STYLE_TAG), (match) => match[1]);
  const css = blocks.length > 0 ? blocks.join("\n") : code;
  const rules: Rules = new Map();

  try {
    postcss.parse(css).walkRules((rule) => {
      const parent = rule.parent;
      // @keyframes selectors (from/to/50%) are not element rules.
      if (
        parent?.type === "atrule" &&
        /keyframes$/i.test((parent as postcss.AtRule).name)
      ) {
        return;
      }

      const declarations: Record<string, string> = {};
      rule.each((node) => {
        if (node.type === "decl") {
          declarations[normalizeValue(node.prop)] = normalizeValue(node.value);
        }
      });

      for (const selector of rule.selectors) {
        const key = normalizeSelector(selector);
        rules.set(key, { ...rules.get(key), ...declarations });
      }
    });
  } catch {
    // Unparseable CSS yields no rules, so every check fails with its own message.
  }

  return rules;
}

const cssHandlers: Record<string, Predicate<Rules>> = {
  hasDeclaration: (rules, c) => {
    const actual = rules.get(normalizeSelector(required(c.selector)))?.[
      normalizeValue(required(c.property))
    ];
    return !!actual && (c.value == null || actual === normalizeValue(c.value));
  },
};

function validateCSS(code: string, checks: CheckRow[]) {
  return runChecks(checks, cssHandlers, parseRules(code));
}

// Learner code is untrusted: it only ever runs inside a QuickJS WASM VM with no host access.
const EVAL_TIMEOUT_MS = 500;
const EVAL_MEMORY_BYTES = 16 * 1024 * 1024;

let quickJS: ReturnType<typeof newQuickJSWASMModule> | undefined;

async function evaluate(script: string): Promise<unknown> {
  quickJS ??= newQuickJSWASMModule(variant);
  return (await quickJS).evalCode(script, {
    shouldInterrupt: shouldInterruptAfterDeadline(Date.now() + EVAL_TIMEOUT_MS),
    memoryLimitBytes: EVAL_MEMORY_BYTES,
  });
}

const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;

const identifier = (name: string | null) => {
  if (name == null || !IDENTIFIER.test(name))
    throw new Error("Invalid function name.");
  return name;
};

const typeOf = (value: unknown) => (value === null ? "null" : typeof value);

const javascriptHandlers: Record<string, Predicate<string>> = {
  includesText: (code, c) => code.includes(required(c.value)),
  definesFunction: async (code, c) =>
    (await evaluate(
      `${code}\n;typeof ${identifier(c.name)} === "function"`,
    )) === true,
  returnsExpected: async (code, c) => {
    const name = identifier(c.name);
    const args = JSON.stringify(c.args ?? []);
    const output = await evaluate(
      `${code}
;(() => {
  if (typeof ${name} !== "function") return JSON.stringify({ t: "missing" });
  const r = ${name}(...${args});
  return JSON.stringify({ t: r === null ? "null" : typeof r, v: r });
})()`,
    );
    const { t, v } = JSON.parse(String(output)) as { t: string; v?: unknown };
    return t === typeOf(c.expected) && v === c.expected;
  },
};

function validateJavascript(code: string, checks: CheckRow[]) {
  // Learners may write `export function ...`, which a plain script can't parse.
  const sanitizedCode = code.replace(/\bexport\s+/g, "").trim();
  return runChecks(checks, javascriptHandlers, sanitizedCode);
}

export function validateSubmission(
  kind: string,
  code: string,
  checks: CheckRow[],
): Promise<ValidationResult> {
  switch (kind) {
    case "html":
      return validateHTML(code, checks);
    case "css":
      return validateCSS(code, checks);
    case "javascript":
      return validateJavascript(code, checks);
    default:
      return Promise.resolve({ ok: false, message: "Validation invalid" });
  }
}
