---
description: Generates a client-ready project README.md, compresses a high-density architectural snapshot into Context.md, and strictly commits the public documentation to the repository via a Pull Request.
---

**Steps:**

1.  **Initialize State:** Invoke @agent-architect.
2.  **Git Isolation:** Before generating any files, use the `run_command` tool to execute `git fetch origin main` and then `git checkout -b chore/generate-master-readme origin/main` to isolate documentation changes.
3.  **Dynamic Ingestion:**
    - Execute `ls -1 docs/` via `run_command` to discover the active documentation matrix.
    - Ingest `docs/PRD.md`, `docs/ERD.md`, and any architectural specs via `view_file`.
4.  **The Ghostwriter Directive:** Write the definitive master `README.md` for the Host Project. Zero references to TopHat, Antigravity, or AIDD swarms are authorized. Adhere strictly to these sections: [Project Name], System Architecture, Prerequisites, Local Setup, Available Scripts, and Core Domain Entities.
5.  **Context.md Snapshot Compression:** Synthesize the System Architecture and Core Domain Entities into a highly dense, 3-4 sentence technical summary.
6.  **Post-Flight & Injection:**
    - Use `write_to_file` to output the finalized `README.md` at the workspace root.
    - Use `replace_file_content` to inject the compressed summary into `Context.md` under a new heading: `🧠 Host Project Snapshot` directly below the `[GLOBAL_CONSTRAINTS]` block. _(Anticipate file-lock race conditions: wait for `write_to_file` to resolve before calling `replace_file_content`)_.
7.  **Version Control Handoff (CRITICAL):** Once the file writes are confirmed, use `run_command` to execute the following commands sequentially:
    - `git add README.md`
    - `git commit -m 'chore(docs): generate master README'`
    - `git push -u origin chore/generate-master-readme`
    - `gh pr create --title 'chore: generate master README' --body 'Automated README generation by the Architect.' --base main`
8.  **Completion:** Output a confirmation summary for the Human Orchestrator, including the generated PR link.
