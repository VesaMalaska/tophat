import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync, readFileSync, writeFileSync, symlinkSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import compiler from './fixtures/guidance-runtime/node_modules/svelte/compiler/index.js';
const { compile, compileModule } = compiler;
import { inflate } from './fixtures/guidance-runtime/node_modules/@sparticuz/chromium/build/index.js';
import { chromium, expect } from './fixtures/guidance-runtime/node_modules/@playwright/test/index.mjs';
const fixture=resolve(dirname(fileURLToPath(import.meta.url)), 'fixtures/guidance-runtime');
test('compiled Svelte rune module shares observable updates and typed page props render data',()=>{
 const root=mkdtempSync(join(tmpdir(),'tophat-compiled-svelte-'));
 try {
  symlinkSync(join(fixture,'node_modules'),join(root,'node_modules'),'dir');
  const module=compileModule('export const counter = $state({ count: 0 }); export function increment() { counter.count += 1; }',{filename:'counter.svelte.ts',generate:'client'});
  writeFileSync(join(root,'counter.mjs'),module.js.code);
  const snippet=readFileSync('.agents/skills/svelte5-kit-architecture/SKILL.md','utf8').match(/```svelte\n([\s\S]*?)\n```/)![1];
  writeFileSync(join(root,'page.mjs'),compile(snippet+'\n<h1>{data.title}</h1>',{filename:'+page.svelte',generate:'server'}).js.code);
  writeFileSync(join(root,'check.mjs'),`import assert from 'node:assert/strict'; import {counter,increment} from './counter.mjs'; import Page from './page.mjs'; import {render} from 'svelte/server'; import {effect_root,render_effect} from 'svelte/internal/client'; import {flushSync} from 'svelte'; let seen=[]; const stop=effect_root(()=>render_effect(()=>seen.push(counter.count))); increment(); flushSync(); assert.deepEqual(seen,[0,1]); stop(); assert.match(render(Page,{props:{data:{title:'Approved page'}}}).body,/Approved page/); console.log('observable reactivity and page props passed');`);
  const result=spawnSync(process.execPath,['--conditions=browser',join(root,'check.mjs')],{encoding:'utf8',timeout:10000});
  assert.equal(result.status,0,result.stderr);assert.match(result.stdout,/passed/);
 }finally{rmSync(root,{recursive:true,force:true});}
});
test('browser readiness passes amid ongoing requests but waits for required UI state',async()=>{
 let release!:()=>void, started!:()=>void;
 const pending=new Promise<void>(r=>release=r), observed=new Promise<void>(r=>started=r);
 const server=createServer((req,res)=>{
  if(req.url==='/ongoing'){res.writeHead(200);res.write('ongoing');return;}
  if(req.url==='/required'){started();void pending.then(()=>res.end('Approved result'));return;}
  res.end(`<h1>Dashboard</h1><p id="result">Pending</p><script>fetch('/ongoing'); fetch('/required').then(r=>r.text()).then(t=>document.querySelector('#result').textContent=t)</script>`);
 });
 await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));
 let browser;
 try{
  browser=await chromium.launch({executablePath:await inflate(join(fixture,'node_modules/@sparticuz/chromium/bin/chromium.br')),args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--disable-software-rasterizer'],headless:true});const page=await browser.newPage();await page.goto(`http://127.0.0.1:${(server.address() as any).port}`,{waitUntil:'domcontentloaded'});await observed;
  await expect(page.getByRole('heading',{name:'Dashboard'})).toBeVisible();
  await assert.rejects(expect(page.getByText('Approved result',{exact:true})).toBeVisible({timeout:100}));
  release();await expect(page.getByText('Approved result',{exact:true})).toBeVisible();
 }finally{release();if(browser)await browser.close();server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));}
});
