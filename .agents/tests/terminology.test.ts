import { catalog } from './fixtures/commands.ts';
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const activeFiles = [
  ".agents/docs/derived-documentation.md", ".agents/rules/agent-technical-writer.md", ".agents/skills/sync-derived-docs/SKILL.md", ".agents/skills/review-derived-docs/SKILL.md", ".agents/skills/verify-project-docs/SKILL.md",
  ".agents/docs/task-routing-and-qa.md", ".agents/skills/sprint-briefing/SKILL.md", ".agents/skills/qa-validate/SKILL.md", ".agents/skills/publish-pr/SKILL.md",
  ".agents/skills/workspace-attach/SKILL.md", ".agents/skills/workspace-attach-assess/SKILL.md", ".agents/skills/workspace-attach-finalize/SKILL.md", ".agents/docs/workspace-attachment.md", ".agents/docs/workspace-detachment.md",
  "README.md", "Strategy.md", "Roadmap.md", "Context.md", "HUD.md",
  ".agents/rules/agent-architect.md", ".agents/rules/workflows.md",
  ".agents/skills/git-linear-workflow/SKILL.md",
  ".agents/skills/generate-sprint-tasks/SKILL.md", ".agents/skills/refactor-audit/SKILL.md",
  ".agents/skills/workspace-init/SKILL.md",
  ".agents/skills/project-define/SKILL.md", ".agents/skills/project-definition-review/SKILL.md",
  ".agents/skills/project-definition-finalize/SKILL.md", ".agents/rules/project-definition.md",
];

test("active templates and instructions have no Epic tier or numbered operational Phase", () => {
  for (const path of [...activeFiles.filter(p=>!p.startsWith('.agents/skills/')||p.includes('git-linear-workflow')), ...catalog.commands.filter(c=>c.state==='active').map(c=>c.entryPath!)]) {
    const content = readFileSync(path, "utf8");
    assert.doesNotMatch(content, /\bEpics?\b/i, path);
    assert.doesNotMatch(content, /(?<!Development )\bPhase\s+[0-9]+\b/i, path);
  }
});
