import { spawnSync } from "node:child_process";
import { chmodSync, lstatSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import { gitPreflight, type GitRequest } from "./git-preflight.ts";
import { digest, strictJson } from "./validate-doc-package.ts";
import { loadTophatConfig } from "./load-tophat-config.ts";

type InstallResult = { status: "INSTALLED" | "ALREADY_INSTALLED" | "DENIED"; code: string; reason: string };
const deny = (code: string, reason: string): InstallResult => ({ status: "DENIED", code, reason });
const marker = "# TopHat 1.0 commit gate.";

function git(root: string, args: string[]): string {
  const result = spawnSync("git", args, { cwd: root, encoding: "utf8" });
  if (result.error || result.status !== 0) throw new Error(`Git ${args[0]} failed`);
  return result.stdout.trim();
}

/** Never replaces an existing Git hook or redirects an existing hooksPath. */
export function installGitHook(root: string, request?: GitRequest): InstallResult {
  try {
    if (Number(process.versions.node.split(".")[0]) < 24)
      return deny("NODE_VERSION_UNSUPPORTED", "TopHat requires Node.js >=24.0.0");
    loadTophatConfig(root);
    const top = git(root, ["rev-parse", "--show-toplevel"]);
    if (resolve(top) !== resolve(root)) return deny("GIT_ROOT_MISMATCH", "Install from the host repository root");
    const custom = spawnSync("git", ["config", "--get", "core.hooksPath"], { cwd: root, encoding: "utf8" });
    if (custom.error || (custom.status !== 0 && custom.status !== 1))
      return deny("GIT_CONFIG_UNAVAILABLE", "Cannot inspect Git hooksPath");
    if (custom.status === 0) return deny("GIT_HOOKS_PATH_CONFIGURED", "An existing core.hooksPath requires manual integration");
    const path = git(root, ["rev-parse", "--git-path", "hooks/pre-commit"]);
    const destination = isAbsolute(path) ? path : resolve(root, path);
    const source = readFileSync(resolve(root, ".agents/git-hooks/pre-commit"), "utf8");
    if (!source.includes(marker)) return deny("HOOK_SOURCE_INVALID", "TopHat hook source is missing its marker");
    function requirePreflight(): void {
      if (!request || request.operation !== "git-integration" || request.integration?.kind !== "hook" || resolve(request.repositoryRoot) !== resolve(root) || request.integration.after?.sha256 !== digest(source) || request.integration.after?.mode !== "100755")
        throw new Error("GIT_AUTHORIZATION_REQUIRED: explicit hook preflight request with exact installed bytes is required");
      const result = gitPreflight(request);
      if (result.decision !== "ALLOW") throw new Error(result.code);
    }
    let existingHook = false;
    try {
      if (!lstatSync(destination).isFile())
        return deny("HOOK_CONFLICT", "Existing pre-commit path is not a regular file");
      const existing = readFileSync(destination, "utf8");
      if (existing !== source) return deny("HOOK_CONFLICT", "An existing pre-commit hook requires manual integration");
      existingHook = true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT")
        return deny("HOOK_READ_FAILED", "Cannot inspect existing Git hook");
    }
    requirePreflight();
    if (existingHook) {
      chmodSync(destination, 0o755);
      return { status: "ALREADY_INSTALLED", code: "HOOK_VERIFIED", reason: "Installed TopHat hook matches the versioned source" };
    }
    writeFileSync(destination, source, { flag: "wx", mode: 0o755 });
    chmodSync(destination, 0o755);
    if (readFileSync(destination, "utf8") !== source) return deny("HOOK_VERIFY_FAILED", "Installed hook differs from its source");
    return { status: "INSTALLED", code: "HOOK_VERIFIED", reason: "TopHat pre-commit hook installed and verified" };
  } catch (error) {
    return deny("HOOK_INSTALL_FAILED", error instanceof Error ? error.message : "Cannot install TopHat hook");
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let request: GitRequest | undefined;
  try { const input = readFileSync(0); if(input.length > 1024 * 1024) throw Error("request too large"); request = strictJson(input.toString("utf8")) as GitRequest; } catch { /* missing or malformed input denies before writing */ }
  const result = installGitHook(process.cwd(), request);
  console.log(JSON.stringify(result));
  if (result.status === "DENIED") process.exitCode = 1;
}
