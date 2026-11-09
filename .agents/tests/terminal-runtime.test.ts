import assert from 'node:assert/strict';
import test from 'node:test';
import {spawn,spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
const app=resolve('.agents/tests/fixtures/terminal-runtime/app.mjs');
const quote=(s:string)=>"'"+s.replaceAll("'","'\\''")+"'";
test('CLI invocation preserves Unicode/output, exits and non-TTY failure without a server',()=>{
 const r=spawnSync(process.execPath,[app,'--echo','Å fox 🦊'],{encoding:'utf8',timeout:5000});assert.equal(r.status,0);assert.deepEqual(JSON.parse(r.stdout),{output:'Å fox 🦊',tty:false});
 const noTTY=spawnSync(process.execPath,[app],{encoding:'utf8',timeout:5000});assert.equal(noTTY.status,2);assert.match(noTTY.stderr,/needs a TTY/);
});
for(const [key,status,reason] of [['q',0,'normal'],['e',7,'controlled-error'],['\u0003',130,'signal']] as const)test(`Linux PTY input/resize and ${reason} exit restore terminal state`,async()=>{
 assert.equal(process.platform,'linux','Required native fixture unavailable outside observed Linux scope');
 for(const cmd of ['script','stty'])assert.equal(spawnSync(cmd,['--version'],{timeout:5000}).status,0,`BLOCKED: missing ${cmd}`);
 const command=`stty rows 24 cols 80; before=$(stty -g); ${quote(process.execPath)} ${quote(app)}; result=$?; after=$(stty -g); if [ "$before" = "$after" ]; then printf '\\nRESTORED\\n'; else printf '\\nRESTORE_FAILED\\n'; fi; exit "$result"`;
 const child=spawn('script',['--quiet','--return','--flush','--command',command,'/dev/null'],{stdio:['pipe','pipe','pipe'],env:{...process.env,TERM:'xterm',LC_ALL:'C.UTF-8'}});
 let output='',stderr='',sentInput=false,sentExit=false;
 const timer=setTimeout(()=>child.kill('SIGKILL'),8000);
 try {
  await new Promise<void>((ok,bad)=>{
   child.on('error',bad);child.stderr.on('data',c=>stderr+=c);
   child.stdout.on('data',c=>{
    output+=c;if(output.length>65536){child.kill('SIGKILL');bad(Error('PTY output bound exceeded'));return;}
    if(!sentInput&&output.includes('"event":"ready"')){sentInput=true;child.stdin.write('xr');}
    if(!sentExit&&output.includes('"event":"resize","rows":31,"columns":97')){sentExit=true;child.stdin.write(key);}
   });
   child.on('close',(code,signal)=>{try{assert.equal(signal,null,output+stderr);assert.equal(code,status,output+stderr);assert.match(output,/"event":"ready","tty":true,"rows":24,"columns":80/);assert.match(output,/"event":"input","key":"x"/);assert.match(output,/"event":"resize","rows":31,"columns":97/);assert.match(output,new RegExp(`"event":"exit","reason":"${reason}","status":${status}`));assert.match(output,/RESTORED/);assert.doesNotMatch(output,/RESTORE_FAILED/);ok();}catch(e){bad(e);}});
  });
 }finally{clearTimeout(timer);child.stdin.destroy();if(child.exitCode===null)child.kill('SIGKILL');}
});
