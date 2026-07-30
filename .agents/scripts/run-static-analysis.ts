import { execSync } from "child_process";
import fs from "fs";
import path from "path";

interface TopHatPayload {
  workspacePaths?: string[];
}

interface DecisionResponse {
  decision: "allow" | "deny" | "ask";
  reason?: string;
}

let inputData: string = "";

process.stdin.on("data", (chunk: Buffer | string) => {
  inputData += chunk.toString();
});

process.stdin.on("end", () => {
  try {
    const payload: TopHatPayload = JSON.parse(inputData);
    const workspace =
      payload.workspacePaths && payload.workspacePaths.length > 0
        ? payload.workspacePaths[0]
        : process.cwd();

    // 1. Identify the Risk Profile via the Git Index
    let stagedFiles: string[] = [];
    try {
      const diffOutput = execSync("git diff --cached --name-only", {
        cwd: workspace,
      }).toString();
      stagedFiles = diffOutput.split("\n").filter((f) => f.trim().length > 0);
    } catch (e) {
      // Fallback if git diff fails
    }

    const touchesLogic = stagedFiles.some(
      (f) =>
        f.endsWith(".ts") ||
        f.endsWith(".svelte") ||
        f.endsWith(".js") ||
        f.endsWith(".tsx"),
    );
    const touchesCore = stagedFiles.some(
      (f) =>
        f.includes("src/main/") ||
        f.includes("preload") ||
        f.includes("src/lib/server/") ||
        f.includes("api/"),
    );

    // 2. Assemble the Tiered Smoke Profile
    const validationCommands = ["pnpm check", "pnpm lint"];

    // Tier 1: Frontend/Logic modified. Compile to catch malformed framework syntax.
    if (touchesLogic) {
      validationCommands.push("pnpm build");
    }

    // Tier 2: Core backend/native boundaries modified.
    // Progressive Wall: Only execute the smoke test if the Dev Agent has successfully implemented it.
    if (touchesCore) {
      const smokeTestPath = path.join(workspace, "tests/e2e/smoke.test.ts");
      if (fs.existsSync(smokeTestPath)) {
        validationCommands.push("npx playwright test tests/e2e/smoke.test.ts");
      }
    }

    // 3. Execute the Wall
    try {
      for (const cmd of validationCommands) {
        execSync(cmd, { cwd: workspace, stdio: "pipe" });
      }

      console.log(JSON.stringify({ decision: "allow" } as DecisionResponse));
    } catch (err: any) {
      const stdout = err.stdout ? err.stdout.toString() : "";
      const stderr = err.stderr ? err.stderr.toString() : "";
      const combinedOutput = `${stdout}\n${stderr}`.trim().substring(0, 1500);

      const rejection: DecisionResponse = {
        decision: "deny",
        reason: `Static analysis or Runtime Smoke Test failed. Review the following errors and surgically fix them before attempting to commit again:\n\n${combinedOutput}`,
      };

      console.log(JSON.stringify(rejection));
    }
  } catch (e) {
    console.log(JSON.stringify({ decision: "allow" } as DecisionResponse));
  }
});
