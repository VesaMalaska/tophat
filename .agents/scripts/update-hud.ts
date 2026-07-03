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

// Deterministic State Machine: Map Linear Status to HUD Emojis
type Emojis = "🟢" | "🟡" | "⚪" | "🔴";
interface StageStates {
  impl: Emojis;
  rev: Emojis;
  sec: Emojis;
  qa: Emojis;
  pr: Emojis;
}

const calculateStages = (currentStatus: string): StageStates => {
  switch (currentStatus) {
    case "Todo":
    case "In Progress":
      return { impl: "🟡", rev: "⚪", sec: "⚪", qa: "⚪", pr: "⚪" };
    case "In Review: Architecture":
      return { impl: "🟢", rev: "🟡", sec: "⚪", qa: "⚪", pr: "⚪" };
    case "In Review: Security":
      return { impl: "🟢", rev: "🟢", sec: "🟡", qa: "⚪", pr: "⚪" };
    case "In Review: QA":
      return { impl: "🟢", rev: "🟢", sec: "🟢", qa: "🟡", pr: "⚪" };
    case "Ready for PR":
      return { impl: "🟢", rev: "🟢", sec: "🟢", qa: "🟢", pr: "🟡" };
    case "In Review: Orchestrator":
    case "Done":
      return { impl: "🟢", rev: "🟢", sec: "🟢", qa: "🟢", pr: "🟢" };
    case "Blocked":
    case "Changes Requested":
      return { impl: "🔴", rev: "🔴", sec: "⚪", qa: "⚪", pr: "⚪" };
    default:
      return { impl: "🟡", rev: "⚪", sec: "⚪", qa: "⚪", pr: "⚪" };
  }
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
