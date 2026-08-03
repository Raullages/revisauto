# Implementar Push Notifications

## Status

`planejado`

## Objetivo

Fechar a implementacao de push notifications como feature confiavel de produto, com assinatura, envio e deep link funcionando ponta a ponta.

## Contexto

O projeto ja possui boa parte da base de push, incluindo service worker, inscricao, tabelas e Edge Function. O que falta e consolidar a arquitetura canonica, seguranca e validacao real em ambiente/dispositivo.

## Escopo

- [ ] definir fluxo canonico de push no projeto
- [ ] consolidar uma unica Edge Function de envio
- [ ] revisar seguranca da funcao
- [ ] validar subscribe/unsubscribe no perfil
- [ ] validar entrega real da notificacao
- [ ] validar clique abrindo a manutencao correta

## Fora De Escopo

- notificacoes com segmentacao sofisticada
- centro completo de notificacoes no app
- analytics avancado de abertura

## Regras De Negocio

- deve existir uma unica funcao canonica para envio
- o fluxo nao pode depender de endpoint publico inseguro sem decisao consciente
- a notificacao precisa abrir o destino correto ao toque
- se push nao estiver seguro ou validado, nao deve ser tratado como feature pronta de release

## Mudancas Tecnicas Esperadas

- revisar Edge Functions de push no Supabase
- revisar `src/hooks/usePushNotifications.ts`
- revisar `src/app/sw.ts`
- revisar perfil e persistencia em `push_subscriptions` e `notifications`
- revisar configuracao de VAPID e ambiente

## Checklist De Implementacao

- [ ] escolher slug canonico da funcao
- [ ] aposentar funcao duplicada, se existir
- [ ] definir protecao via `verify_jwt` ou autenticacao propria
- [ ] revisar persistencia de assinatura no banco
- [ ] validar deep link ao clicar na notificacao
- [ ] documentar decisao tecnica final

## Checklist De Validacao

- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] validar assinatura no cliente
- [ ] validar envio real
- [ ] validar clique da notificacao
- [ ] validar comportamento em dispositivo alvo

## Dependencias

- configuracao de VAPID
- Edge Function de push
- dispositivo real para validacao

## Observacoes

Esse item cruza backlog de produto e prontidao de release; se continuar opcional, a doc deve deixar isso explicito.
