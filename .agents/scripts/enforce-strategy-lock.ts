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

interface AntigravityPayload {
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
    const payload: AntigravityPayload = JSON.parse(inputData);
    const toolCall = payload.toolCall;

    if (!toolCall || !toolCall.args) {
      console.log(JSON.stringify({ decision: "allow" } as DecisionResponse));
      return;
    }

    const args = toolCall.args;
    const targetFile = args.TargetFile || "";

    // 1. Absolute Lock on Strategy.md
    if (targetFile.includes("Strategy.md")) {
      const confirmation: DecisionResponse = {
        decision: "ask",
        reason:
          "Strategy.md is a protected high-level context file. The human orchestrator must approve this update.",
      };
      console.log(JSON.stringify(confirmation));
      return;
    }

    // 2. Surgical Lock on Context.md (Sprint Chunk Protection)
    if (targetFile.includes("Context.md")) {
      const chunkHeader = "##### 🎯 Active Sprint Chunk:";

      if (toolCall.name === "write_to_file") {
        const newContent = args.CodeContent || "";
        // Ensure full file rewrites do not accidentally delete the Sprint Chunk
        if (!newContent.includes(chunkHeader)) {
          console.log(
            JSON.stringify({
              decision: "deny",
              reason: `Context.md rewrite rejected. You must preserve the '${chunkHeader}' block. You are not authorized to delete the sprint scope.`,
            }),
          );
          return;
        }
      } else if (
        toolCall.name === "replace_file_content" ||
        toolCall.name === "multi_replace_file_content"
      ) {
        const contentToCheck =
          args.ReplacementContent ||
          (args.ReplacementChunks || [])
            .map((c) => c.ReplacementContent)
            .join("\n");

        // If the targeted replacement block contains the Sprint Chunk header, escalate to Human Orchestrator
        if (contentToCheck.includes(chunkHeader)) {
          console.log(
            JSON.stringify({
              decision: "ask",
              reason:
                "Modification of the 'Active Sprint Chunk' detected in Context.md. Only the PM or Architect should alter this. Human approval required.",
            }),
          );
          return;
        }
      }
    }

    // Default to allow if constraints are not violated
    console.log(JSON.stringify({ decision: "allow" } as DecisionResponse));
  } catch (e) {
    // Fail-open to prevent pipeline blocking on JSON parse errors
    console.log(JSON.stringify({ decision: "allow" } as DecisionResponse));
  }
});
