---
name: owasp-top-10
description: Validates database mutations, API routes, and frontend state against OWASP top 10 vulnerabilities. Use when auditing authentication, checkout, or database access layers.
---
# OWASP Security Audit Skill

When conducting a security review on database interaction or user authentication logic, enforce the following verification checks:

## 1. Injection Vectors (A03:2021-Injection)
* Verify all SQL queries use parameterized inputs or a secure ORM layer. No string concatenation for queries.
* Ensure all user-provided data rendered in the UI is safely encoded/escaped for its rendering context; sanitize permitted raw HTML with an approved mechanism.

## 2. Broken Access Control (A01:2021-Broken Access Control)
* Verify that server-side route guards explicitly check the user's role/session before executing logic.
* For database mutations, verify the approved server authorization and, where applicable, database policies constrain the caller and target rows. Do not assume Supabase, RLS or auth.uid() for other hosts.

## 3. Security Misconfiguration (A05:2021)
* Protect secrets server-side. Public nonsecret configuration may be exposed only under the approved host policy; naming a variable public never makes a secret safe.
* Check that CORS policies are explicitly defined.

## Remediation Protocol
If any of these vectors are unmitigated, report a `CRITICAL` finding and block the merge. Provide the developer agent with the exact code snippet required to secure the vulnerability.

## Approved host policy and security bounds

Implementation choices follow the approved host package supplied through authorized task extracts; this does not expand ordinary execution roles into full product docs browsing. Shared `.agents/docs` safety contracts remain mandatory resources. Validation at trust boundaries, authorization, secret protection, safe IPC and declared isolation remain security invariants. If approved host choices conflict with these bounds, halt for human resolution rather than silently waive them.
