# Launch QA Technical Notes

Registro tecnico das descobertas e correcoes feitas durante a validacao de launch readiness.

Atualizado em `2026-06-12`.

## 1. Auth

### Corrigido

- **Callback de auth sem persistencia correta de cookies**
  - Arquivo: `src/app/auth/callback/route.ts`
  - Problema: a rota trocava o `code` por sessao, mas os cookies nao eram aplicados na resposta retornada.
  - Impacto: confirmacao de email e fluxos baseados em callback podiam falhar em manter a sessao.
  - Acao: a resposta de redirect agora e criada uma vez e reutilizada para receber os cookies.

- **Fluxo de recuperacao de senha incompleto**
  - Arquivos:
    - `src/features/auth/services/auth.service.ts`
    - `src/features/auth/viewmodel/useAuth.ts`
    - `src/features/auth/model/schemas.ts`
    - `src/app/auth/reset-password/page.tsx`
  - Problema: o email de recuperacao redirecionava para `/auth/login`, mas nao existia fluxo para definir nova senha.
  - Impacto: usuario recebia o email, mas nao conseguia concluir a redefinicao.
  - Acao:
    - `resetPasswordForEmail` agora aponta para `/auth/callback?next=/auth/reset-password`
    - criada tela `/auth/reset-password`
    - adicionado `authService.updatePassword()` e respectivo viewmodel/schema

### Ainda depende de validacao manual

- confirmar callback real por email do Supabase
- confirmar recuperacao de senha ponta a ponta via email real

## 2. Ownership And Access

### Corrigido / endurecido

- leituras por `id` em `vehicles`, `maintenances` e `fuel_logs` agora aplicam ownership explicito
- mutacoes criticas validam ownership antes de `update` e `delete`
- `attachments.list()` e `attachments.upload()` agora verificam ownership da manutencao antes da operacao

Documento relacionado:
- `supabase/OWNERSHIP_REVIEW.md`

## 3. Maintenances

### Corrigido

- **Formulario usava schema sem refine de proxima troca**
  - Arquivo: `src/features/maintenances/view/MaintenanceForm.tsx`
  - Problema: o form usava `maintenanceSchema` em vez de `maintenanceFormSchema`.
  - Impacto: a regra `next_change_km > vehicle_km` podia nao ser aplicada.
  - Acao: form passou a usar `maintenanceFormSchema`.

- **Workflow rapido de status podia gerar registros inconsistentes**
  - Arquivo: `src/app/(protected)/maintenances/[id]/page.tsx`
  - Problema: transicoes `pending -> scheduled` e `pending -> completed` podiam ocorrer sem `maintenance_date`.
  - Impacto: inconsistencia de regra de negocio e comportamento incorreto em dashboard/alertas.
  - Acao: ao transicionar para `scheduled` ou `completed`, a tela envia data atual quando o registro ainda nao tem data.

### Ainda depende de validacao manual

- verificar se o comportamento padrao de usar a data atual nas transicoes atende a expectativa de produto

## 4. Attachments

### Corrigido

- **Servico de anexos assumia bucket publico**
  - Arquivo: `src/features/maintenances/services/attachment.service.ts`
  - Problema: a migration/documentacao indica bucket privado, mas o codigo usava `getPublicUrl()`.
  - Impacto: preview/download podiam falhar em producao.
  - Acao:
    - upload agora persiste `storage path`
    - listagem passa a gerar `signed URLs`
    - remocao aceita tanto paths novos quanto URLs antigas

### Ainda depende de validacao manual

- confirmar upload, abertura e exclusao em ambiente real de storage
- observar `attachments.remove()` no QA final, pois ele ainda depende fortemente de RLS + storage

## 5. Push Notifications

### Corrigido

- `push_subscriptions` deixou de conflitar por `user_id` e passou a conflitar por `endpoint`
- criada migration incremental para indice unico em `endpoint`
- migration aplicada no projeto remoto conectado

Documentos relacionados:
- `supabase/MIGRATION_STATE.md`
- `LAUNCH_READINESS_CHECKLIST.md`

## 6. Validation Status

## 6. Numeric Input UX

### Corrigido

- **Campos de moeda e quilometragem com UX ruim**
  - Arquivos:
    - `src/features/vehicles/view/VehicleForm.tsx`
    - `src/features/maintenances/view/MaintenanceForm.tsx`
    - `src/features/fuel/view/FuelForm.tsx`
    - `src/features/vehicles/model/schemas.ts`
    - `src/features/maintenances/model/schemas.ts`
    - `src/features/fuel/model/schemas.ts`
    - `src/utils/form-number-format.ts`
    - `src/app/globals.css`
  - Problema:
    - valores monetarios estavam em `type="number"`, sem experiencia de BRL
    - campos de KM tinham UX crua e exibiam spinners/setas de incremento
  - Acao:
    - campos de moeda agora usam mascara BRL
    - campos de KM agora usam formatacao com separador de milhar
    - spinners de `input[type="number"]` foram removidos globalmente
    - schemas foram ajustados para aceitar melhor estados vazios desses campos formatados

### Impacto esperado

- preenchimento mais natural em mobile
- menos erro de digitacao em valores e quilometragem
- interface com cara mais proxima de produto final

## 7. Validation Status

### Verificado nesta rodada

- `npm run lint`: sem erros, com warnings existentes
- `npm run build`: OK

### Warnings ainda existentes

- uso de `<img>` em telas de auth e navbar
- parametro `_req` nao usado em `supabase/functions/send-push-notifications/index.ts`

## 8. Recommended Next QA Steps

1. Validar signup + confirmacao de email com email real.
2. Validar forgot password + reset password com email real.
3. Validar CRUD real de veiculos.
4. Validar CRUD real de manutencoes, incluindo workflow de status.
5. Validar upload/download/exclusao de anexos no bucket.
6. Validar CRUD real de combustivel.
7. Validar PWA e push em dispositivo real.
