# Implementar Cancelamento Stripe

## Status

`planejado`

## Objetivo

Completar o ciclo de assinatura premium com um fluxo claro para cancelamento, consulta de status e gerenciamento basico da cobranca.

## Contexto

O projeto ja inicia checkout via Stripe e recebe webhook para promover o usuario para `premium`. Ainda falta a parte operacional mais importante do ponto de vista do usuario: cancelar ou gerenciar a assinatura de forma segura.

## Escopo

- [ ] exibir status atual da assinatura no perfil ou na pagina premium
- [ ] permitir cancelamento da assinatura pelo usuario
- [ ] refletir no app o estado `cancel_at_period_end`, quando aplicavel
- [ ] atualizar `profiles` de forma consistente via webhook
- [ ] comunicar claramente a diferenca entre acesso ativo e cancelamento agendado

## Fora De Escopo

- troca entre plano mensal e anual
- cupons e descontos complexos
- portal completo de faturas, se nao for necessario nesta fase

## Regras De Negocio

- o cancelamento idealmente deve preservar o acesso ate o fim do periodo pago
- o app deve diferenciar usuario `premium ativo`, `cancelado no fim do periodo` e `free`
- a fonte de verdade da assinatura deve continuar sendo o Stripe + webhook
- a interface nao deve confiar apenas no estado local para liberar ou bloquear recursos

## Mudancas Tecnicas Esperadas

- revisar `src/app/api/billing/checkout/route.ts` e endpoints relacionados a billing
- criar endpoint para cancelamento ou sessao de portal do cliente
- ajustar `src/app/(protected)/premium/page.tsx` e/ou `src/app/(protected)/profile/page.tsx`
- revisar `src/app/api/stripe/webhook/route.ts` para estados adicionais
- possivel necessidade de novas colunas em `profiles`, como `subscription_ends_at`

## Checklist De Implementacao

- [ ] decidir entre cancelamento direto no app ou Stripe Billing Portal
- [ ] revisar dados atuais persistidos em `profiles`
- [ ] implementar endpoint seguro de cancelamento/portal
- [ ] ajustar UI para estado de assinatura
- [ ] revisar webhook para refletir cancelamento e expiracao
- [ ] validar mensagens para o usuario

## Checklist De Validacao

- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] validar assinatura ativa
- [ ] validar cancelamento com acesso ate fim do periodo
- [ ] validar retorno para `free` apos expiracao
- [ ] validar comportamento em falha de webhook

## Dependencias

- integracao atual com Stripe
- webhook de billing
- modelo de dados de `profiles`

## Observacoes

Se o Stripe Billing Portal atender bem, essa pode ser a opcao mais simples e robusta para a primeira versao.
