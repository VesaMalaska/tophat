import { lstatSync, readFileSync, readdirSync, realpathSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { strictJson } from './validate-doc-package.ts';
import { loadTophatConfig } from './load-tophat-config.ts';
export interface Command { name: string; state: 'active'|'retired'; entryPath: string|null; modelKey: string|null; inputContract:{kind:string;required:boolean;description:string}; roleRules:string[]; mandatoryResources:string[]; actors:{proposal:string;checks:string;writes:string;externalActions:string}; gitClassification:string; replacementCommands:string[]; summary:string }
export interface Catalog { schemaVersion:1; commands:Command[]; guidanceSkills:{name:string;entryPath:string}[] }
const fail=(message:string):never=>{throw new Error(message)};
function read(root:string,path:string):string {
 if(isAbsolute(path)||/^[A-Za-z]:/.test(path)||/[\\\x00-\x1f\x7f]/.test(path)||path.split('/').some(x=>!x||x==='.'||x==='..'))fail(`Unsafe resource path: ${path}`);
 let full=root;for(const part of path.split('/')){full=resolve(full,part);if(lstatSync(full).isSymbolicLink())fail(`Symlink resource denied: ${path}`);}
 const stat=lstatSync(full);if(!stat.isFile()||stat.size>1024*1024)fail(`Not a bounded regular resource: ${path}`);
 return readFileSync(full,'utf8');
}
function shape(value:any,schema:any,path:string):void {
 if(schema.const!==undefined&&value!==schema.const)fail(`${path}: wrong constant`);
 if(schema.enum&&!schema.enum.includes(value))fail(`${path}: unsupported value`);
 if(schema.type){const types=Array.isArray(schema.type)?schema.type:[schema.type];const actual=value===null?'null':Array.isArray(value)?'array':typeof value;if(!types.includes(actual))fail(`${path}: wrong type`);}
 if(typeof value==='string'){if(value.length<(schema.minLength??0)||value.length>(schema.maxLength??4096)||(schema.pattern&&!new RegExp(schema.pattern).test(value)))fail(`${path}: invalid string`);}
 if(Array.isArray(value)){if(value.length<(schema.minItems??0)||value.length>(schema.maxItems??256))fail(`${path}: invalid length`);if(schema.uniqueItems&&new Set(value.map(x=>JSON.stringify(x))).size!==value.length)fail(`${path}: duplicate values`);value.forEach((v,i)=>shape(v,schema.items,`${path}[${i}]`));}
 if(value&&typeof value==='object'&&!Array.isArray(value)){if(schema.additionalProperties!==false)fail(`${path}: schema must be closed`);for(const k of schema.required??[])if(!Object.hasOwn(value,k))fail(`${path}: missing ${k}`);for(const k of Object.keys(value)){if(!schema.properties[k])fail(`${path}: unknown ${k}`);shape(value[k],schema.properties[k],`${path}.${k}`);}}
}
function skillMetadata(body:string,name:string,path:string):void {
 const header=body.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
 if(!header||header[1].length>2048)fail(`Missing/bounded frontmatter required: ${path}`);
 const lines=header[1].split(/\r?\n/),fields=new Map<string,string>();
 for(const line of lines){const m=line.match(/^(name|description): (.+)$/);if(!m||fields.has(m[1]))fail(`Unsupported/duplicate skill metadata: ${path}`);fields.set(m[1],m[2]);}
 if(fields.size!==2||fields.get('name')!==name)fail(`Skill name mismatch: ${path}`);
 const raw=fields.get('description')!;let description:string;
 if(raw.startsWith('"')){try{description=JSON.parse(raw);if(typeof description!=='string')fail('Description must be text');}catch{fail(`Invalid quoted description: ${path}`);}}
 else if(raw.startsWith("'")){if(!/^'(?:[^']|'')*'$/.test(raw))fail(`Invalid quoted description: ${path}`);description=raw.slice(1,-1).replaceAll("''", "'");}
 else {if(/^[#\[\]{}|>!&*@%`]|:\s|\s#/.test(raw)||/^(?:true|false|null|yes|no|on|off|~|[-+]?(?:\d.*|\.inf|\.nan))$/i.test(raw))fail(`Unsupported plain description: ${path}`);description=raw;}
 if(!description.trim()||description.length>1024)fail(`Invalid description: ${path}`);
}
/** Read-only pinned source inspection; existence/metadata cannot prove instruction semantics or invocation. */
export function loadCommandCatalog(rootInput:string, allowCustomSkills=false):Catalog {
 const root=realpathSync(rootInput),schema=strictJson(read(root,'.agents/schemas/command-catalog.schema.json')) as any;
 const catalog=strictJson(read(root,'.agents/docs/command-catalog.json')) as unknown as Catalog;
 shape(catalog,schema,'catalog');
 const names=catalog.commands.map(x=>x.name),guidance=catalog.guidanceSkills.map(x=>x.name);
 const expected=schema.properties.commands.items.properties.name.enum;
 if(new Set(names).size!==names.length||expected.some((n:string)=>!names.includes(n)))fail('Missing/duplicate command identity');
 const expectedGuidance=schema.properties.guidanceSkills.items.properties.name.enum;
 if(new Set(guidance).size!==guidance.length||expectedGuidance.some((n:string)=>!guidance.includes(n))||guidance.some(n=>names.includes(n)))fail('Missing/duplicate/colliding guidance identity');
 const entries:string[]=[];
 for(const c of catalog.commands){
  if(c.state==='retired'){if(c.name!=='generate-readme'||c.entryPath!==null||c.modelKey!==null||!c.replacementCommands.length||c.roleRules.length||c.mandatoryResources.length)fail('Invalid retired entry');}
  else {if(c.name==='generate-readme'||c.entryPath!==`.agents/skills/${c.name}/SKILL.md`||c.modelKey!==`/${c.name}`||c.replacementCommands.length)fail(`Invalid active entry: ${c.name}`);entries.push(c.entryPath);
    const body=read(root,c.entryPath);
    for(const match of body.matchAll(/\.agents\/templates\/[A-Za-z0-9_./-]+\//g)) {
      const directory=match[0];if(directory.split('/').slice(0,-1).some(p=>!p||p==='.'||p==='..'))fail('Unsafe template directory');let current=root;for(const part of directory.split('/').filter(Boolean)){current=resolve(current,part);if(lstatSync(current).isSymbolicLink())fail('Template directory symlink denied');}let count=0;const walk=(path:string,depth=0):void=>{if(depth>8)fail('Template depth exceeds bound');for(const name of readdirSync(resolve(root,path))){if(++count>256)fail('Template inventory exceeds bound');const p=path+name,stat=lstatSync(resolve(root,p));if(stat.isSymbolicLink())fail('Template symlink denied');if(stat.isDirectory())walk(p+'/',depth+1);else if(!c.mandatoryResources.includes(p))fail(`Undeclared template resource: ${p}`);}};walk(directory);
    }
    for(const match of body.matchAll(/\.agents\/(?:docs|scripts|rules|schemas)\/[A-Za-z0-9_./-]+\.(?:ts|md|json)/g)) {
      const resource=match[0];if(resource.startsWith('.agents/rules/')?!c.roleRules.includes(resource):!c.mandatoryResources.includes(resource))fail(`Undeclared required resource: ${c.name} / ${resource}`);
    }
  }
  for(const n of c.replacementCommands)if(!catalog.commands.some(x=>x.name===n&&x.state==='active'))fail('Dangling replacement');
  for(const p of c.roleRules){if(!/^\.agents\/rules\/[^/]+\.md$/.test(p))fail('Invalid role rule path');read(root,p);}
  for(const p of c.mandatoryResources)read(root,p);
 }
 for(const g of catalog.guidanceSkills){if(g.entryPath!==`.agents/skills/${g.name}/SKILL.md`)fail('Invalid guidance path');entries.push(g.entryPath);}
 const actual=readdirSync(resolve(root,'.agents/skills')).sort(),expectedSkills=[...names.filter(n=>n!=='generate-readme'),...guidance].sort();if(actual.includes('generate-readme')||expectedSkills.some(n=>!actual.includes(n))||(!allowCustomSkills&&JSON.stringify(actual)!==JSON.stringify(expectedSkills)))fail('Uncatalogued/missing skill directories');
 try{if(readdirSync(resolve(root,'.agents/workflows')).some(x=>x.endsWith('.md')&&(!allowCustomSkills||names.includes(x.slice(0,-3)))))fail('Active legacy workflows remain');}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}
 const folded=new Map<string,string>();
 for(const path of [...entries,...catalog.commands.flatMap(c=>[...c.roleRules,...c.mandatoryResources])]) {
  const parts=path.split('/');for(let i=1;i<=parts.length;i++){const name=parts.slice(0,i).join('/'),key=name.toLowerCase(),previous=folded.get(key);if(previous&&previous!==name)fail(`Case-folded resource collision: ${path}`);folded.set(key,name);}
 }
 for(const p of entries)skillMetadata(read(root,p),p.split('/')[2],p);
 return catalog;
}
/** Packaging closure includes transitive local module imports and explicit shared resources. No runtime interpreter. */
export function catalogResources(rootInput:string, allowCustomSkills=false):string[] {
 const root=realpathSync(rootInput),c=loadCommandCatalog(root,allowCustomSkills),todo=['.agents/hooks.json','.agents/scripts/antigravity-hook.ts','.agents/docs/antigravity-hook-support.md','.agents/scripts/swarm-lock.ts','.agents/scripts/enforce-strategy-lock.ts','.agents/scripts/enforce-svelte-runes.ts','.agents/docs/command-catalog.json','.agents/schemas/command-catalog.schema.json','.agents/scripts/validate-command-catalog.ts',...c.commands.flatMap(x=>[...(x.entryPath?[x.entryPath]:[]),...x.roleRules,...x.mandatoryResources]),...c.guidanceSkills.map(x=>x.entryPath)],seen=new Set<string>();
 for(let i=0;i<todo.length;i++){
  const p=todo[i];if(seen.has(p))continue;if(seen.size>=512)fail('Resource closure exceeds bound');seen.add(p);const body=read(root,p);
  const refs=[...body.matchAll(/\.agents\/(?:scripts|docs|rules|schemas|templates|skills)\/[A-Za-z0-9_./-]+\.(?:ts|md|json|sh)/g)].map(x=>x[0]);
  if(p.endsWith('.ts'))for(const match of body.matchAll(/(?:from\s*|import\s*)['"](\.[^'"]+\.ts)['"]/g)){
   const dep=relative(root,resolve(root,dirname(p),match[1])).split(sep).join('/');refs.push(dep);
  }
  for(const ref of refs){read(root,ref);if(!seen.has(ref))todo.push(ref);}
 }
 return [...seen].sort();
}
export function validateCommandCatalog(root:string,hostRoot?:string):{status:string;issues:{message:string}[];resources:string[]} {
 try{
  const c=loadCommandCatalog(root),resources=catalogResources(root);
  if(hostRoot){const host=realpathSync(hostRoot),config=loadTophatConfig(host);for(const command of c.commands.filter(x=>x.state==='active'))if(!config.routingMatrix[command.modelKey!]?.trim())fail(`Missing host model: ${command.modelKey}`);
   for(const p of resources)if(read(host,p)!==read(root,p))fail(`Installed resource differs from pinned source: ${p}`);loadCommandCatalog(host,true);
  }
  return {status:'CATALOG_VALID',issues:[],resources};
 }catch(e){return{status:'CATALOG_INVALID',issues:[{message:(e as Error).message}],resources:[]};}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{const flags=new Map<string,string>();for(let i=2;i<process.argv.length;i+=2){const flag=process.argv[i],value=process.argv[i+1];if(!['--root','--host-root'].includes(flag)||flags.has(flag)||!value||value.startsWith('--'))fail('Use --root <source> and optional --host-root <host> exactly once');flags.set(flag,value);}if(!flags.has('--root'))fail('--root is required');const report=validateCommandCatalog(flags.get('--root')!,flags.get('--host-root'));console.log(JSON.stringify(report));process.exitCode=report.status==='CATALOG_VALID'?0:1;
 }catch(e){console.log(JSON.stringify({status:'CATALOG_INVOCATION_INVALID',issues:[{message:(e as Error).message}]}));process.exitCode=2;}
}
