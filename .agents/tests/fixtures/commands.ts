import { readFileSync } from 'node:fs';
import { loadCommandCatalog } from '../../scripts/validate-command-catalog.ts';
export const catalog=loadCommandCatalog(process.cwd());
export function readCommand(name:string):string { const entry=catalog.commands.find(c=>c.name===name);if(!entry||entry.state!=="active"||!entry.entryPath)throw new Error(`No active command: ${name}`);return readFileSync(entry.entryPath,'utf8'); }
