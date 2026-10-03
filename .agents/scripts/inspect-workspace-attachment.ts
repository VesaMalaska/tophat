import { spawnSync } from 'node:child_process';
import { lstatSync, readFileSync, readdirSync, realpathSync } from 'node:fs';
import { resolve, relative, dirname, isAbsolute, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseTophatConfig, type TophatConfig, type ValidationCategory } from './load-tophat-config.ts';
import { canonical, digest, strictJson, isMain, inspectDocPackage, type DocReport } from './validate-doc-package.ts';

export class AttachmentError extends Error {
  readonly code: string;
  constructor(code: string, message: string) { super(message); this.code = code; }
}
export const stop = (code: string, message: string): never => { throw new AttachmentError(code, message); };
export const record = (v: unknown, label: string): Record<string, any> => {
  if (!v || typeof v !== 'object' || Array.isArray(v)) stop('ATTACHMENT_INPUT_INVALID', `${label} must be an object`);
  return v as Record<string, any>;
};
export function fields(v: Record<string, any>, required: string[], optional: string[], label: string): void {
  if (required.some(k => !Object.hasOwn(v, k)) || Object.keys(v).some(k => ![...required, ...optional].includes(k))) stop('ATTACHMENT_INPUT_INVALID', `${label} has missing or unknown fields`);
}
export const string = (v: unknown, label: string): string => { if (typeof v !== 'string' || !v.trim()) stop('ATTACHMENT_INPUT_INVALID', `${label} must be nonempty`); return v as string; };
export const sha = (v: unknown, label: string): string => { const s = string(v, label); if (!/^[a-f0-9]{64}$/.test(s)) stop('ATTACHMENT_INPUT_INVALID', `${label} must be SHA-256`); return s; };
export function paths(v: unknown, label: string): string[] {
  if (!Array.isArray(v)) stop('ATTACHMENT_INPUT_INVALID', `${label} must be an array`);
  const a = (v as unknown[]).map(x => relativeName(x));
  if (new Set(a.map(x => x.toLowerCase())).size !== a.length) stop('ATTACHMENT_PATH_COLLISION', `${label} contains colliding paths`);
  return a;
}
export function relativeName(v: unknown): string {
  const p = string(v, 'path');
  if (isAbsolute(p) || /^[A-Za-z]:/.test(p) || p.includes('\\') || /[\x00-\x1f\x7f]/.test(p) || p.split('/').some(x => !x || x === '.' || x === '..') || p === '.git' || p.startsWith('.git/')) stop('ATTACHMENT_PATH_INVALID', 'Path must be a safe relative host path');
  return p;
}
export const requiredInfrastructure = ['.agents/scripts/load-tophat-config.ts','.agents/scripts/run-validation.ts','.agents/scripts/validate-doc-package.ts','.agents/scripts/validate-task-authority.ts','.agents/scripts/finalize-doc-package.ts','.agents/scripts/inspect-workspace-attachment.ts','.agents/scripts/assess-attachment-baseline.ts','.agents/scripts/validate-workspace-attachment.ts','.agents/scripts/inspect-tophat-detachment.ts','.agents/scripts/install-git-hook.ts','.agents/scripts/update-hud.ts','.agents/scripts/watch-hud.ts','.agents/scripts/select-task-guidance.ts','.agents/scripts/classify-task.ts','.agents/scripts/inspect-role-session.ts','.agents/scripts/validate-qa-evidence.ts','.agents/schemas/doc-manifest.schema.json'];
export const supportedNode = (version: string): boolean => /^\d+\.\d+\.\d+$/.test(version) && Number(version.split('.')[0]) >= 24;
export const fingerprint = (v: unknown): string => digest(canonical(v));
export const strip = (v: Record<string, any>, names: string[]): Record<string, any> => Object.fromEntries(Object.entries(v).filter(([k]) => !names.includes(k)));
export const instant = (v: unknown, label: string): number => {
  const s = string(v, label), n = Date.parse(s);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(s) || !Number.isFinite(n) || new Date(n).toISOString() !== s) stop('ATTACHMENT_EVIDENCE_INVALID', `${label} must be an exact UTC timestamp`);
  return n;
};
export function git(root: string, args: string[]): string {
  const r = spawnSync('git', ['--no-optional-locks', ...args], { cwd: root, encoding: 'utf8', timeout: 10000, maxBuffer: 16 * 1024 * 1024 });
  if (r.error || r.status !== 0) stop('GIT_STATE_UNAVAILABLE', `Read-only Git ${args[0]} failed`);
  return r.stdout;
}
function gitOptional(root: string, args: string[]): string | null {
  const r = spawnSync('git', ['--no-optional-locks', ...args], { cwd: root, encoding: 'utf8', timeout: 10000, maxBuffer: 1024 * 1024 });
  if (r.error || (r.status !== 0 && r.status !== 1)) stop('GIT_STATE_UNAVAILABLE', `Read-only Git ${args[0]} failed`);
  return r.status === 0 ? r.stdout.trim() : null;
}
export function checkedPath(root: string, input: string): string {
  const p = relativeName(input); let current = root;
  for (const part of p.split('/')) {
    current = resolve(current, part);
    try { if (lstatSync(current).isSymbolicLink()) stop('ATTACHMENT_PATH_INVALID', `Symlink path denied: ${p}`); }
    catch (e) { if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e; }
  }
  const rel = relative(root, current);
  if (rel.startsWith('..' + sep) || rel === '..' || isAbsolute(rel)) stop('ATTACHMENT_PATH_INVALID', 'Path escapes host');
  return current;
}
export interface FileState { path: string; sha256: string | null; mode: number | null }
export function fileState(root: string, input: string): FileState {
  const full = checkedPath(root, input);
  try {
    const s = lstatSync(full); if (!s.isFile() || s.size > 32 * 1024 * 1024) stop('EVIDENCE_INCOMPLETE', `Required input is not a bounded regular file: ${input}`);
    return { path: input, sha256: digest(readFileSync(full)), mode: s.mode & 0o777 };
  } catch (e) { if ((e as NodeJS.ErrnoException).code === 'ENOENT') return { path: input, sha256: null, mode: null }; throw e; }
}
export function collate(names: string[]): void {
  const folded = new Map<string, string>();
  for (const name of names) {
    relativeName(name); const parts = name.split('/');
    for (let i = 1; i <= parts.length; i++) {
      const p = parts.slice(0, i).join('/'), low = p.toLowerCase(), prior = folded.get(low);
      if (prior && prior !== p) stop('ATTACHMENT_PATH_COLLISION', `Case-insensitive path collision: ${prior} / ${p}`);
      folded.set(low, p);
    }
  }
}
export function collectOutput(root: string, outputPaths: string[]): FileState[] {
  const result: FileState[] = [];
  const visit = (name: string, depth: number) => {
    if (depth > 32 || result.length >= 4096) stop('EVIDENCE_INCOMPLETE', 'Output inventory exceeds supported bounds');
    const full = checkedPath(root, name); let s;
    try { s = lstatSync(full); } catch (e) { if ((e as NodeJS.ErrnoException).code === 'ENOENT') return; throw e; }
    if (s.isDirectory()) for (const x of readdirSync(full).sort()) visit(`${name}/${x}`, depth + 1);
    else result.push(fileState(root, name));
  };
  for (const p of outputPaths) visit(p, 0);
  collate(result.map(x => x.path)); return result.sort((a,b) => a.path < b.path ? -1 : 1);
}
function managedFile(full: string): { sha256: string | null; executable: boolean } {
  try {
    const s = lstatSync(full); if (!s.isFile() || s.isSymbolicLink() || s.size > 1024 * 1024) stop('EVIDENCE_INCOMPLETE', 'Git integration is not a bounded regular file');
    return { sha256: digest(readFileSync(full)), executable: !!(s.mode & 0o111) };
  } catch (e) { if ((e as NodeJS.ErrnoException).code === 'ENOENT') return { sha256: null, executable: false }; throw e; }
}
export interface Snapshot {
  rootIdentity: string; commit: string; branch: string | null; index: string; trackedDiff: string;
  tracked: FileState[]; inputs: FileState[]; untracked: FileState[]; hooksPath: string | null;
  hook: { sha256: string | null; executable: boolean }; exclude: { sha256: string | null; executable: boolean };
  operations: string[]; history: string; globalExclude: { path: string | null; sha256: string | null };
}
export function snapshot(root: string, inputPaths: string[], outputPaths: string[] = []): Snapshot {
  const real = realpathSync(root), top = realpathSync(git(root, ['rev-parse','--show-toplevel']).trim());
  if (top !== real) stop('GIT_ROOT_MISMATCH', 'Choose the host repository root');
  const names = git(root, ['ls-files','-z']).split('\0').filter(Boolean); collate([...names, ...inputPaths]);
  if (names.length > 16384) stop('EVIDENCE_INCOMPLETE', 'Tracked inventory exceeds supported bounds');
  const total = [...new Set(names)].reduce((n,p)=>{try{return n+lstatSync(checkedPath(root,p)).size;}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return n;throw e;}},0);
  if(total>128*1024*1024)stop('EVIDENCE_INCOMPLETE','Tracked byte inventory exceeds 128 MiB');
  const tracked = [...new Set(names)].sort().map(p => fileState(root, p));
  if (tracked.length > 16384) stop('EVIDENCE_INCOMPLETE', 'Tracked inventory exceeds supported bounds');
  const outputs = (p: string) => outputPaths.some(o => p === o || p.startsWith(o + '/'));
  if (names.some(outputs)) stop('ATTACHMENT_OUTPUT_INVALID', 'Disposable output overlaps a tracked file');
  const untrackedNames = git(root, ['ls-files','--others','--exclude-standard','-z']).split('\0').filter(Boolean); collate([...names, ...untrackedNames, ...inputPaths]);
  const operations = ['MERGE_HEAD','rebase-merge','rebase-apply','CHERRY_PICK_HEAD','REVERT_HEAD','sequencer'].filter(p => {
    const full = resolve(root, git(root, ['rev-parse','--git-path', p]).trim());
    try { lstatSync(full); return true; } catch (e) { if ((e as NodeJS.ErrnoException).code === 'ENOENT') return false; throw e; }
  });
  const hook = resolve(root, git(root, ['rev-parse','--git-path','hooks/pre-commit']).trim());
  const exclude = resolve(root, git(root, ['rev-parse','--git-path','info/exclude']).trim());
  const globalPath=gitOptional(root,['config','--path','--get','core.excludesFile']);
  const globalExclude={path:globalPath,sha256:globalPath?managedFile(resolve(root,globalPath)).sha256:null};
  return { rootIdentity: digest(real), commit: git(root, ['rev-parse','HEAD']).trim(), branch: gitOptional(root, ['symbolic-ref','--quiet','--short','HEAD']),
    index: digest(git(root, ['ls-files','--stage','-z'])), trackedDiff: digest(git(root, ['diff','HEAD','--binary','--'])), tracked,
    inputs: [...new Set(inputPaths)].sort().map(p => fileState(root,p)), untracked: untrackedNames.filter(p => !outputs(p)).sort().map(p => fileState(root,p)),
    hooksPath: gitOptional(root, ['config','--get','core.hooksPath']), hook: managedFile(hook), exclude: managedFile(exclude), operations,
    history: digest(git(root, ['rev-list','--all'])), globalExclude };
}
export function cleanSnapshot(s: Snapshot, expectedBranch: string, inputPaths: string[]): void {
  if (!s.branch || s.branch !== expectedBranch) stop('GIT_BRANCH_DENIED', 'Expected attached branch is required');
  if (s.operations.length || s.trackedDiff !== digest('')) stop('GIT_STATE_DENIED', 'Tracked/index changes or active Git operation block assessment');
  const allowed = new Set(inputPaths);
  if (s.untracked.some(x => !allowed.has(x.path))) stop('UNCLASSIFIED_UNTRACKED_INPUT', 'Untracked input requires explicit classification');
}
export const categoriesFor = (config: TophatConfig): ValidationCategory[] => [...new Set([...config.validation.commitGate, ...config.validation.developmentPhaseGate, ...config.validation.projectCompletionGate])];
export type OwnershipClass = 'TOPHAT_OWNED_PRIVATE' | 'HOST_OWNED' | 'SHARED' | 'UNKNOWN';
export interface Ownership { path: string; classification: OwnershipClass; evidence: string; tracked: boolean; initialSha256: string | null }
export interface WriteEntry { path: string; operation: 'create' | 'replace'; priorSha256: string | null; content: string; sha256: string }
export interface InstallPlan { mode: 'tracked/shared' | 'local/private'; exclusions: string[]; hookDisposition: 'install' | 'verify' | 'manual-integration'; hookContent: string }
export interface Boundary { scopeIds: string[]; developmentPhaseId: string; sprintChunkId: string }
export interface Proposal {
  schemaVersion: 1; proposalId: string; sourceCommit: string; hostSnapshotFingerprint: string; facts: { snapshot: Snapshot; runtime: Facts };
  candidateConfig: Record<string, any>; documentation: DocReport; baseline: { categories: ValidationCategory[]; scripts: Array<{category: ValidationCategory; script: string; body: string}>; outputPaths: string[]; timeoutMs: number; maxBufferBytes: number; prerequisites: string[]; sideEffects: string[] };
  installation: InstallPlan; writePlan: WriteEntry[]; ownership: Ownership[]; developmentBoundary: Boundary; inputPaths: string[];
  blockers: string[]; humanDecisions: string[]; evidencePaths: string[]; createdAt: string; proposalFingerprint: string;
}
export interface Facts { node: string; pnpm: string | null; packageManager: string | null; typescript: boolean; pnpmLock: boolean; frameworks: string[]; legacyConfig: boolean; missingConfigSections: string[]; remotes: string[] }
function facts(root: string): Facts {
  const pkg = record(strictJson(readFileSync(checkedPath(root,'package.json'),'utf8'), 'package.json'), 'package.json');
  const deps = { ...pkg.dependencies, ...pkg.devDependencies }, names = Object.keys(deps);
  const pnpm = spawnSync('pnpm', ['--version'], { cwd: root, encoding:'utf8', timeout:10000, maxBuffer:65536, env:{...process.env,pnpm_config_verify_deps_before_run:'false',pnpm_config_manage_package_manager_versions:'false'} });
  let legacyConfig = false, missingConfigSections: string[] = [];
  try { const c = record(strictJson(readFileSync(checkedPath(root,'.agents/tophat.config.json'),'utf8'),'config'),'config');
    missingConfigSections = ['schemaVersion','workspace','documentation','validation'].filter(k => !Object.hasOwn(c,k));
    legacyConfig = !!c.routingMatrix && missingConfigSections.length > 0;
  } catch (e) { if ((e as NodeJS.ErrnoException).code !== 'ENOENT' && !(e instanceof AttachmentError)) { /* malformed config remains separate from legacy */ } }
  return { node: process.versions.node, pnpm: !pnpm.error && pnpm.status === 0 ? pnpm.stdout.trim() : null,
    packageManager: typeof pkg.packageManager === 'string' ? pkg.packageManager : null, typescript: names.includes('typescript') || fileState(root,'tsconfig.json').sha256 !== null,
    pnpmLock: fileState(root,'pnpm-lock.yaml').sha256 !== null, frameworks: ['svelte','@sveltejs/kit','react','next','electron','vue','nuxt'].filter(x=>names.includes(x)),
    legacyConfig, missingConfigSections, remotes: git(root,['remote','-v']).trim().split('\n').filter(Boolean).map(s=>s.replace(/(https?:\/\/)[^/@\s]+@/g,'$1[redacted]@')) };
}
function validatePlan(root: string, raw: Record<string, any>): { installation: InstallPlan; ownership: Ownership[]; writePlan: WriteEntry[]; boundary: Boundary } {
  const install = record(raw.installation,'installation'); fields(install,['mode','exclusions','hookDisposition','hookContent'],[],'installation');
  if (!['tracked/shared','local/private'].includes(install.mode) || !['install','verify','manual-integration'].includes(install.hookDisposition)) stop('ATTACHMENT_INPUT_INVALID','Invalid installation mode/hook disposition');
  const exclusions = paths(install.exclusions,'exclusions'); string(install.hookContent,'hookContent');
  if(install.mode==='tracked/shared'&&exclusions.length)stop('ATTACHMENT_EXCLUSION_DENIED','Shared mode must not exclude its inventory');
  if (exclusions.includes('.agents') || exclusions.some(p=>p==='docs'||p.startsWith('docs/'))) stop('ATTACHMENT_EXCLUSION_DENIED','Blanket private/public-directory exclusions are forbidden');
  if (!Array.isArray(raw.ownership) || !Array.isArray(raw.writePlan)) stop('ATTACHMENT_INPUT_INVALID','Ownership and write plans must be arrays');
  const tracked = new Set(git(root,['ls-files','-z']).split('\0'));
  const ownership: Ownership[] = raw.ownership.map((x:unknown)=>{
    const v=record(x,'ownership');fields(v,['path','classification','evidence','tracked','initialSha256'],[],'ownership');const p=relativeName(v.path);
    if (!['TOPHAT_OWNED_PRIVATE','HOST_OWNED','SHARED','UNKNOWN'].includes(v.classification) || typeof v.tracked!=='boolean') stop('ATTACHMENT_INPUT_INVALID','Invalid ownership');
    string(v.evidence,'ownership evidence'); if(v.initialSha256!==null)sha(v.initialSha256,'initialSha256');
    if(v.tracked!==tracked.has(p)||v.initialSha256!==fileState(root,p).sha256)stop('ATTACHMENT_OWNERSHIP_STALE','Ownership must describe current files');return {...v,path:p} as Ownership;
  }); paths(ownership.map(x=>x.path),'ownership');
  const writePlan: WriteEntry[] = raw.writePlan.map((x:unknown)=>{
    const v=record(x,'writePlan');fields(v,['path','operation','priorSha256','content','sha256'],[],'writePlan'); const p=relativeName(v.path);
    if (!p.startsWith('.agents/') && !['Context.md','Strategy.md','Roadmap.md','HUD.md'].includes(p)) stop('ATTACHMENT_WRITE_DENIED','Attachment cannot write product files');
    if(p.startsWith('.agents/attachment/'))stop('ATTACHMENT_WRITE_DENIED','Evidence is derived after approval, not self-referential write content');
    if(!['create','replace'].includes(v.operation)||typeof v.content!=='string')stop('ATTACHMENT_INPUT_INVALID','Invalid write');
    sha(v.sha256,'write sha256'); const prior=fileState(root,p).sha256;
    if(v.sha256!==digest(v.content)||v.priorSha256!==prior||(v.operation==='create')!==(prior===null))stop('ATTACHMENT_WRITE_STALE','Write digests/operation do not match current files');
    const owner=ownership.find(o=>o.path===p);if(!owner||owner.classification!=='TOPHAT_OWNED_PRIVATE')stop('ATTACHMENT_OWNERSHIP_DENIED','Every write needs confirmed private ownership');return {...v,path:p} as WriteEntry;
  }); paths(writePlan.map(x=>x.path),'writePlan');if(writePlan.some(w=>writePlan.some(other=>other!==w&&other.path.startsWith(w.path+'/'))))stop('ATTACHMENT_PATH_COLLISION','File write destinations cannot contain each other');collate([...ownership.map(x=>x.path),...writePlan.map(x=>x.path)]);
  if(exclusions.some(p=>!ownership.some(x=>x.path===p&&x.classification==='TOPHAT_OWNED_PRIVATE')))stop('ATTACHMENT_EXCLUSION_DENIED','Exclusions require exact private ownership');
  if(install.mode==='local/private'&&exclusions.some(p=>tracked.has(p)))stop('ATTACHMENT_EXCLUSION_DENIED','Exclusions cannot privatize already-tracked files');
  const b=record(raw.developmentBoundary,'developmentBoundary');fields(b,['scopeIds','developmentPhaseId','sprintChunkId'],[],'developmentBoundary');
  const scopeIds=paths(b.scopeIds,'scopeIds'); if(!scopeIds.length)stop('ATTACHMENT_SCOPE_INVALID','Scope is required');string(b.developmentPhaseId,'developmentPhaseId');string(b.sprintChunkId,'sprintChunkId');
  return {installation:{...install,exclusions} as InstallPlan,ownership,writePlan,boundary:{...b,scopeIds} as Boundary};
}
export function validateProposal(value: unknown): Proposal {
  const p=record(value,'proposal');fields(p,['schemaVersion','proposalId','sourceCommit','hostSnapshotFingerprint','facts','candidateConfig','documentation','baseline','installation','writePlan','ownership','developmentBoundary','inputPaths','blockers','humanDecisions','evidencePaths','createdAt','proposalFingerprint'],[],'proposal');
  if(p.schemaVersion!==1)stop('ATTACHMENT_VERSION_INVALID','Unsupported proposal version');sha(p.proposalFingerprint,'proposalFingerprint');
  if(p.proposalFingerprint!==fingerprint(strip(p,['proposalFingerprint','createdAt'])))stop('ATTACHMENT_PROPOSAL_STALE','Proposal fingerprint mismatch');
  return p as Proposal;
}
export function configFor(p: Proposal): TophatConfig { return parseTophatConfig(JSON.stringify(p.candidateConfig)); }
export function discover(root: string, input: unknown): { schemaVersion: 1; status: string; facts?: Facts; proposal?: Proposal; issues: string[] } {
  try {
    const raw=record(input,'discovery');fields(raw,[],['proposalId','sourceCommit','candidateConfig','inputPaths','outputPaths','timeoutMs','maxBufferBytes','prerequisites','sideEffects','installation','writePlan','ownership','developmentBoundary','blockers','humanDecisions'],'discovery');
    const f=facts(root);if(!raw.candidateConfig)return {schemaVersion:1,status:'DISCOVERY_REQUIRES_DECISION',facts:f,issues:['Supply an explicit supported candidate contract and exact plan; discovery has executed no host scripts']};
    fields(raw,['proposalId','sourceCommit','candidateConfig','inputPaths','outputPaths','timeoutMs','maxBufferBytes','prerequisites','sideEffects','installation','writePlan','ownership','developmentBoundary','blockers','humanDecisions'],[],'discovery');
    const id=string(raw.proposalId,'proposalId');if(!/^[A-Za-z][A-Za-z0-9._-]*$/.test(id)||!/^[a-f0-9]{40}$/.test(raw.sourceCommit))stop('ATTACHMENT_INPUT_INVALID','Invalid proposal/source identity');
    const config=parseTophatConfig(JSON.stringify(raw.candidateConfig));const inputPaths=paths(raw.inputPaths,'inputPaths'),outputPaths=paths(raw.outputPaths,'outputPaths');
    if(!Number.isSafeInteger(raw.timeoutMs)||raw.timeoutMs<1||raw.timeoutMs>600000||!Number.isSafeInteger(raw.maxBufferBytes)||raw.maxBufferBytes<1024||raw.maxBufferBytes>1024*1024)stop('ATTACHMENT_INPUT_INVALID','Use timeout 1..600000ms and output buffer 1024..1048576 bytes');
    for(const name of ['prerequisites','sideEffects','blockers','humanDecisions']){if(!Array.isArray(raw[name]))stop('ATTACHMENT_INPUT_INVALID',`${name} must be an array`);raw[name].forEach((x:unknown)=>string(x,name));}
    const plan=validatePlan(root,raw);
    const canonicalHook=readFileSync(resolve(dirname(fileURLToPath(import.meta.url)),'../git-hooks/pre-commit'),'utf8');
    if(plan.installation.hookContent!==canonicalHook)stop('ATTACHMENT_HOOK_SOURCE_INVALID','Hook content must match the versioned source');
    const sourceHookWrite=plan.writePlan.find(w=>w.path==='.agents/git-hooks/pre-commit');
    if(sourceHookWrite?sourceHookWrite.content!==canonicalHook:fileState(root,'.agents/git-hooks/pre-commit').sha256!==digest(canonicalHook))stop('ATTACHMENT_WRITE_PLAN_INCOMPLETE','Versioned native hook source is required');
    for(const path of requiredInfrastructure){const canonicalBytes=readFileSync(resolve(dirname(fileURLToPath(import.meta.url)),'../..',path));const entry=plan.writePlan.find(w=>w.path===path);if(entry?entry.sha256!==digest(canonicalBytes):fileState(root,path).sha256!==digest(canonicalBytes))stop('ATTACHMENT_INFRASTRUCTURE_INCOMPLETE',`Required versioned tooling is missing or differs: ${path}`);}
    const protectedInputs=[...new Set([...inputPaths,...requiredInfrastructure,...plan.writePlan.map(x=>x.path),...plan.ownership.map(x=>x.path), 'package.json','pnpm-lock.yaml','pnpm-workspace.yaml','tsconfig.json','.agents/tophat.config.json'])];
    // The selected public package's files, including ignored/untracked files, are always snapshot inputs.
    const docs=inspectDocPackage(root,'approved',undefined,config);
    if(docs.snapshot)protectedInputs.push(...['manifest.schema.json','README.md',config.documentation.manifest,...docs.snapshot.manifest.documents.map(d=>d.path)].map(p=>`${docs.snapshot!.packagePath}/${p}`));
    const evidencePaths=['proposal.json','assessment.json','authorization.json','approval.json','ownership.json','completion.json'].map(x=>`.agents/attachment/${id}/${x}`);
    if(evidencePaths.some(path=>fileState(root,path).sha256!==null))stop('ATTACHMENT_EVIDENCE_COLLISION','Use a new attachment identity; preserve previous evidence');
    protectedInputs.push(...evidencePaths);
    const inputs=[...new Set(protectedInputs)].sort();
    if(outputPaths.some(o=>o==='.agents'||o.startsWith('.agents/')||o==='docs'||o.startsWith('docs/')||inputs.some(p=>p===o||p.startsWith(o+'/'))))stop('ATTACHMENT_OUTPUT_INVALID','Output roots cannot overlap private state or required inputs');
    const s=snapshot(root,inputs,outputPaths);const categories=categoriesFor(config);
    const pkg=record(strictJson(readFileSync(checkedPath(root,'package.json'),'utf8'),'package.json'),'package.json'),scripts=record(pkg.scripts??{},'scripts');
    const selected=categories.map(category=>({category,script:config.validation.scripts[category]!,body:typeof scripts[config.validation.scripts[category]!] === 'string'?scripts[config.validation.scripts[category]!]:''}));
    const blockers=[...raw.blockers];if(!supportedNode(f.node))blockers.push('NODE_VERSION_UNSUPPORTED');if(!f.pnpm)blockers.push('COMMAND_UNAVAILABLE: pnpm');if(!f.typescript||!f.pnpmLock)blockers.push('WORKSPACE_EVIDENCE_INCOMPLETE');
    const expected=config.workspace.framework==='sveltekit'?'@sveltejs/kit':config.workspace.framework==='nextjs'?'next':config.workspace.framework;
    if(f.frameworks.includes('svelte')&&f.frameworks.includes('react'))blockers.push('WORKSPACE_EVIDENCE_AMBIGUOUS');
    if((expected!=='none'&&!f.frameworks.includes(expected))||(config.workspace.kind==='desktop'&&!f.frameworks.includes('electron'))||f.frameworks.some(x=>['vue','nuxt'].includes(x)))blockers.push('WORKSPACE_EVIDENCE_CONFLICT');
    if(docs.report.status!=='APPROVED_VALID')blockers.push('DOCUMENTATION_REQUIRES_PREPARATION');
    if(plan.boundary.scopeIds.some(x=>!docs.snapshot?.manifest.scope.active.includes(x)))blockers.push('ATTACHMENT_SCOPE_INVALID');
    if(selected.some(x=>!x.body))blockers.push('SCRIPT_MISSING');
    const required=['.agents/tophat.config.json','Context.md','Strategy.md','Roadmap.md','HUD.md'];if(required.some(p=>!plan.writePlan.some(x=>x.path===p)))blockers.push('ATTACHMENT_WRITE_PLAN_INCOMPLETE');
    const cfgWrite=plan.writePlan.find(x=>x.path==='.agents/tophat.config.json');if(cfgWrite&&canonical(strictJson(cfgWrite.content,'config write'))!==canonical(raw.candidateConfig))blockers.push('ATTACHMENT_CONFIG_WRITE_MISMATCH');
    try{cleanSnapshot(s, s.branch??'',inputs);}catch(e){blockers.push((e as AttachmentError).code);}
    const proposed={schemaVersion:1 as const,proposalId:id,sourceCommit:raw.sourceCommit,hostSnapshotFingerprint:fingerprint(s),facts:{snapshot:s,runtime:f},candidateConfig:raw.candidateConfig,documentation:docs.report,
      baseline:{categories,scripts:selected,outputPaths,timeoutMs:raw.timeoutMs,maxBufferBytes:raw.maxBufferBytes,prerequisites:raw.prerequisites,sideEffects:raw.sideEffects},installation:plan.installation,writePlan:plan.writePlan,ownership:plan.ownership,developmentBoundary:plan.boundary,inputPaths:inputs,
      blockers:[...new Set(blockers)],humanDecisions:raw.humanDecisions,evidencePaths,createdAt:new Date().toISOString(),proposalFingerprint:''};
    proposed.proposalFingerprint=fingerprint(strip(proposed,['proposalFingerprint','createdAt']));
    return {schemaVersion:1,status:blockers.length||raw.humanDecisions.length?'DISCOVERY_REQUIRES_DECISION':'BASELINE_AWAITING_AUTHORIZATION',facts:f,proposal:proposed,issues:proposed.blockers};
  }catch(e){return {schemaVersion:1,status:'DENIED',issues:[`${e instanceof AttachmentError?e.code:'DISCOVERY_FAILED'}: ${e instanceof Error?e.message:'Inspection failed'}`]};}
}
export function proposalInput(p: Proposal): Record<string, any> {
  return { proposalId:p.proposalId,sourceCommit:p.sourceCommit,candidateConfig:p.candidateConfig,inputPaths:p.inputPaths,outputPaths:p.baseline.outputPaths,timeoutMs:p.baseline.timeoutMs,maxBufferBytes:p.baseline.maxBufferBytes,prerequisites:p.baseline.prerequisites,sideEffects:p.baseline.sideEffects,
    installation:p.installation,writePlan:p.writePlan,ownership:p.ownership,developmentBoundary:p.developmentBoundary,blockers:[],humanDecisions:[] };
}
export function freshProposal(root:string,p:Proposal):void {
  validateProposal(p);const fresh=discover(root,proposalInput(p));
  if(!fresh.proposal||fresh.proposal.proposalFingerprint!==p.proposalFingerprint)stop('ATTACHMENT_PROPOSAL_STALE','Current host, contract, documentation, or write plan differs');
  if(p.blockers.length||p.humanDecisions.length)stop('ATTACHMENT_DISCOVERY_BLOCKED','Discovery decisions must be resolved in a new proposal');
}
export function cli(operation:(root:string,input:unknown)=>any):void {
  let result:any;try{result=operation(process.cwd(),strictJson(process.argv[2]??readFileSync(0,'utf8'),'request'));}catch(e){result={schemaVersion:1,status:'DENIED',issues:[e instanceof Error?e.message:'Invalid input']};}
  console.log(JSON.stringify(result));if(['DENIED','DISCOVERY_REQUIRES_DECISION','BASELINE_REQUIRES_DECISION','ATTACHMENT_INVALIDATED'].includes(result.status))process.exitCode=1;
}
if(isMain(import.meta.url))cli(discover);
