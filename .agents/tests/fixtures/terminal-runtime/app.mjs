import {execFileSync} from 'node:child_process';
const emit = value => process.stdout.write(JSON.stringify(value)+'\n');
if(!process.stdin.isTTY || !process.stdout.isTTY){
 const mode=process.argv[2];if(mode==='--echo'){emit({output:process.argv[3],tty:false});process.exit(0);}
 process.stderr.write('Interactive fixture needs a TTY\n');process.exit(2);
}
const original=execFileSync('stty',['-g'],{stdio:[0,'pipe','pipe'],encoding:'utf8'}).trim();
const restore=()=>{process.stdin.setRawMode(false);execFileSync('stty',[original],{stdio:[0,'pipe','pipe']});};
let done=false;
const exit=(status,reason)=>{if(done)return;done=true;restore();emit({event:'exit',reason,status});process.exitCode=status;process.stdin.pause();};
process.stdin.setRawMode(true);process.stdin.resume();
process.on('SIGINT',()=>exit(130,'signal'));
process.stdout.on('resize',()=>emit({event:'resize',rows:process.stdout.rows,columns:process.stdout.columns}));
process.stdin.on('data',chunk=>{
 for(const ch of chunk.toString()){
  if(ch==='q')exit(0,'normal');
  else if(ch==='e')exit(7,'controlled-error');
  else if(ch==='\u0003')process.kill(process.pid,'SIGINT');
  else if(ch==='r'){execFileSync('stty',['rows','31','cols','97'],{stdio:[0,'pipe','pipe']});process.kill(process.pid,'SIGWINCH');}
  else emit({event:'input',key:ch});
 }
});
emit({event:'ready',tty:true,rows:process.stdout.rows,columns:process.stdout.columns,pid:process.pid});
