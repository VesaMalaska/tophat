---
name: supabase-multitenant-data
description: Defines strict Row Level Security (RLS) and data isolation protocols for PostgreSQL/Supabase. Use when writing database queries, migrations, or access control logic.
---

# Supabase Multitenant Data Skill

When touching the data layer, follow the approved host tenancy/access-control model. A single-tenant project does not acquire tenant_id/workspace_id requirements from this skill:

## 1. Row Level Security (RLS)

- Enable RLS on client-accessible tables according to approved exposure and authorization policy.
- For a declared multitenant model, enforce tenant membership through the approved authenticated claims and relationships; `auth.uid()` identifies a user, not inherently a tenant ID.
- Never permit unauthorized UPDATE or DELETE; policy shape depends on the approved access-control model.

## 2. Client Usage & Context Isolation

- Use the authenticated Supabase client for all user-initiated requests.
- Only use the `service_role` key in backend edge cases where system-level bypass is explicitly required by the PRD.
- Ensure all server actions retrieve the active session securely before querying the database.

## 3. Migrations

- Output all schema changes as idempotent SQL migrations.
- Include the RLS policy definitions within the same migration file that creates the table.

## Approved host policy and security bounds

Implementation choices follow the approved host package supplied through authorized task extracts; this does not expand ordinary execution roles into full product docs browsing. Shared `.agents/docs` safety contracts remain mandatory resources. Validation at trust boundaries, authorization, secret protection, safe IPC and declared isolation remain security invariants. If approved host choices conflict with these bounds, halt for human resolution rather than silently waive them.
