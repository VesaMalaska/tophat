import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export const validationCategories = [
  "typecheck", "lint", "unit", "coverage", "integration", "build", "smoke", "e2e", "documentation",
] as const;
export type ValidationCategory = (typeof validationCategories)[number];
export type WorkspaceKind = "web" | "backend" | "desktop";
export type Framework = "svelte" | "sveltekit" | "react" | "nextjs" | "none";
export type Capability =
  | "web-ui" | "svelte" | "sveltekit" | "react" | "nextjs" | "node-server" | "web-qa"
  | "electron" | "node-main" | "renderer-ui" | "desktop-qa";

export interface TophatConfig {
  readonly schemaVersion: 1;
  readonly workspace: Readonly<{ kind: WorkspaceKind; framework: Framework }>;
  readonly documentation: Readonly<{
    package: string;
    manifest: string;
    derivedTargets: readonly string[];
  }>;
  readonly validation: Readonly<{
    scripts: Readonly<Partial<Record<ValidationCategory, string>>>;
    commitGate: readonly ValidationCategory[];
    developmentPhaseGate: readonly ValidationCategory[];
    projectCompletionGate: readonly ValidationCategory[];
  }>;
  readonly routingMatrix: Readonly<Record<string, string>>;
  readonly capabilities: readonly Capability[];
}

export class TophatConfigError extends Error {
  readonly code = "TOPHAT_CONFIG_INVALID";
  readonly issues: readonly string[];
  constructor(issues: readonly string[]) {
    super(`TopHat configuration denied: ${issues.join("; ")}`);
    this.name = "TophatConfigError";
    this.issues = issues;
  }
}

const capabilityTable: Readonly<Record<string, readonly Capability[]>> = Object.freeze({
  "web:svelte": ["web-ui", "svelte", "web-qa"],
  "web:sveltekit": ["web-ui", "svelte", "sveltekit", "node-server", "web-qa"],
  "web:react": ["web-ui", "react", "web-qa"],
  "web:nextjs": ["web-ui", "react", "nextjs", "node-server", "web-qa"],
  "backend:none": ["node-server"],
  "desktop:svelte": ["electron", "node-main", "renderer-ui", "svelte", "desktop-qa"],
  "desktop:react": ["electron", "node-main", "renderer-ui", "react", "desktop-qa"],
  "desktop:none": ["electron", "node-main", "desktop-qa"],
});

type RecordValue = Record<string, unknown>;
const isRecord = (v: unknown): v is RecordValue =>
  typeof v === "object" && v !== null && !Array.isArray(v);

function objectAt(value: unknown, label: string, issues: string[]): RecordValue {
  if (isRecord(value)) return value;
  issues.push(`${label} must be an object`);
  return {};
}

function onlyKeys(value: RecordValue, allowed: readonly string[], label: string, issues: string[]): void {
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) issues.push(`${label}.${key} is not supported`);
  }
}

function requiredString(value: unknown, label: string, issues: string[]): string {
  if (typeof value === "string" && value.length > 0) return value;
  issues.push(`${label} must be a nonempty string`);
  return "";
}

function relativePath(value: unknown, label: string, issues: string[], directory = false): string {
  const path = requiredString(value, label, issues);
  if (!path) return path;
  const normalized = directory && path.endsWith("/") ? path.slice(0, -1) : path;
  if (
    path.includes("\\") || /[\u0000-\u001f\u007f]/.test(path) ||
    path.startsWith("/") || /^[A-Za-z]:/.test(path) || path.startsWith("//") ||
    normalized.split("/").some((part) => part === "" || part === "." || part === "..")
  ) issues.push(`${label} must be a workspace-relative path without traversal`);
  return path;
}

function gate(value: unknown, label: string, scripts: RecordValue, issues: string[], optional = false): ValidationCategory[] {
  if (!Array.isArray(value) || (!optional && value.length === 0)) {
    issues.push(`${label} must be ${optional ? "a" : "a nonempty"} category array`);
    return [];
  }
  const selected: ValidationCategory[] = [];
  for (const category of value) {
    if (typeof category !== "string" || !validationCategories.includes(category as ValidationCategory)) {
      issues.push(`${label} has an unknown category`);
    } else if (selected.includes(category as ValidationCategory)) {
      issues.push(`${label} repeats ${category}`);
    } else {
      selected.push(category as ValidationCategory);
      if (!(category in scripts)) issues.push(`${label} selects ${category} without a script`);
    }
  }
  return selected;
}

/** Structural validation only. Package authority and host-script execution are checked by their separate shared validators. */
export function parseTophatConfig(source: string): TophatConfig {
  let raw: unknown;
  try { raw = JSON.parse(source); }
  catch { throw new TophatConfigError(["configuration is not valid JSON"]); }
  const issues: string[] = [];
  const root = objectAt(raw, "config", issues);
  onlyKeys(root, ["schemaVersion", "workspace", "documentation", "validation", "routingMatrix"], "config", issues);
  if (root.schemaVersion !== 1) issues.push("schemaVersion must be 1");

  const workspace = objectAt(root.workspace, "workspace", issues);
  onlyKeys(workspace, ["kind", "framework"], "workspace", issues);
  const kind = requiredString(workspace.kind, "workspace.kind", issues);
  const framework = requiredString(workspace.framework, "workspace.framework", issues);
  const capabilities = capabilityTable[`${kind}:${framework}`];
  if (kind && framework && !capabilities) issues.push(`unsupported workspace combination: ${kind}+${framework}`);

  const documentation = objectAt(root.documentation, "documentation", issues);
  onlyKeys(documentation, ["package", "manifest", "derivedTargets"], "documentation", issues);
  const packagePath = relativePath(documentation.package, "documentation.package", issues, true);
  const manifest = relativePath(documentation.manifest, "documentation.manifest", issues);
  const targets: string[] = [];
  if (!Array.isArray(documentation.derivedTargets)) issues.push("documentation.derivedTargets must be an array");
  else for (const [i, target] of documentation.derivedTargets.entries()) {
    const path = relativePath(target, `documentation.derivedTargets[${i}]`, issues, true);
    const canonical = path.replace(/\/$/, "");
    if (targets.some((existing) => existing.replace(/\/$/, "") === canonical))
      issues.push(`duplicate derived target: ${path}`);
    if ([".agents", "Strategy.md", "Roadmap.md", "Context.md", "HUD.md", "DECISIONS.md"].some(
      (privatePath) => canonical === privatePath || canonical.startsWith(`${privatePath}/`),
    )) issues.push(`derived target is private orchestration: ${path}`);
    targets.push(path);
  }

  const validation = objectAt(root.validation, "validation", issues);
  onlyKeys(validation, ["scripts", "commitGate", "developmentPhaseGate", "projectCompletionGate"], "validation", issues);
  const scripts = objectAt(validation.scripts, "validation.scripts", issues);
  onlyKeys(scripts, validationCategories, "validation.scripts", issues);
  for (const [category, name] of Object.entries(scripts)) {
    if (typeof name !== "string" || !/^[A-Za-z0-9:_-]+$/.test(name))
      issues.push(`validation.scripts.${category} must be a package-script name`);
  }
  const commitGate = gate(validation.commitGate, "validation.commitGate", scripts, issues);
  const developmentPhaseGate = gate(validation.developmentPhaseGate, "validation.developmentPhaseGate", scripts, issues, true);
  const projectCompletionGate = gate(validation.projectCompletionGate, "validation.projectCompletionGate", scripts, issues, true);

  const routingMatrix = objectAt(root.routingMatrix, "routingMatrix", issues);
  for (const [route, model] of Object.entries(routingMatrix)) {
    if (!route.startsWith("/") || typeof model !== "string" || !model.trim())
      issues.push(`routingMatrix.${route} must map a workflow to a model`);
  }
  if (issues.length) throw new TophatConfigError(Object.freeze(issues));

  return Object.freeze({
    schemaVersion: 1,
    workspace: Object.freeze({ kind: kind as WorkspaceKind, framework: framework as Framework }),
    documentation: Object.freeze({ package: packagePath, manifest, derivedTargets: Object.freeze(targets) }),
    validation: Object.freeze({
      scripts: Object.freeze({ ...scripts }) as Readonly<Partial<Record<ValidationCategory, string>>>,
      commitGate: Object.freeze(commitGate),
      developmentPhaseGate: Object.freeze(developmentPhaseGate),
      projectCompletionGate: Object.freeze(projectCompletionGate),
    }),
    routingMatrix: Object.freeze({ ...routingMatrix }) as Readonly<Record<string, string>>,
    capabilities: Object.freeze([...capabilities]),
  });
}

export function loadTophatConfig(workspaceRoot: string): TophatConfig {
  let source: string;
  try { source = readFileSync(resolve(workspaceRoot, ".agents/tophat.config.json"), "utf8"); }
  catch { throw new TophatConfigError(["cannot read .agents/tophat.config.json"]); }
  return parseTophatConfig(source);
}
