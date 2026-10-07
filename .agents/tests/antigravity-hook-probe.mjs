// Disposable transport diagnostics only; never changes an existing host or global IDE configuration.
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';
const args = process.argv.slice(2);
let base, relative = false;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--relative' && !relative) relative = true;
  else if (args[i] === '--base' && !base && args[i + 1]) base = resolve(args[++i]);
  else throw Error('Use optional --base <prior-probe> and --relative exactly once');
}
if (!base) base = mkdtempSync(join(tmpdir(), 'tophat-live-probe-'));
else {
  if (!existsSync(join(base, 'tophat-probe-marker.json')) || realpathSync(base) !== base) throw Error('Choose an existing disposable probe created by this script');
  const marker = JSON.parse(readFileSync(join(base, 'tophat-probe-marker.json'), 'utf8'));
  if (marker.schemaVersion !== 1 || marker.purpose !== 'tophat-hook-transport-probe') throw Error('Invalid probe marker');
}
const workspace = join(base, 'workspace'), evidence = join(base, 'evidence'), scripts = join(workspace, '.agents/scripts');
mkdirSync(scripts, { recursive: true }); mkdirSync(evidence, { recursive: true });
writeFileSync(join(base, 'tophat-probe-marker.json'), JSON.stringify({ schemaVersion: 1, purpose: 'tophat-hook-transport-probe' }) + '\n');
const script = join(scripts, 'probe.cjs');
writeFileSync(script, `const fs = require('node:fs');
const path = require('node:path');
const event = process.argv[2], evidence = process.argv[3];
let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => raw += chunk);
process.stdin.on('end', () => {
  let payload, output;
  try {
    payload = JSON.parse(raw);
    const call = payload.toolCall;
    if (!call || !call.args || typeof call.name !== 'string') throw Error('bad payload');
    const text = String(call.args.CommandLine || '') + ' ' + path.basename(String(call.args.TargetFile || ''));
    output = event === 'post' ? {} : {
      decision: text.includes('TOPHAT_DENY') || text.includes('deny-sentinel.txt') ? 'deny' : text.includes('force-ask-sentinel.txt') ? 'force_ask' : 'allow',
      reason: 'Disposable TopHat transport probe'
    };
  } catch { output = event === 'post' ? {} : {decision:'deny',reason:'Invalid diagnostic input'}; }
  const record = {event,at:new Date().toISOString(),cwd:process.cwd(),execPath:process.execPath,node:process.version,script:__filename,hasAntigravityCmd:Object.hasOwn(process.env,'ANTIGRAVITY_CMD'),raw,payload,output};
  fs.appendFileSync(path.join(evidence,'trace.jsonl'),JSON.stringify(record)+'\\n',{mode:0o600});
  process.stdout.write(JSON.stringify(output)+'\\n');
});
`);
const quote = value => "'" + value.replaceAll("'", "'\\''") + "'";
const launch = relative ? './scripts/probe.cjs' : script;
const handler = event => ({ type: 'command', command: `node ${quote(launch)} ${event} ${quote(evidence)}`, timeout: 10 });
const matcher = '^(run_command|write_to_file|replace_file_content|multi_replace_file_content)$';
const hooks = { 'tophat-diagnostic': { enabled: true, PreToolUse: [{ matcher, hooks: [handler('pre')] }], PostToolUse: [{ matcher, hooks: [handler('post')] }] } };
const body = JSON.stringify(hooks, null, 2) + '\n';
writeFileSync(join(workspace, '.agents/hooks.json'), body);
const digest = createHash('sha256').update(body).digest('hex');
// Retain both launch configurations for comparison; do not replace trace history.
writeFileSync(join(evidence, `hooks-${digest}.json`), body);
console.log(JSON.stringify({ base, workspace, evidence, mode: relative ? 'relative' : 'absolute', hooksSha256: digest }, null, 2));
