import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTophatConfig, TophatConfigError } from "./load-tophat-config.ts";

type Decision = { decision: "allow" | "deny"; status: string; reason: string };
const deny = (status: string, reason: string): Decision => ({ decision: "deny", status, reason });

const legacyExport = /^(?!\s*\/\/|\s*\/\*|\s*\*).*?\bexport\s+let\b/m;
const legacyReactive = /^(?!\s*\/\/|\s*\/\*|\s*\*).*?(?:^|\s)\$:\s/m;

/** Decide from the validated host configuration before inspecting Svelte syntax. */
export function evaluateSvelteWrite(input: string, workspaceRoot: string): Decision {
  let capabilities: readonly string[];
  try { capabilities = loadTophatConfig(workspaceRoot).capabilities; }
  catch (error) {
    const reason = error instanceof TophatConfigError ? error.message : "Cannot inspect TopHat configuration";
    return deny("TOPHAT_CONFIG_INVALID", reason);
  }

  let payload: unknown;
  try { payload = JSON.parse(input); }
  catch { return deny("HOOK_INPUT_INVALID", "Hook input must be valid JSON"); }
  if (!payload || typeof payload !== "object" || Array.isArray(payload))
    return deny("HOOK_INPUT_INVALID", "Hook input must be an object");
  const toolCall = (payload as Record<string, unknown>).toolCall;
  if (!toolCall || typeof toolCall !== "object" || Array.isArray(toolCall))
    return deny("HOOK_INPUT_INVALID", "Hook input must contain toolCall");
  const { name, args } = toolCall as Record<string, unknown>;
  if (!["write_to_file", "replace_file_content", "multi_replace_file_content"].includes(name as string) ||
      !args || typeof args !== "object" || Array.isArray(args))
    return deny("HOOK_INPUT_INVALID", "Hook input requires a supported write call and args");
  const values = args as Record<string, unknown>;
  if (typeof values.TargetFile !== "string" || !values.TargetFile)
    return deny("HOOK_INPUT_INVALID", "TargetFile must be a nonempty string");
  let content: string;
  if (name === "multi_replace_file_content") {
    const chunks = values.ReplacementChunks;
    if (!Array.isArray(chunks) || !chunks.length || chunks.some(
      (chunk) => !chunk || typeof chunk !== "object" || typeof chunk.ReplacementContent !== "string",
    )) return deny("HOOK_INPUT_INVALID", "ReplacementChunks must contain replacement text");
    content = chunks.map((chunk) => chunk.ReplacementContent).join("\n");
  } else {
    const key = name === "write_to_file" ? "CodeContent" : "ReplacementContent";
    if (typeof values[key] !== "string") return deny("HOOK_INPUT_INVALID", `${key} must be a string`);
    content = values[key] as string;
  }

  if (!capabilities.includes("svelte")) return {
    decision: "allow", status: "SKIPPED_NOT_APPLICABLE",
    reason: "Svelte enforcement is inactive because this workspace does not declare the svelte capability.",
  };
  if (!values.TargetFile.endsWith(".svelte")) return {
    decision: "allow", status: "SKIPPED_NOT_APPLICABLE", reason: "This write does not target a .svelte file.",
  };
  if (legacyExport.test(content) || legacyReactive.test(content)) return deny(
    "SVELTE_5_CONSTRAINT_VIOLATION",
    "Legacy Svelte syntax ('export let' or '$:') detected. Use Svelte 5 runes ($state, $props, $derived, $effect); inspect any literal false positive before changing code.",
  );
  return { decision: "allow", status: "PASSED", reason: "No legacy Svelte syntax detected." };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let input = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk: string) => { input += chunk; });
  process.stdin.on("end", () => {
    try { console.log(JSON.stringify(evaluateSvelteWrite(input, process.cwd()))); }
    catch { console.log(JSON.stringify(deny("HOOK_INTERNAL_ERROR", "Svelte hook could not complete"))); }
  });
  process.stdin.on("error", () => {
    console.log(JSON.stringify(deny("HOOK_INPUT_INVALID", "Cannot read hook input")));
  });
}
