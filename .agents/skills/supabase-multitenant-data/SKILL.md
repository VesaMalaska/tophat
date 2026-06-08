---
name: supabase-multitenant-data
description: Defines strict Row Level Security (RLS) and data isolation protocols for PostgreSQL/Supabase. Use when writing database queries, migrations, or access control logic.
---

# Supabase Multitenant Data Skill

When touching the data layer, ensure absolute tenant isolation for generalized template systems:

## 1. Row Level Security (RLS)

- Every table must have RLS enabled by default.
- Ensure policies explicitly check the `tenant_id` or `workspace_id` against the authenticated user's claims `auth.uid()`.
- Never write a permissive `true` policy for UPDATE or DELETE operations.

## 2. Client Usage & Context Isolation

- Use the authenticated Supabase client for all user-initiated requests.
- Only use the `service_role` key in backend edge cases where system-level bypass is explicitly required by the PRD.
- Ensure all server actions retrieve the active session securely before querying the database.

## 3. Migrations

- Output all schema changes as idempotent SQL migrations.
- Include the RLS policy definitions within the same migration file that creates the table.
