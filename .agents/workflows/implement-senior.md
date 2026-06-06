---
description: Backend/DB implementation pipeline with automated Git and Linear handoff.
---

**Steps:**

1. **Initialize Task:** Invoke `@agent-senior-dev`.
2. **Instruction:** "Use the Linear MCP to fetch Task ID {{args[0]}}. Read the task requirements. Focus strictly on database queries, Row Level Security (RLS), and server-authoritative logic."
3. **Execution:** "Checkout a new branch `feature/{{args[0]}}-backend-logic`. Implement the Supabase data mutations, API endpoints, and type-safe payloads. Enforce the Supabase Multitenant Data Skill."
4. **Post-Flight Automation:** "Once implementation is complete, execute the following sequentially:
   - Run `git add . && git commit -m 'feat(backend): {{args[0]}} implement server authority and RLS'`
   - Run `git push -u origin HEAD`
   - Use the Linear MCP to transition Task {{args[0]}} to 'In Review: Architecture'.
   - Output the Trace Validation Checklist for the Human Orchestrator."
