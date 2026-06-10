import { execSync } from "child_process";

interface AntigravityPayload {
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
    const payload: AntigravityPayload = JSON.parse(inputData);

    const workspace =
      payload.workspacePaths && payload.workspacePaths.length > 0
        ? payload.workspacePaths[0]
        : process.cwd();

    try {
      // Changed stdio from "ignore" to "pipe" so we can capture the diagnostic output
      execSync("pnpm check && pnpm lint && pnpm vitest run", {
        cwd: workspace,
        stdio: "pipe",
      });

      // If checks pass, explicitly allow the tool execution
      console.log(JSON.stringify({ decision: "allow" } as DecisionResponse));
    } catch (err: any) {
      // Capture standard output and standard error from the failed command
      const stdout = err.stdout ? err.stdout.toString() : "";
      const stderr = err.stderr ? err.stderr.toString() : "";

      // Combine and truncate to 1500 characters to prevent overloading the agent's context window
      const combinedOutput = `${stdout}\n${stderr}`.trim().substring(0, 1500);

      const rejection: DecisionResponse = {
        decision: "deny",
        reason: `Static analysis failed. Do not attempt to bypass Git. Review the following lint/type errors or failing tests and surgically fix them before attempting to commit again:\n\n${combinedOutput}`,
      };

      // Return the structured rejection to the IDE, but exit cleanly (Code 0)
      // so the Antigravity Orchestrator parses the JSON rather than throwing a raw system error.
      console.log(JSON.stringify(rejection));
    }
  } catch (e) {
    // Fail-open policy: If the payload itself fails to parse, allow the commit rather than hard-locking the workspace.
    console.log(JSON.stringify({ decision: "allow" } as DecisionResponse));
  }
});
