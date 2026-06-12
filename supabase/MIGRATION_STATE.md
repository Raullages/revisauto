# Migration State

Estado observado em `2026-06-12` para reconciliacao entre o repositorio e o projeto Supabase conectado.

## Repository Migrations

- `20240604000000_initial_schema.sql`
- `20240604000001_storage_policies.sql`
- `20240604000002_status_priority.sql`
- `20240604000003_drop_maintenance_date_not_null.sql`
- `20240604000004_fuel_logs.sql`
- `20240604000005_push_notifications.sql`
- `20240604000006_push_subscriptions_endpoint_unique.sql`

## Remote Supabase Migrations

- `20260605214809_drop_maintenance_date_not_null`
- `20260607021612_create_finance_tables`
- `20260607022303_drop_finance_tables_from_revisauto`
- `20260607023552_create_finance_tables_v2`
- `20260607023654_drop_finance_tables_v2`
- `20260611221612_fuel_logs`
- `20260612002824_push_notifications`
- `20260612153131_push_subscriptions_endpoint_unique`

## Confirmed Divergences

1. O projeto remoto nao possui uma migration historica equivalente a `initial_schema` ou `status_priority` com os mesmos nomes/versionamentos do repositorio.
2. O projeto remoto contem migrations de `finance` que nao existem no repositorio atual.
3. O projeto remoto usa versionamento temporal de 2026, enquanto o repositorio local segue a sequencia manual `20240604...`.

## Current Interpretation

- O schema funcional atual do banco esta compativel com o produto nos modulos principais observados: `profiles`, `vehicles`, `maintenance_categories`, `maintenances`, `attachments`, `fuel_logs`, `push_subscriptions`, `notifications`.
- O historico de migrations nao esta reconciliado entre banco e repositorio.
- Antes de tratar o historico de migrations como fonte auditavel unica, sera necessario um trabalho dedicado de reconciliacao.

## Immediate Guidance

- Use o schema real do banco como fonte de verdade para tipos e validacoes estruturais imediatas.
- Nao assuma que a ordem/nomes das migrations locais representa exatamente o que foi aplicado no projeto remoto.
- Antes de uma limpeza de historico ou automacao de deploy de banco, revisar essa divergencia explicitamente.
