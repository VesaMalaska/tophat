interface ToolCallArgs {
    TargetFile?: string;
}

interface ToolCall {
    name: string;
    args?: ToolCallArgs;
}

interface AntigravityPayload {
    toolCall?: ToolCall;
}

interface DecisionResponse {
    decision: 'allow' | 'deny' | 'ask';
    reason?: string;
}

let inputData: string = '';

process.stdin.on('data', (chunk: Buffer | string) => {
    inputData += chunk.toString();
});

process.stdin.on('end', () => {
    try {
        const payload: AntigravityPayload = JSON.parse(inputData);
        const toolCall = payload.toolCall;

        if (!toolCall || !toolCall.args) {
            console.log(JSON.stringify({ decision: 'allow' } as DecisionResponse));
            return;
        }

        const targetFile = toolCall.args.TargetFile || '';

        if (targetFile.includes('Strategy.md')) {
            const confirmation: DecisionResponse = {
                decision: 'ask',
                reason: "Strategy.md is a protected high-level context file. The human orchestrator must approve this update."
            };
            console.log(JSON.stringify(confirmation));
            return;
        }

        console.log(JSON.stringify({ decision: 'allow' } as DecisionResponse));

    } catch (e) {
        console.log(JSON.stringify({ decision: 'allow' } as DecisionResponse));
    }
});