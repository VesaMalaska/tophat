import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const activeFiles = [
  ".agents/workflows/workspace-attach.md", ".agents/workflows/workspace-attach-assess.md", ".agents/workflows/workspace-attach-finalize.md", ".agents/docs/workspace-attachment.md", ".agents/docs/workspace-detachment.md",
  "README.md", "Strategy.md", "Roadmap.md", "Context.md", "HUD.md",
  ".agents/rules/agent-architect.md", ".agents/rules/workflows.md",
  ".agents/skills/git-linear-workflow/SKILL.md",
  ".agents/workflows/generate-sprint-tasks.md", ".agents/workflows/refactor-audit.md",
  ".agents/workflows/workspace-init.md",
  ".agents/workflows/project-define.md", ".agents/workflows/project-definition-review.md",
  ".agents/workflows/project-definition-finalize.md", ".agents/rules/project-definition.md",
];

test("active templates and instructions have no Epic tier or numbered operational Phase", () => {
  for (const path of activeFiles) {
    const content = readFileSync(path, "utf8");
    assert.doesNotMatch(content, /\bEpics?\b/i, path);
    assert.doesNotMatch(content, /(?<!Development )\bPhase\s+[0-9]+\b/i, path);
  }
});
