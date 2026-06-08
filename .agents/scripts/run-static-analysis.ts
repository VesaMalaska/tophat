import { execSync } from "child_process";

interface AntigravityPayload {
  workspacePaths?: string[];
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
      // NOTE: Ensure these commands map to your package.json scripts
      execSync("pnpm check && pnpm lint && pnpm vitest run", {
        cwd: workspace,
        stdio: "ignore",
      });

      // Success requires an empty JSON object
      console.log(JSON.stringify({}));
    } catch (err) {
      console.error(
        "Static analysis failed. Type errors, lint issues, or failing Vitest unit tests were detected.",
      );
      process.exit(1);
    }
  } catch (e) {
    // Fail-open
    console.log(JSON.stringify({}));
  }
});
