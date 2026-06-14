interface ReplacementChunk {
  ReplacementContent: string;
}

interface ToolCallArgs {
  TargetFile?: string;
  CodeContent?: string;
  ReplacementContent?: string;
  ReplacementChunks?: ReplacementChunk[];
}

interface ToolCall {
  name: string;
  args?: ToolCallArgs;
}

interface TopHatPayload {
  toolCall?: ToolCall;
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
    const toolCall = payload.toolCall;

    if (!toolCall || !toolCall.args) {
      console.log(JSON.stringify({ decision: "allow" } as DecisionResponse));
      return;
    }

    const args = toolCall.args;
    const targetFile = args.TargetFile || "";
    let contentToCheck = "";

    if (toolCall.name === "write_to_file") {
      contentToCheck = args.CodeContent || "";
    } else if (toolCall.name === "replace_file_content") {
      contentToCheck = args.ReplacementContent || "";
    } else if (toolCall.name === "multi_replace_file_content") {
      contentToCheck = (args.ReplacementChunks || [])
        .map((c) => c.ReplacementContent)
        .join("\n");
    }

    // Only enforce on Svelte files
    if (targetFile.endsWith(".svelte")) {
      // Regex Breakdown:
      // ^ = start of line
      // (?!\s*\/\/|\s*\/\*|\s*\*) = Negative lookahead. Ignores lines starting with //, /*, or * (JSDoc)
      // \b = word boundary enforcement
      const legacyExportRegex =
        /^(?!\s*\/\/|\s*\/\*|\s*\*).*?\bexport\s+let\b/m;
      const legacyReactiveRegex = /^(?!\s*\/\/|\s*\/\*|\s*\*).*?(?:^|\s)\$:\s/m;

      const hasExportLet = legacyExportRegex.test(contentToCheck);
      const hasReactiveStatement = legacyReactiveRegex.test(contentToCheck);

      if (hasExportLet || hasReactiveStatement) {
        const rejection: DecisionResponse = {
          decision: "deny",
          // CRITICAL: This reason acts as an immediate prompt injection to correct the agent's behavior.
          reason:
            "[SVELTE_5_CONSTRAINT_VIOLATION]: Legacy syntax ('export let' or '$:') detected. You MUST use Svelte 5 Runes ($state, $props, $derived, $effect).\n\nAGENT DIRECTIVE: This is a strict regex pre-flight check. If you are attempting to write a valid string literal (e.g., a tooltip) containing these characters, you must break up the string to bypass this security gate (e.g., use string concatenation like '$' + ': ').",
        };
        console.log(JSON.stringify(rejection));
        return;
      }
    }

    // Pass-through
    console.log(JSON.stringify({ decision: "allow" } as DecisionResponse));
  } catch (e) {
    // Fail-open to prevent workspace locking on unhandled JSON errors
    console.log(JSON.stringify({ decision: "allow" } as DecisionResponse));
  }
});
