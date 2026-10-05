import { resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";

type Decision = { decision: "allow" | "deny" | "ask"; status: string; reason: string };
const deny = (status: string, reason: string): Decision => ({ decision: "deny", status, reason });
const chunkHeader = "### 🎯 Active Sprint Chunk:";
const markerCount = (text: string): number => text.split(/\r?\n/).filter(line => line === chunkHeader || line.startsWith(chunkHeader + " ") || line.startsWith(chunkHeader + "\t")).length;
const writeTools = ["write_to_file", "replace_file_content", "multi_replace_file_content"];

export function evaluateProtectedWrite(input: string): Decision {
  let payload: unknown;
  try { payload = JSON.parse(input); }
  catch { return deny("HOOK_INPUT_INVALID", "Protected-write hook requires valid JSON"); }
  if (!payload || typeof payload !== "object" || Array.isArray(payload))
    return deny("HOOK_INPUT_INVALID", "Protected-write hook requires an object");
  const toolCall = (payload as Record<string, unknown>).toolCall;
  if (!toolCall || typeof toolCall !== "object" || Array.isArray(toolCall))
    return deny("HOOK_INPUT_INVALID", "Missing toolCall");
  const { name, args } = toolCall as Record<string, unknown>;
  if (typeof name !== "string" || !writeTools.includes(name) ||
      !args || typeof args !== "object" || Array.isArray(args))
    return deny("HOOK_INPUT_INVALID", "Expected supported write tool and args");
  const values = args as Record<string, unknown>;
  if (typeof values.TargetFile !== "string" || !values.TargetFile)
    return deny("HOOK_INPUT_INVALID", "TargetFile must identify the write target");
  let content: string;
  if (name === "multi_replace_file_content") {
    if (!Array.isArray(values.ReplacementChunks) || !values.ReplacementChunks.length ||
        values.ReplacementChunks.some((chunk) => !chunk || typeof chunk !== "object" ||
          typeof chunk.ReplacementContent !== "string"))
      return deny("HOOK_INPUT_INVALID", "ReplacementChunks must contain replacement strings");
    content = values.ReplacementChunks.map((chunk) => chunk.ReplacementContent).join("\n");
  } else {
    const key = name === "write_to_file" ? "CodeContent" : "ReplacementContent";
    if (typeof values[key] !== "string") return deny("HOOK_INPUT_INVALID", `${key} must be a string`);
    content = values[key] as string;
  }

  const target = basename(values.TargetFile.replaceAll("\\", "/"));
  if (target === "Strategy.md") return {
    decision: "ask", status: "HUMAN_APPROVAL_REQUIRED",
    reason: "Strategy.md is protected. Ask the Human Orchestrator before this write.",
  };
  if (target === "Context.md") {
    if (name === "write_to_file") {
      const count = markerCount(content);
      if (count !== 1) return deny(count === 0 ? "ACTIVE_CHUNK_MISSING" : "ACTIVE_CHUNK_DUPLICATE",
        "Context.md rewrite requires exactly one canonical Active Sprint Chunk header; presence does not prove unchanged content or approval");
    } else {
      const chunks = name === "multi_replace_file_content" ? values.ReplacementChunks as Record<string, unknown>[] : [values];
      for (const chunk of chunks) {
        if (Object.hasOwn(chunk, "TargetContent") && typeof chunk.TargetContent !== "string")
          return deny("HOOK_INPUT_INVALID", "TargetContent, when supplied, must be a string");
        if (typeof chunk.TargetContent !== "string" || markerCount(chunk.TargetContent) || markerCount(chunk.ReplacementContent as string))
          return { decision: "ask", status: "HUMAN_APPROVAL_REQUIRED",
            reason: "Original context is absent or a protected marker is affected; inspect chunk preservation and obtain approval." };
      }
    }
  }
  return { decision: "allow", status: "PASSED", reason: "Protected-write rule checked" };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let input = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk: string) => { input += chunk; });
  process.stdin.on("end", () => {
    try { console.log(JSON.stringify(evaluateProtectedWrite(input))); }
    catch { console.log(JSON.stringify(deny("HOOK_INTERNAL_ERROR", "Protected-write check could not complete"))); }
  });
  process.stdin.on("error", () => {
    console.log(JSON.stringify(deny("HOOK_INPUT_INVALID", "Cannot read protected-write hook input")));
  });
}
