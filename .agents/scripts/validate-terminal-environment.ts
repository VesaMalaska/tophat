import type { TophatConfig } from './load-tophat-config.ts';
import {record,fields,text,array,fail} from './classify-task.ts';
export const terminalViewportReason = 'Terminal dimensions are recorded exclusively in environment.terminal.sizes.';
export interface ObservedValue { value: string|null; reason: string|null }
export interface TerminalEnvironment {
 mode:'cli'|'tui'; terminalIdentity:string; term:ObservedValue; locale:ObservedValue;
 runtimeInvocation:string; nativeDependencies:string; ttyMode:'native'|'pty'|'non-tty';
 sizes:{rows:number;columns:number}[]; sizeReason:string|null; captureLimitations:string;
}
export function checkedTerminalEnvironment(environment: Record<string,unknown>): void {
 if(environment.workspaceKind !== 'terminal') {
  if(Object.hasOwn(environment,'terminal'))fail('QA_EVIDENCE_INVALID','Terminal metadata forbidden for nonterminal report');
  return;
 }
 const t=record(environment.terminal,'terminal environment');
 fields(t,['mode','terminalIdentity','term','locale','runtimeInvocation','nativeDependencies','ttyMode','sizes','sizeReason','captureLimitations']);
 if(!['cli','tui'].includes(t.mode as string)||!['native','pty','non-tty'].includes(t.ttyMode as string))fail('QA_EVIDENCE_INVALID','Invalid terminal mode or TTY mode');
 const id=text(t.terminalIdentity),normalized=id.toLowerCase().replace(/\s+/gu,' ');
 if(id!==id.trim()||[...id].length<3||[...id].length>256||/[\u0000-\u001f\u007f-\u009f]/u.test(id)||/^[<\[].*[>\]]$/u.test(id)||['unknown','none','n/a','na','not applicable','yes','no','unspecified','unverified','unavailable','null','tbd','todo'].includes(normalized))fail('QA_EVIDENCE_INVALID','Terminal identity is malformed or placeholder');
 for(const key of ['term','locale']) {
  const o=record(t[key],key);fields(o,['value','reason']);
  if(o.value===null)text(o.reason);else {text(o.value);if(o.reason!==null)fail('QA_EVIDENCE_INVALID','Observed terminal value has a reason');}
 }
 for(const key of ['runtimeInvocation','nativeDependencies','captureLimitations'])text(t[key]);
 const sizes=array(t.sizes);if(sizes.length>32)fail('QA_EVIDENCE_INVALID','Too many terminal dimensions');const seen=new Set<string>();
 for(const raw of sizes){const d=record(raw,'terminal size');fields(d,['rows','columns']);for(const k of ['rows','columns'])if(!Number.isSafeInteger(d[k])||(d[k] as number)<1||(d[k] as number)>10000)fail('QA_EVIDENCE_INVALID','Invalid terminal dimensions');const key=`${d.rows}:${d.columns}`;if(seen.has(key))fail('QA_EVIDENCE_INVALID','Duplicate terminal dimensions');seen.add(key);}
 if(sizes.length){if(t.sizeReason!==null)fail('QA_EVIDENCE_INVALID','Terminal size reason contradicts observed sizes');}else text(t.sizeReason);
 if(!Array.isArray(environment.viewports)||environment.viewports.length||environment.viewportsReason!==terminalViewportReason)fail('QA_EVIDENCE_INVALID','Terminal dimensions belong only in terminal.sizes');
}
/** Actual host configuration, not a report label, owns applicability. */
export function verifyTerminalEnvironment(environment:Record<string,unknown>, config:TophatConfig, methods:readonly string[]):void {
 checkedTerminalEnvironment(environment);
 if(environment.workspaceKind!==config.workspace.kind||environment.framework!==config.workspace.framework)fail('QA_EVIDENCE_INVALID','Report host profile differs from configuration');
 if(config.workspace.kind!=='terminal')return;
 const t=environment.terminal as unknown as TerminalEnvironment;
 if(t.mode!==config.workspace.mode)fail('QA_EVIDENCE_INVALID','Terminal report mode differs from host');
 if(methods.some(m=>['visual','responsive','accessibility','human-design'].includes(m))&&t.mode!=='tui')fail('QA_METHOD_INCOMPATIBLE','CLI cannot claim screen presentation QA');
 if(environment.available===true&&t.mode==='tui') {
  if(t.ttyMode==='non-tty')fail('QA_EVIDENCE_INVALID','Available TUI evidence requires native terminal or PTY');
  if(methods.some(m=>['visual','responsive'].includes(m))&&!t.sizes.length)fail('QA_EVIDENCE_INVALID','TUI presentation requires observed cell dimensions');
 }
}
