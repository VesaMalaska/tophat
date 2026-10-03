import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadTophatConfig, parseTophatConfig, validationCategories, type ValidationCategory,
  type TophatConfig,
} from "./load-tophat-config.ts";

export type Gate = "commitGate" | "developmentPhaseGate" | "projectCompletionGate";
export type ValidationRequest = { gate: Gate; additionalCategories?: ValidationCategory[] };
export type CategoryResult = {
  category: ValidationCategory;
  script: string;
  status: "PASSED" | "FAILED";
  exitStatus: number | null;
  stdout?: string; stderr?: string; signal?: string | null;
};
export type ValidationReport = {
  schemaVersion: 1;
  gate: Gate | null;
  profile: string | null;
  categories: ValidationCategory[];
  results: CategoryResult[];
  status: "PASSED" | "FAILED" | "SKIPPED_NOT_APPLICABLE";
  decision: "allow" | "deny";
  code: string;
  reason: string;
  testedCommit: string | null;
  evidenceKind: "PRE_COMMIT_SNAPSHOT" | "EXISTING_COMMIT" | null;
};

function git(root: string, args: string[]): string {
  const result = spawnSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  if (result.error || result.status !== 0) throw new Error(`Cannot inspect Git state (${args[0]})`);
  return result.stdout;
}

function trackedState(root: string): string {
  return git(root, ["diff", "HEAD", "--binary", "--"]);
}

function requestCategories(request: ValidationRequest, config: TophatConfig): ValidationCategory[] {
  if (!request || typeof request !== "object" || Array.isArray(request) ||
      !["commitGate", "developmentPhaseGate", "projectCompletionGate"].includes(request.gate) ||
      Object.keys(request).some((key) => !["gate", "additionalCategories"].includes(key)))
    throw new Error("Request must select one supported gate");
  const extras = request.additionalCategories ?? [];
  if (!Array.isArray(extras) || extras.some((category) => !validationCategories.includes(category)))
    throw new Error("Additional categories must be declared validation categories");
  const selected = [...config.validation[request.gate], ...extras];
  if (new Set(selected).size !== selected.length) throw new Error("Selected categories must not repeat");
  return selected;
}

/** Executes a validated, ordered host gate. Additional categories append in request order. */
export interface ValidationExecutionOptions { candidateConfig?: TophatConfig; timeoutMs?: number; maxBufferBytes?: number; disableAutomaticSetup?: boolean }
export function runValidation(request: ValidationRequest, root: string, pnpm = "pnpm", options: ValidationExecutionOptions = {}): ValidationReport {
  const report: ValidationReport = {
    schemaVersion: 1, gate: null, profile: null, categories: [], results: [],
    status: "FAILED", decision: "deny", code: "VALIDATION_REQUEST_INVALID", reason: "Invalid request",
    testedCommit: null, evidenceKind: null,
  };
  const fail = (code: string, reason: string): ValidationReport => {
    report.status = "FAILED"; report.decision = "deny"; report.code = code; report.reason = reason;
    return report;
  };
  try {
    const config = options.candidateConfig ? parseTophatConfig(JSON.stringify(Object.fromEntries(Object.entries(options.candidateConfig).filter(([key]) => key !== "capabilities")))) : loadTophatConfig(root);
    if (options.timeoutMs !== undefined && (!Number.isSafeInteger(options.timeoutMs) || options.timeoutMs < 1 || options.timeoutMs > 600000)) throw new Error("Invalid execution timeout");
    if (options.maxBufferBytes !== undefined && (!Number.isSafeInteger(options.maxBufferBytes) || options.maxBufferBytes < 1024 || options.maxBufferBytes > 16 * 1024 * 1024)) throw new Error("Invalid output limit");
    if (options.disableAutomaticSetup !== undefined && typeof options.disableAutomaticSetup !== "boolean") throw new Error("Invalid setup suppression option");
    const selected = requestCategories(request, config);
    report.gate = request.gate;
    report.profile = `${config.workspace.kind}:${config.workspace.framework}`;
    report.categories = selected;
    if (!selected.length) {
      report.status = "SKIPPED_NOT_APPLICABLE";
      report.decision = "allow";
      report.code = "OPTIONAL_GATE_EMPTY";
      report.reason = `${request.gate} declares no categories`;
      return report;
    }

    let pkg: unknown;
    try { pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8")); }
    catch { return fail("PACKAGE_INVALID", "Cannot read a valid host package.json"); }
    if (!pkg || typeof pkg !== "object" || Array.isArray(pkg) ||
        !("scripts" in pkg) || !pkg.scripts || typeof pkg.scripts !== "object" || Array.isArray(pkg.scripts))
      return fail("PACKAGE_INVALID", "Host package.json must declare scripts");
    const scripts = pkg.scripts as Record<string, unknown>;
    for (const category of selected) {
      const name = config.validation.scripts[category];
      if (!name || typeof scripts[name] !== "string" || !scripts[name])
        return fail("SCRIPT_MISSING", `${category} requires declared package script ${name ?? "<missing>"}`);
    }

    let before: string;
    try {
      report.testedCommit = git(root, ["rev-parse", "HEAD"]).trim();
      report.evidenceKind = request.gate === "commitGate" ? "PRE_COMMIT_SNAPSHOT" : "EXISTING_COMMIT";
      before = trackedState(root);
    } catch (error) { return fail("GIT_STATE_UNAVAILABLE", String(error)); }

    for (const category of selected) {
      const script = config.validation.scripts[category]!;
      const result = spawnSync(pnpm, ["run", script], { cwd: root, encoding: "utf8", maxBuffer: options.maxBufferBytes ?? 16 * 1024 * 1024, timeout: options.timeoutMs, killSignal: "SIGKILL", ...(options.candidateConfig || options.disableAutomaticSetup ? { env: { ...process.env, pnpm_config_verify_deps_before_run: "false", pnpm_config_manage_package_manager_versions: "false" } } : {}) });
      const passed = !result.error && result.status === 0;
      report.results.push({ category, script, status: passed ? "PASSED" : "FAILED", exitStatus: result.status, ...(options.timeoutMs === undefined ? {} : { stdout: (result.stdout ?? "").slice(0, 4000), stderr: (result.stderr ?? "").slice(0, 4000), signal: result.signal }) });
      if (!passed) return fail(result.error ? (result.error.code === "ETIMEDOUT" ? "SCRIPT_TIMEOUT" : result.error.code === "ENOBUFS" ? "SCRIPT_OUTPUT_LIMIT" : "SCRIPT_SPAWN_FAILED") : "SCRIPT_FAILED",
        result.error ? `Cannot start pnpm for ${category}: ${result.error.message}` :
          `${category} script ${script} exited with ${result.status}: ${(result.stderr || result.stdout || "").slice(0, 1000)}`);
    }
    try {
      if (trackedState(root) !== before) return fail("TRACKED_STATE_CHANGED", "Validation changed tracked workspace files");
    } catch (error) { return fail("GIT_STATE_UNAVAILABLE", String(error)); }
    report.status = "PASSED";
    report.decision = "allow";
    report.code = "VALIDATION_PASSED";
    report.reason = "All selected host scripts passed without changing tracked workspace files";
    return report;
  } catch (error) {
    return fail("VALIDATION_INPUT_DENIED", error instanceof Error ? error.message : "Validation could not complete");
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let request: ValidationRequest;
  try { request = JSON.parse(process.argv[2] ?? ""); }
  catch {
    console.log(JSON.stringify({ schemaVersion: 1, decision: "deny", status: "FAILED",
      code: "VALIDATION_REQUEST_INVALID", reason: "Pass a JSON validation request as the first argument" }));
    process.exitCode = 1;
    request = null as unknown as ValidationRequest;
  }
  if (request) {
    const qaMode = process.argv[3] === "--qa";
    if (process.argv.length > (qaMode ? 4 : 3)) {
      console.log(JSON.stringify({ status: "FAILED", decision: "deny", code: "VALIDATION_REQUEST_INVALID", reason: "Only the bounded --qa execution mode is supported" })); process.exitCode = 1;
    } else {
    const result = runValidation(request, process.cwd(), "pnpm", qaMode ? { disableAutomaticSetup: true, timeoutMs: 600000, maxBufferBytes: 1024 * 1024 } : {});
    console.log(JSON.stringify(result));
    if (result.decision === "deny") process.exitCode = 1;
    }
  }
}
