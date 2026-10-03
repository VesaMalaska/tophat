import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

type LockType = "tophat" | "global-pivot";
type Action = "acquire" | "release";
type Decision = { decision: "allow" | "deny"; status: string; reason: string };
const deny = (status: string, reason: string): Decision => ({ decision: "deny", status, reason });

function ownerFromPayload(input: string, lockType: LockType): string {
  const payload = JSON.parse(input);
  if (!payload || typeof payload !== "object" || Array.isArray(payload) ||
      typeof payload.conversationId !== "string" || !payload.conversationId ||
      !payload.toolCall || typeof payload.toolCall !== "object" ||
      typeof payload.toolCall.name !== "string" ||
      !payload.toolCall.args || typeof payload.toolCall.args !== "object" ||
      Array.isArray(payload.toolCall.args)) throw new Error("Expected conversationId and toolCall with args");
  const allowed = lockType === "tophat" ?
    ["write_to_file", "replace_file_content", "multi_replace_file_content"] : ["run_command"];
  if (!allowed.includes(payload.toolCall.name)) throw new Error("Tool identity does not match lock type");
  return createHash("sha256").update(JSON.stringify([
    payload.conversationId, payload.toolCall.name, payload.toolCall.args,
  ])).digest("hex");
}

/** Pair pre/post calls by conversation and exact tool call; never release another owner's lock. */
export function evaluateSwarmLock(action: string, lockType: string, input: string, root: string): Decision {
  if (!["acquire", "release"].includes(action) || !["tophat", "global-pivot"].includes(lockType))
    return deny("LOCK_ARGUMENT_INVALID", "Expected acquire/release and a supported lock type");
  let owner: string;
  try { owner = ownerFromPayload(input, lockType as LockType); }
  catch { return deny("LOCK_INPUT_INVALID", "Cannot identify the supported hook call and lock owner"); }
  const lockDir = join(root, ".git", "locks");
  const lockFile = join(lockDir, `${lockType}.lock`);
  try {
    if (!statSync(join(root, ".git")).isDirectory())
      return deny("LOCK_REPOSITORY_INVALID", "The host .git directory is unavailable");
    if (action === "acquire") {
      mkdirSync(lockDir, { recursive: true });
      try { writeFileSync(lockFile, JSON.stringify({ owner, pid: process.pid }), { flag: "wx" }); }
      catch (error) {
        if ((error as NodeJS.ErrnoException).code === "EEXIST")
          return deny("LOCK_CONFLICT", `${lockType} lock already exists; inspect its owner before retrying`);
        throw error;
      }
      return { decision: "allow", status: "LOCK_ACQUIRED", reason: `${lockType} lock acquired` };
    }
    let record: unknown;
    try { record = JSON.parse(readFileSync(lockFile, "utf8")); }
    catch { return deny("LOCK_RELEASE_FAILED", "Cannot read the lock being released; inspect it before retrying"); }
    if (!record || typeof record !== "object" || (record as { owner?: unknown }).owner !== owner)
      return deny("LOCK_OWNER_MISMATCH", "Lock belongs to another call; inspect it before retrying");
    unlinkSync(lockFile);
    return { decision: "allow", status: "LOCK_RELEASED", reason: `${lockType} lock released` };
  } catch (error) {
    return deny(action === "acquire" ? "LOCK_ACQUIRE_FAILED" : "LOCK_RELEASE_FAILED",
      `Cannot ${action} ${lockType} lock; inspect filesystem permissions and lock state`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let input = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk: string) => { input += chunk; });
  process.stdin.on("end", () => {
    try { console.log(JSON.stringify(evaluateSwarmLock(process.argv[2], process.argv[3], input, process.cwd()))); }
    catch { console.log(JSON.stringify(deny("LOCK_INTERNAL_ERROR", "Lock operation could not complete"))); }
  });
  process.stdin.on("error", () => {
    console.log(JSON.stringify(deny("LOCK_INPUT_INVALID", "Cannot read hook input")));
  });
}
