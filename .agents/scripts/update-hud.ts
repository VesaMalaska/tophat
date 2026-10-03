import fs from "node:fs";
import path from "node:path";
import { inspectDocPackage, isMain, type DocReport } from "./validate-doc-package.ts";
import { attachmentReadiness } from "./validate-workspace-attachment.ts";
import { reviewEvidence } from "./finalize-doc-package.ts";
import { classifyTask, inputJson, fail } from "./classify-task.ts";

export function documentationReadiness(workspaceRoot: string): { report: DocReport; reviewRequired: boolean } {
  const approved = inspectDocPackage(workspaceRoot);
  if (approved.report.planningAllowed || approved.report.documentationState === "INVALIDATED")
    return { report: approved.report, reviewRequired: false };
  const draft = inspectDocPackage(workspaceRoot, "draft");
  if (!draft.snapshot) return { report: draft.report, reviewRequired: true };
  try {
    reviewEvidence(draft.snapshot, `.agents/project-definition/${draft.snapshot.manifest.packageId}/review.json`);
    return { report: draft.report, reviewRequired: false };
  } catch {
    return { report: draft.report, reviewRequired: true };
  }
}
export function overlayDocumentation(content: string, workspaceRoot: string): string {
  const { report, reviewRequired } = documentationReadiness(workspaceRoot);
  const attachment = attachmentReadiness(workspaceRoot);
  const state = report.documentationState ?? "UNAVAILABLE — VALIDATION DENIED";
  let previous = content.replace(/\n(?:#{1,6} )?📚 Documentation Authority[\s\S]*$/, "").trimEnd();
  if (!report.planningAllowed || attachment.state === "ATTACHMENT_INVALIDATED") previous = previous.replace(/None\. Workspace is clean and ready\./g, "Documentation readiness denied; inspect the authority report.");
  return `${previous}\n\n📚 Documentation Authority\n  - State: ${state}\n  - Package: ${report.packageId ?? "Unavailable"} / ${report.packageVersion ?? "Unavailable"}\n  - Planning allowed: ${report.planningAllowed && attachment.state !== "ATTACHMENT_INVALIDATED" ? "yes" : "no"}\n  - Authority fingerprint: ${report.authorityFingerprint ?? "Unavailable"}\n  - Validation: ${report.status} at ${new Date().toISOString()}\n  - Attachment: ${attachment.state} (historical completion evidence; current authority checked separately)\n  - Attachment blockers: ${attachment.issues.join("; ") || "None recorded"}\n  - Review: ${reviewRequired ? "REVIEW REQUIRED" : "No review blocker recorded"}\n  - Blockers: ${report.issues.map(i => `${i.code}: ${i.message}`).join("; ") || (report.planningAllowed ? "None" : "Explicit matching human approval is required before planning")}\n`;
}
export function renderHud(args: string[], workspaceRoot = process.cwd()): string {
if (args.includes("--sec") || args.includes("--qa")) fail("ROUTING_METADATA_CONFLICT", "Legacy HUD routing bypass flags are unsupported");
// Zero-dependency CLI argument parser

const getArg = (flag: string, fallback: string = "N/A"): string => {
  const index = args.indexOf(flag);
  return index !== -1 && args[index + 1] ? args[index + 1] : fallback;
};

const task = getArg("--task", "No Active Task");
const title = getArg("--title", "Task Execution");
let tier = getArg("--tier", "Unverified");
const status = getArg("--status", "In Progress");
const nextCmd = getArg("--next", "/sprint-briefing");

// Read the Single Source of Truth Config
let resolvedModel = "Fallback Model";
try {
  const configPath = path.join(workspaceRoot, ".agents", "tophat.config.json");
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

    // Extract the base command (e.g., "/review-standard JAC-30" -> "/review-standard")
    // We handle the edge case where the agent might pass multiple commands like "[/review-critical OR /review-standard]"
    const baseCmdMatch = nextCmd.match(/(\/[a-zA-Z0-9-]+)/);
    if (baseCmdMatch && baseCmdMatch[1]) {
      resolvedModel =
        config.routingMatrix[baseCmdMatch[1]] || "Unknown Model in Config";
    }
  } else {
    resolvedModel = "Missing tophat.config.json";
  }
} catch (err) {
  resolvedModel = "Config Parse Error";
}

const routingFile = getArg("--routing-file", "");
const route = routingFile ? classifyTask(workspaceRoot, inputJson(fs.readFileSync(path.resolve(workspaceRoot, routingFile), "utf8"))) : null;
if (route) {
  if (args.includes("--tier") && tier !== route.devTier) fail("ROUTING_METADATA_CONFLICT", "HUD tier differs from task classification");
  tier = route.devTier;
}

type Emojis = "🟢" | "🟡" | "⚪" | "🔴" | "➖";
interface StageStates {
  impl: Emojis;
  rev: Emojis;
  sec: Emojis;
  qa: Emojis;
  pr: Emojis;
}

const calculateStages = (currentStatus: string): StageStates => {
  let base: StageStates;
  switch (currentStatus) {
    case "Todo":
    case "In Progress":
      base = { impl: "🟡", rev: "⚪", sec: "⚪", qa: "⚪", pr: "⚪" };
      break;
    case "In Review: Architecture":
      base = { impl: "🟢", rev: "🟡", sec: "⚪", qa: "⚪", pr: "⚪" };
      break;
    case "In Review: Security":
      base = { impl: "🟢", rev: "🟢", sec: "🟡", qa: "⚪", pr: "⚪" };
      break;
    case "In Review: QA":
      base = { impl: "🟢", rev: "🟢", sec: "🟢", qa: "🟡", pr: "⚪" };
      break;
    case "Ready for PR":
      base = { impl: "🟢", rev: "🟢", sec: "🟢", qa: "🟢", pr: "🟡" };
      break;
    case "Changes Requested":
      base = { impl: "🔴", rev: "🔴", sec: "⚪", qa: "⚪", pr: "⚪" };
      break;
    default:
      base = { impl: "🟡", rev: "⚪", sec: "⚪", qa: "⚪", pr: "⚪" };
      break;
  }

  if (route && !route.securityRequired) base.sec = "➖";
  if (route && !route.qaRequired) base.qa = "➖";
  if (!route) base = { impl: "⚪", rev: "⚪", sec: "⚪", qa: "⚪", pr: "⚪" };

  return base;
};

const stages = calculateStages(status);
const timestamp = new Date().toISOString().replace("T", " ").substring(0, 19);

const hudContent = `🛸 TopHat Orchestrator HUD
Last Updated: ${timestamp}

🎯 Active Target
  - Task: ${task} - ${title}
  - Dev Tier: ${tier}
  - Linear Status: ${status}
  - Routing: ${route ? route.taskFingerprint : "UNVERIFIED — supply the current task classification"}

🚦 Pipeline Status
  - [${stages.impl}] Implementation
  - [${stages.rev}] Standard/Critical Review
  - [${stages.sec}] Security Audit
  - [${stages.qa}] QA Validation
  - [${stages.pr}] PR Generation
  - Indicators reflect reported workflow status; they are not approval evidence.

🚀 Immediate Next Action
  - Command: \`${nextCmd}\`
  - Model: \`${resolvedModel}\`

🚧 Active Blockers
  - Publication readiness requires the evidence validator; HUD status cannot authorize publication.`;

return overlayDocumentation(hudContent, workspaceRoot);
}

if (isMain(import.meta.url)) {
  try {
    fs.writeFileSync(path.join(process.cwd(), "HUD.md"), renderHud(process.argv.slice(2)));
    console.log(JSON.stringify({ status: "HUD Updated Successfully" }));
  } catch {
    console.log(JSON.stringify({ status: "HUD_UPDATE_FAILED", message: "HUD could not be written" })); process.exitCode = 1;
  }
}
