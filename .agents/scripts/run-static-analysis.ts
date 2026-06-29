import { execSync } from "child_process";

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

    // Define the sequence natively in Node
    const validationCommands = ["pnpm check", "pnpm lint", "pnpm vitest run"];

    try {
      for (const cmd of validationCommands) {
        // This acts as a native '&&'. If one fails, it throws immediately to the catch block.
        execSync(cmd, { cwd: workspace, stdio: "pipe" });
      }

      console.log(JSON.stringify({ decision: "allow" } as DecisionResponse));
    } catch (err: any) {
      const stdout = err.stdout ? err.stdout.toString() : "";
      const stderr = err.stderr ? err.stderr.toString() : "";
      const combinedOutput = `${stdout}\n${stderr}`.trim().substring(0, 1500);

      const rejection: DecisionResponse = {
        decision: "deny",
        reason: `Static analysis failed on command. Review the following lint/type errors or failing tests and surgically fix them before attempting to commit again:\n\n${combinedOutput}`,
      };

      console.log(JSON.stringify(rejection));
    }
  } catch (e) {
    console.log(JSON.stringify({ decision: "allow" } as DecisionResponse));
  }
});
