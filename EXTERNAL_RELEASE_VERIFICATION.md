# External Release Verification

Checklist objetivo dos itens de launch readiness que dependem de configuracao externa, dashboard ou validacao em dispositivo real.

Atualizado em `2026-06-12`.

## 1. Supabase Auth

### Confirmado no codigo

- signup usa `emailRedirectTo` para `/auth/callback`
- forgot password usa redirect para `/auth/callback?next=/auth/reset-password`
- existe tela real para redefinicao de senha em `/auth/reset-password`

### Verificar manualmente no Supabase Dashboard

- [ ] `Site URL` aponta para a URL real de producao
- [ ] `Redirect URLs` incluem:
  - [ ] `https://<producao>/auth/callback`
  - [ ] `https://<producao>/auth/callback?next=/auth/reset-password`
  - [ ] `http://localhost:3000/auth/callback` apenas se desenvolvimento local ainda for necessario
- [ ] Confirmar por teste real:
  - [ ] signup + confirmacao de email
  - [ ] forgot password + reset password

## 2. Environment Variables

### Confirmado no projeto local

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`

### Verificar no deploy de producao

- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurada
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurada
- [ ] `NEXT_PUBLIC_VAPID_PUBLIC_KEY` configurada
- [ ] `VAPID_PRIVATE_KEY` configurada apenas onde realmente necessario
- [ ] `VAPID_SUBJECT` configurada

Observacao:
- `VAPID_PRIVATE_KEY` e segredo sensivel. Nao deve existir em ambiente publico de browser. No projeto atual ela esta apenas em `.env.local`, sem prefixo `NEXT_PUBLIC_`, o que esta correto no app web.

## 3. Edge Functions / Push

### Confirmado no projeto Supabase conectado

- existem duas funcoes ativas:
  - `send-push-notifications`
  - `send-push-notifs`
- ambas estao com `verify_jwt: false`
- a funcao `send-push-notifications` nao implementa autenticacao propria no corpo

### Risco

- qualquer pessoa com a URL da funcao pode potencialmente disparar envios, desde que a funcao esteja acessivel publicamente

### Itens para decidir antes do launch

- [ ] definir qual slug e o canonico: `send-push-notifications` ou `send-push-notifs`
- [ ] remover ou aposentar a funcao duplicada que nao sera usada
- [ ] definir estrategia de protecao:
  - [ ] habilitar `verify_jwt: true` se a invocacao vier de contexto autenticado/seguro
  - [ ] ou implementar autenticacao propria se a funcao precisar continuar publica
- [ ] confirmar como o agendamento real sera feito:
  - [ ] cron/scheduler do Supabase
  - [ ] chamada manual autenticada
  - [ ] outro mecanismo
- [ ] validar envio real de notificacao push apos essa decisao

## 4. Storage / Attachments

### Confirmado no codigo

- o app agora trata anexos como bucket privado, gerando `signed URLs`

### Verificar manualmente no projeto Supabase

- [ ] bucket `attachments` existe
- [ ] bucket esta realmente privado
- [ ] policies de storage estao aplicadas no ambiente alvo
- [ ] upload funciona
- [ ] preview/download funciona
- [ ] exclusao funciona

## 5. PWA And Devices

### Confirmado no codigo

- `manifest.json` existe
- service worker builda com `@serwist/next`
- SW e gerado em `public/sw.js`
- em dev o SW fica desativado

### Verificar manualmente

- [ ] instalacao em iPhone
- [ ] instalacao em Android
- [ ] app abre em modo standalone
- [ ] navegacao principal funciona apos instalacao
- [ ] fluxo de permissao de notificacao funciona no dispositivo alvo
- [ ] clique na notificacao abre a manutencao esperada

## 6. Current External Blockers

Bloqueadores ou riscos importantes ainda abertos:

1. `Site URL` e `Redirect URLs` precisam de confirmacao manual no Supabase Dashboard.
2. Push notifications ainda precisam de decisao de seguranca para a Edge Function publica.
3. Duplicidade de Edge Function de push precisa ser resolvida.
4. Storage, PWA e push ainda precisam de validacao em ambiente/dispositivo real.
