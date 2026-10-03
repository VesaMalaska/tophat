import { existsSync, readFileSync, watch } from "node:fs";
import { join } from "node:path";
import { overlayDocumentation } from "./update-hud.ts";
import { isMain } from "./validate-doc-package.ts";

/** Polling covers nested edits, absent directories, and missed/failed watch events. No writes. */
export function startHudWatcher(workspaceRoot: string, render: (content: string) => void, intervalMs = 2000): () => void {
  let closed = false;
  const refresh = () => {
    if (closed) return;
    let content = "🛸 TopHat Orchestrator HUD\nHUD is unavailable; awaiting an authorized state update.";
    try { if (existsSync(join(workspaceRoot, "HUD.md"))) content = readFileSync(join(workspaceRoot, "HUD.md"), "utf8"); }
    catch { content = "🛸 TopHat Orchestrator HUD\nHUD cannot be read; validation remains blocked where evidence is unavailable."; }
    try { render(overlayDocumentation(content, workspaceRoot)); }
    catch { render("Documentation state: UNAVAILABLE — VALIDATION DENIED. Retry after the files are readable."); }
  };
  let watcher: ReturnType<typeof watch> | undefined;
  try { watcher = watch(workspaceRoot, refresh); watcher.on("error", refresh); } catch { /* Polling remains active. */ }
  const timer = setInterval(refresh, intervalMs);
  refresh();
  return () => { closed = true; clearInterval(timer); watcher?.close(); };
}
if (isMain(import.meta.url)) {
  const stop = startHudWatcher(process.cwd(), content => {
    process.stdout.write("\x1Bc"); console.log("=== 🛸 TOPHAT COMMAND CENTER ===\n" + content + "\n[Validation refreshed every 2 seconds; Ctrl+C to exit]");
  });
  process.once("SIGINT", () => { stop(); }); process.once("SIGTERM", () => { stop(); });
}
