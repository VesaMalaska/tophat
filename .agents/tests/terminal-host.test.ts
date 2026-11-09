import assert from 'node:assert/strict';
import test from 'node:test';
import {parseTophatConfig} from '../scripts/load-tophat-config.ts';
import {selectTaskGuidance} from '../scripts/select-task-guidance.ts';
const config = (workspace: unknown) => parseTophatConfig(JSON.stringify({schemaVersion:1,workspace,documentation:{package:'docs/project',manifest:'manifest.json',derivedTargets:[]},validation:{scripts:{unit:'unit'},commitGate:['unit'],developmentPhaseGate:[],projectCompletionGate:[]},routingMatrix:{}}));
for(const mode of ['cli','tui']) test(`terminal ${mode} derives isolated capabilities and smoke mode`,()=>{
 const c=config({kind:'terminal',framework:'none',mode});
 assert.deepEqual(c.capabilities,['node-process','terminal-io',...(mode==='tui'?['terminal-ui']:[]),'terminal-qa']);
 const s=selectTaskGuidance(c,{requestedSkills:['terminal-qa-flows'],taskTopics:['terminal-flow'],frameworkInstructions:[]});
 assert.equal(s.smokeProfile,'terminal'); assert.equal(s.terminalMode,mode);assert.equal(s.renderer,null);
});
test('terminal invalid mode/framework and mode on older hosts deny; old workspace shape unchanged',()=>{
 for(const w of [{kind:'terminal',framework:'none'},{kind:'terminal',framework:'none',mode:'unknown'},{kind:'terminal',framework:'react',mode:'tui'},{kind:'backend',framework:'none',mode:'cli'},{kind:'terminal',framework:'none',mode:'tui',capabilities:['web-ui']}]) assert.throws(()=>config(w));
 assert.deepEqual(config({kind:'backend',framework:'none'}).workspace,{kind:'backend',framework:'none'});
});
test('terminal guidance rejects server/browser/Electron/style assumptions and CLI presentation',()=>{
 const c=config({kind:'terminal',framework:'none',mode:'tui'});
 for(const [skill,topic] of [['nodejs-backend-architecture','backend'],['playwright-qa-flows-web','browser-flow'],['playwright-qa-flows-desktop','desktop-flow'],['electron-secure-ipc','electron-ipc'],['tailwind-semantic-ui','tailwind'],['react-architecture','security']]) assert.throws(()=>selectTaskGuidance(c,{requestedSkills:[skill],taskTopics:[topic] as never[],frameworkInstructions:[]}));
 for(const topic of ['backend','browser-flow','desktop-flow'])assert.throws(()=>selectTaskGuidance(c,{requestedSkills:[],taskTopics:[topic] as never[],frameworkInstructions:[]}));
 assert.throws(()=>selectTaskGuidance(config({kind:'terminal',framework:'none',mode:'cli'}),{requestedSkills:['terminal-qa-flows'],taskTopics:['terminal-presentation'],frameworkInstructions:[]}));
 assert.throws(()=>selectTaskGuidance(c,{requestedSkills:['terminal-qa-flows'],taskTopics:[],frameworkInstructions:[]}));
 assert.throws(()=>selectTaskGuidance(config({kind:'web',framework:'react'}),{requestedSkills:['terminal-qa-flows'],taskTopics:['terminal-flow'],frameworkInstructions:[]}));
 assert.equal(selectTaskGuidance(c,{requestedSkills:['terminal-qa-flows'],taskTopics:['terminal-presentation'],frameworkInstructions:[]}).status,'SELECTED');
});
