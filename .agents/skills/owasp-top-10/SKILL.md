---
name: owasp-top-10
description: Validates database mutations, API routes, and frontend state against OWASP top 10 vulnerabilities. Use when auditing authentication, checkout, or database access layers.
---
# OWASP Security Audit Skill

When conducting a security review on database interaction or user authentication logic, enforce the following verification checks:

## 1. Injection Vectors (A03:2021-Injection)
* Verify all SQL queries use parameterized inputs or a secure ORM layer. No string concatenation for queries.
* Ensure all user-provided data rendered in the UI is explicitly sanitized to prevent XSS.

## 2. Broken Access Control (A01:2021-Broken Access Control)
* Verify that server-side route guards explicitly check the user's role/session before executing logic.
* If touching the database, confirm Row Level Security (RLS) policies accurately restrict `UPDATE` and `DELETE` commands to the `auth.uid()`.

## 3. Security Misconfiguration (A05:2021)
* Ensure all environmental variables (e.g., API keys, database URLs) are loaded server-side and never exposed to the client bundle.
* Check that CORS policies are explicitly defined.

## Remediation Protocol
If any of these vectors are unmitigated, report a `CRITICAL` finding and block the merge. Provide the developer agent with the exact code snippet required to secure the vulnerability.