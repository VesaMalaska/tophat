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

        const args = toolCall.args;
        const targetFile = args.TargetFile || '';
        let contentToCheck = '';

        if (toolCall.name === 'write_to_file') {
            contentToCheck = args.CodeContent || '';
        } else if (toolCall.name === 'replace_file_content') {
            contentToCheck = args.ReplacementContent || '';
        } else if (toolCall.name === 'multi_replace_file_content') {
            contentToCheck = (args.ReplacementChunks || [])
                .map(c => c.ReplacementContent)
                .join('\n');
        }

        if (targetFile.endsWith('.svelte')) {
            const hasExportLet = contentToCheck.includes('export let ');
            const hasReactiveStatement = contentToCheck.includes('$: ');

            if (hasExportLet || hasReactiveStatement) {
                const rejection: DecisionResponse = {
                    decision: 'deny',
                    reason: "Svelte 4 legacy syntax ('export let' or '$:') detected. You must use Svelte 5 Runes ($state, $props, $derived, $effect)."
                };
                console.log(JSON.stringify(rejection));
                return;
            }
        }

        console.log(JSON.stringify({ decision: 'allow' } as DecisionResponse));

    } catch (e) {
        // Fail-open
        console.log(JSON.stringify({ decision: 'allow' } as DecisionResponse));
    }
});