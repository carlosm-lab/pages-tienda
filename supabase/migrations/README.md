# Orden de Ejecución de Migraciones — Antigravity

> **IMPORTANTE:** Ejecutar en el orden exacto listado. Cada migración usa
> `IF NOT EXISTS` / `DROP IF EXISTS` para ser re-ejecutable, pero el ORDEN
> importa porque migraciones posteriores refuerzan las anteriores.

## Orden canónico (ejecutar en Supabase Dashboard → SQL Editor)

1. **`004_add_email_to_profiles.sql`** — Agrega columna email a profiles + backfill
2. **`005_harden_storage_policies.sql`** — ⚠️ Superseded by `014`, kept for history
3. **`006_update_whatsapp_rpc.sql`** — ⚠️ Superseded by `014`, kept for history
4. **`007_add_missing_indexes.sql`** — Índices adicionales para categories.slug, products.category, etc.
5. **`008_create_system_logs.sql`** — Tabla system_logs + RLS (INSERT: authenticated only)
6. **`009_consolidate_dashboard_rpc.sql`** — Dashboard data consolidado (admin-only)
7. **`010_enable_realtime_settings.sql`** — Habilita Realtime en store_settings
8. **`011_pg_cron_fallback.sql`** — Cleanup probabilístico de carritos (fallback sin pg_cron)
9. **`012_final_db_tweaks.sql`** — Unique index en products.slug + constraint en user_carts
10. **`014_consolidate_all.sql`** — 🔴 **FUENTE DE VERDAD ÚNICA** para:
    - `is_admin()` function
    - ALL RLS policies (products, categories, store_settings, contact_messages, profiles, user_favorites, user_carts)
    - ALL storage policies (product-images bucket with MIME + size validation)
    - `change_user_role()` with admin limit (max 3)
    - `generate_whatsapp_message()` RPC with offer_starts_at validation

## Archivados

Los archivos `supabase_sql_executed.sql`, `rls_audit_fix.sql`, `supabase_storage_policies.sql`
y `013_strict_rls_policies.sql` fueron movidos a `archive/` porque contenían definiciones
duplicadas y en conflicto. Ver `archive/README.md` para detalles.

## Notas

- Todas las funciones `SECURITY DEFINER` tienen `SET search_path = public` para prevenir search_path poisoning.
- La migración `014` es idempotente: segura para re-ejecutar en cualquier momento.
- El límite de admins está configurado en `change_user_role()` como `max_admins := 3`.
