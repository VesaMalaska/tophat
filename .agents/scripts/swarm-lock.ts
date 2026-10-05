import { spawnSync } from "node:child_process";
import { realpathSync, lstatSync } from "node:fs";
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
  try {
    const inspect = (args: string[]): string => {
      const result = spawnSync("git", ["--no-optional-locks", "rev-parse", ...args], {
        cwd: root, encoding: "utf8", timeout: 10000, maxBuffer: 65536,
      });
      if (result.error || result.status !== 0 || !result.stdout.trim() || /[\r\n\0]/.test(result.stdout.trim())) throw new Error("Invalid Git location");
      return result.stdout.trim();
    };
    if (realpathSync(root) !== realpathSync(inspect(["--show-toplevel"])))
      return deny("LOCK_REPOSITORY_INVALID", "Choose the actual host worktree root");
    const common = realpathSync(resolve(root, inspect(["--git-common-dir"])));
    if (!statSync(common).isDirectory()) return deny("LOCK_REPOSITORY_INVALID", "Git common directory is unavailable");
    const lockDir = join(common, "locks");
    try { if (lstatSync(lockDir).isSymbolicLink() || !lstatSync(lockDir).isDirectory()) throw new Error("Unsafe lock directory"); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
    const lockFile = join(lockDir, `${lockType}.lock`);
    try { if (lstatSync(lockFile).isSymbolicLink() || !lstatSync(lockFile).isFile()) throw new Error("Unsafe lock file"); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
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
