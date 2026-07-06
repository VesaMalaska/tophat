import fs from "fs";
import path from "path";

// Zero-dependency CLI argument parser
const args = process.argv.slice(2);
const getArg = (flag: string, fallback: string = "N/A"): string => {
  const index = args.indexOf(flag);
  return index !== -1 && args[index + 1] ? args[index + 1] : fallback;
};

const task = getArg("--task", "No Active Task");
const title = getArg("--title", "Task Execution");
const tier = getArg("--tier", "mid");
const status = getArg("--status", "In Progress");
const nextCmd = getArg("--next", "/sprint-briefing");
const model = getArg("--model", "Gemini Flash High");
const blocker = getArg("--blocker", "None. Workspace is clean and ready.");

// New Bypass Flags (Default to 'yes' for backward compatibility)
const secReq = getArg("--sec", "yes").toLowerCase();
const qaReq = getArg("--qa", "yes").toLowerCase();

// Deterministic State Machine: Map Linear Status to HUD Emojis
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
    case "In Review: Orchestrator":
    case "Done":
      base = { impl: "🟢", rev: "🟢", sec: "🟢", qa: "🟢", pr: "🟢" };
      break;
    case "Blocked":
    case "Changes Requested":
      base = { impl: "🔴", rev: "🔴", sec: "⚪", qa: "⚪", pr: "⚪" };
      break;
    default:
      base = { impl: "🟡", rev: "⚪", sec: "⚪", qa: "⚪", pr: "⚪" };
      break;
  }

  // INDESTRUCTIBLE BYPASS PARSER
  // Catches "no", "[no]", "false", "N/A", "none"
  const secArg = getArg("--sec", "yes").toLowerCase();
  const qaArg = getArg("--qa", "yes").toLowerCase();

  const isSecSkipped =
    secArg.includes("no") ||
    secArg.includes("false") ||
    secArg.includes("n/a") ||
    secArg.includes("none");
  const isQASkipped =
    qaArg.includes("no") ||
    qaArg.includes("false") ||
    qaArg.includes("n/a") ||
    qaArg.includes("none");

  if (isSecSkipped) base.sec = "➖";
  if (isQASkipped) base.qa = "➖";

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

🚦 Pipeline Status
  - [${stages.impl}] Implementation
  - [${stages.rev}] Standard/Critical Review
  - [${stages.sec}] Security Audit
  - [${stages.qa}] QA Validation
  - [${stages.pr}] PR Generation

🚀 Immediate Next Action
  - Command: ${nextCmd}
  - Model: ${model}

🚧 Active Blockers
  - ${blocker}
`;

const hudPath = path.join(process.cwd(), "HUD.md");
fs.writeFileSync(hudPath, hudContent, { encoding: "utf-8" });
console.log(
  `[TOPHAT_HUD]: Successfully broadcasted state for ${task} (${status}) to HUD.md`,
);
