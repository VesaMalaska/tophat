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

// Read the Single Source of Truth Config
let resolvedModel = "Fallback Model";
try {
  const configPath = path.join(process.cwd(), ".agents", "tophat.config.json");
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

// New Bypass Flags
const secReq = getArg("--sec", "yes").toLowerCase();
const qaReq = getArg("--qa", "yes").toLowerCase();

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

  // INDESTRUCTIBLE BYPASS PARSER
  const isSecSkipped =
    secReq.includes("no") ||
    secReq.includes("false") ||
    secReq.includes("n/a") ||
    secReq.includes("none");
  const isQASkipped =
    qaReq.includes("no") ||
    qaReq.includes("false") ||
    qaReq.includes("n/a") ||
    qaReq.includes("none");

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
  - Command: \`${nextCmd}\`
  - Model: \`${resolvedModel}\`

🚧 Active Blockers
  - None. Workspace is clean and ready.`;

fs.writeFileSync(path.join(process.cwd(), "HUD.md"), hudContent);
console.log(
  JSON.stringify({
    status: "HUD Updated Successfully",
    next_model: resolvedModel,
  }),
);
