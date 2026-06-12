# Ownership Review

Revisao realizada em `2026-06-12` com foco em isolamento de dados por usuario nas consultas do app.

## Objetivo

- reduzir dependencia exclusiva de RLS nas leituras criticas
- tornar consultas mais explicitas sobre ownership
- registrar pontos ainda dependentes de validacao funcional

## Arquivos Revisados

- `src/features/vehicles/services/vehicle.service.ts`
- `src/features/maintenances/services/maintenance.service.ts`
- `src/features/maintenances/services/attachment.service.ts`
- `src/features/fuel/services/fuel.service.ts`

## Ajustes Aplicados

### Vehicles

- adicionado filtro explicito por `user_id` em `getById`, `update` e `remove`
- `list` e `create` passaram a reutilizar helper de usuario autenticado

### Maintenances

- `listByVehicle` agora tambem exige `vehicles.user_id = currentUser`
- `getById` agora usa `vehicles!inner(...)` com filtro de ownership explicito
- `create` e `update` validam ownership do `vehicle_id` antes da mutacao
- `update` e `remove` fazem leitura ownership-aware antes de mutar

### Fuel

- `getById` agora usa `vehicles!inner(...)` com filtro de ownership explicito
- `create` e `update` validam ownership do `vehicle_id`
- `update` e `remove` validam acesso ao registro antes de mutar
- `list` e `getStats` mantem filtro por `vehicles.user_id`

### Attachments

- `list` e `upload` agora validam ownership da manutencao antes da operacao
- `remove` continua apoiado por RLS da tabela `attachments` e do bucket, mas pode receber endurecimento extra se necessario apos QA

## Observacoes

1. O projeto ja tinha uma base boa de RLS. Esta revisao fortaleceu a camada de aplicacao, nao substituiu a seguranca do banco.
2. Mutacoes por `id` em `maintenances`, `fuel_logs` e `vehicles` agora falham mais cedo quando o registro nao pertence ao usuario.
3. `attachments.remove()` ainda depende mais de RLS do que os outros fluxos revisados. Isso nao parece um problema imediato, mas merece observacao na validacao funcional.

## Status Atual

- leituras e mutacoes criticas ficaram mais explicitas quanto a ownership
- ainda falta validar funcionalmente os cenarios de acesso negado e acesso valido em ambiente real
