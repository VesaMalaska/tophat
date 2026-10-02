import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTophatConfig, type Capability, type TophatConfig, TophatConfigError } from "./load-tophat-config.ts";

export type TaskTopic = "backend" | "browser-flow" | "desktop-flow" | "electron-ipc" | "security" |
  "sqlite" | "supabase" | "tailwind" | "vitest" | "server-component" | "client-component" |
  "route-handler" | "server-action" | "desktop-main" | "desktop-preload" | "desktop-renderer";
export type FrameworkInstruction = "svelte" | "sveltekit" | "react" | "nextjs";
export interface TaskGuidanceRequest {
  requestedSkills: readonly string[];
  taskTopics: readonly TaskTopic[];
  frameworkInstructions: readonly FrameworkInstruction[];
}
export interface TaskGuidanceSelection {
  readonly status: "SELECTED";
  readonly skills: readonly string[];
  readonly capabilities: readonly Capability[];
  readonly smokeProfile: "web" | "backend" | "desktop";
  readonly renderer: "svelte" | "react" | "none" | null;
  readonly boundaries: readonly string[];
}
export class TaskGuidanceError extends Error {
  readonly code = "TASK_GUIDANCE_INCOMPATIBLE";
  constructor(reason: string) { super(reason); this.name = "TaskGuidanceError"; }
}

const requirements: Readonly<Record<string, { capabilities?: readonly Capability[]; topics?: readonly TaskTopic[] }>> = {
  "svelte5-runes-architecture": { capabilities: ["svelte"] },
  "svelte5-kit-architecture": { capabilities: ["sveltekit"] },
  "react-architecture": { capabilities: ["react"] },
  "nextjs-architecture": { capabilities: ["nextjs"] },
  "nodejs-backend-architecture": { capabilities: ["node-server"], topics: ["backend"] },
  "nodejs-main-process": { capabilities: ["node-main"] },
  "electron-secure-ipc": { capabilities: ["electron"], topics: ["electron-ipc"] },
  "playwright-qa-flows-web": { capabilities: ["web-qa"], topics: ["browser-flow"] },
  "playwright-qa-flows-desktop": { capabilities: ["desktop-qa"], topics: ["desktop-flow"] },
  "tailwind-semantic-ui": { topics: ["tailwind"] },
  "tailwind-desktop-ui": { capabilities: ["renderer-ui"], topics: ["tailwind"] },
  "sqlite-high-performance": { topics: ["sqlite"] },
  "supabase-multitenant-data": { topics: ["supabase"] },
  "owasp-top-10": { topics: ["security"] },
  "vitest-tdd": { topics: ["vitest"] },
  "tdd-workflow": {},
  "git-linear-workflow": {},
};
const topics = new Set<TaskTopic>(["backend", "browser-flow", "desktop-flow", "electron-ipc", "security", "sqlite", "supabase", "tailwind", "vitest", "server-component", "client-component", "route-handler", "server-action", "desktop-main", "desktop-preload", "desktop-renderer"]);
const instructions = new Set<FrameworkInstruction>(["svelte", "sveltekit", "react", "nextjs"]);
const boundaryNotes: Readonly<Partial<Record<TaskTopic, string>>> = {
  "server-component": "Next.js Server Component: server-only data and secrets; explicit rendering and cache policy; serializable client props.",
  "client-component": "Next.js Client Component: browser interaction boundary; no server secrets or privileged imports.",
  "route-handler": "Next.js route handler: validate input and authorization; specify response, error, and cache behavior.",
  "server-action": "Next.js server action: validate input and authorization; specify mutation and cache invalidation.",
  "desktop-main": "Electron main process: privileged operations remain in main.",
  "desktop-preload": "Electron preload: context isolation and minimal typed bridge.",
  "desktop-renderer": "Electron renderer: use only the declared renderer framework and IPC bridge.",
  "electron-ipc": "Electron IPC: typed channels, validated inputs, and explicit trust boundary.",
};

/** Validate proposed skill labels immediately before a task is handed off. */
export function selectTaskGuidance(config: TophatConfig, request: TaskGuidanceRequest): TaskGuidanceSelection {
  if (!request || !Array.isArray(request.requestedSkills) || !Array.isArray(request.taskTopics) ||
      !Array.isArray(request.frameworkInstructions)) throw new TaskGuidanceError("Task guidance requires skills, topics, and framework instructions arrays");
  if (request.taskTopics.some((topic) => !topics.has(topic))) throw new TaskGuidanceError("Unknown task topic");
  if (request.frameworkInstructions.some((name) => !instructions.has(name))) throw new TaskGuidanceError("Unknown framework instruction");
  const caps = config.capabilities;
  for (const topic of request.taskTopics) {
    if (["server-component", "client-component", "route-handler", "server-action"].includes(topic) &&
        (!caps.includes("nextjs") || !request.requestedSkills.includes("nextjs-architecture")))
      throw new TaskGuidanceError(`Task topic ${topic} requires nextjs capability and nextjs-architecture skill`);
    if (["desktop-main", "desktop-preload", "desktop-renderer", "electron-ipc"].includes(topic) && !caps.includes("electron"))
      throw new TaskGuidanceError(`Task topic ${topic} requires electron capability`);
    if (topic === "desktop-renderer" && !caps.includes("renderer-ui"))
      throw new TaskGuidanceError("Desktop renderer task requires renderer-ui capability");
  }
  for (const name of request.frameworkInstructions) {
    if (!caps.includes(name)) throw new TaskGuidanceError(`Instruction ${name} requires absent capability ${name}`);
  }
  if (new Set(request.requestedSkills).size !== request.requestedSkills.length)
    throw new TaskGuidanceError("Duplicate skill selection");
  for (const name of request.requestedSkills) {
    const rule = Object.hasOwn(requirements, name) ? requirements[name] : undefined;
    if (!rule) throw new TaskGuidanceError(`Unknown skill ${String(name)}`);
    for (const capability of rule.capabilities ?? []) {
      if (!caps.includes(capability)) throw new TaskGuidanceError(`Skill ${name} requires absent capability ${capability}`);
    }
    for (const topic of rule.topics ?? []) {
      if (!request.taskTopics.includes(topic)) throw new TaskGuidanceError(`Skill ${name} requires task topic ${topic}`);
    }
    if (name === "tailwind-semantic-ui" && !caps.includes("web-ui") && !caps.includes("renderer-ui"))
      throw new TaskGuidanceError(`Skill ${name} requires a UI capability`);
  }
  const smokeProfile = config.workspace.kind;
  const renderer = smokeProfile === "desktop" ? config.workspace.framework as "svelte" | "react" | "none" : null;
  const boundaries = request.taskTopics.flatMap((topic) => { const note = boundaryNotes[topic]; return note ? [note] : []; });
  return Object.freeze({ status: "SELECTED", skills: Object.freeze([...request.requestedSkills]),
    capabilities: caps, smokeProfile, renderer, boundaries: Object.freeze(boundaries) });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let input = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk: string) => { input += chunk; });
  process.stdin.on("end", () => {
    try {
      const config = loadTophatConfig(process.cwd());
      const request = JSON.parse(input) as TaskGuidanceRequest;
      console.log(JSON.stringify(selectTaskGuidance(config, request)));
    } catch (error) {
      const code = error instanceof TophatConfigError ? error.code : error instanceof TaskGuidanceError ? error.code : "TASK_GUIDANCE_INPUT_INVALID";
      console.log(JSON.stringify({ status: "DENIED", code, reason: error instanceof Error ? error.message : "Cannot select task guidance" }));
      process.exitCode = 1;
    }
  });
  process.stdin.on("error", () => { console.log(JSON.stringify({ status: "DENIED", code: "TASK_GUIDANCE_INPUT_INVALID", reason: "Cannot read task guidance input" })); process.exitCode = 1; });
}
