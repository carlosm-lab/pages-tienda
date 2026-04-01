# Archived Migrations

These files were the original migration scripts that have been **consolidated** into
`014_consolidate_all.sql`. They are kept here for historical reference only.

**DO NOT re-execute these files.** All their definitions are superseded by `014_consolidate_all.sql`.

## Archived files

| File | Original purpose | Superseded by |
|---|---|---|
| `supabase_sql_executed.sql` | Base functions, triggers, RLS, WhatsApp RPC, indexes, cron | `014_consolidate_all.sql` sections 1, 5, 10, 11 |
| `rls_audit_fix.sql` | Complete RLS audit for all tables | `014_consolidate_all.sql` sections 2–8 |
| `supabase_storage_policies.sql` | Basic storage bucket policies | `014_consolidate_all.sql` section 9 |
| `013_strict_rls_policies.sql` | Strict RLS + storage (missing MIME validation) | `014_consolidate_all.sql` sections 1, 5, 6, 9 |

## Why archived?

These files contained **duplicate and conflicting definitions** of the same RLS policies
(CRIT-001) and storage policies (CRIT-002). The consolidated migration resolves all
ambiguity by providing a single canonical definition for each policy.
