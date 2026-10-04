import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
const read=(p:string)=>readFileSync(p,'utf8');
test('every workflow is explicitly classified and mutation/delegation requires the shared preflight',()=>{
  const inventory=JSON.parse(read('.agents/docs/git-adoption.json'));
  assert.equal(inventory.schemaVersion,1);
  const paths=inventory.surfaces.map((x:any)=>x.path);assert.equal(new Set(paths).size,paths.length);
  const workflows=readdirSync('.agents/workflows').filter(x=>x.endsWith('.md')).map(x=>'.agents/workflows/'+x).sort();
  assert.deepEqual(paths.filter((x:string)=>x.startsWith('.agents/workflows/')).sort(),workflows);
  for(const entry of inventory.surfaces){
    assert.ok(['mutation','optional-publication','no-git-mutation','internal-preflight','manual-integration'].includes(entry.classification));
    const s=read(entry.path);
    if(entry.classification==='no-git-mutation')assert.match(s,/authorizes no Git mutation/);
    else {assert.match(s,/git-preflight\.ts/);assert.match(s,entry.classification==='internal-preflight'?/gitPreflight\(request\)/:/GIT_PREFLIGHT_READY/);}
    assert.doesNotMatch(s,/(?:Run|execute|_Command:_)\s*:?\s*`?git (?:add (?:\.|-A|-u)(?:\s|`|$)|commit -a|push --force|reset --hard|clean -|stash|checkout feature\/[^\n]*\*)/i);
    assert.doesNotMatch(s,/git fetch origin main|git merge origin\/main|push any WIP|Push your current WIP/);
  }
});
test('role rules contain no automatic WIP publication and developer mutation uses shared contract',()=>{
  for(const tier of ['junior','mid','senior']){const s=read(`.agents/rules/agent-${tier}-dev.md`);assert.match(s,/git-preflight\.ts/);assert.doesNotMatch(s,/Push your current WIP|Commit using Conventional Commits, push/);}
  assert.match(read('.agents/workflows/publish-pr.md'),/PUBLICATION_READY/);
  assert.match(read('.agents/workflows/publish-pr.md'),/DOCUMENTATION_READY/);
  assert.match(read('.agents/docs/git-safety.md'),/does not merge/);
});
