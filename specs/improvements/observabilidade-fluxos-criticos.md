# Observabilidade Dos Fluxos Criticos

## Status

`planejado`

## Objetivo

Melhorar a observabilidade dos fluxos mais sensiveis do projeto para facilitar suporte, depuracao e validacao em producao.

## Contexto

Hoje alguns fluxos criticos dependem de tentativa manual e inspecao indireta quando falham. Isso afeta principalmente auth callback, reset password, checkout Stripe, webhook e push notifications.

## Escopo

- [ ] mapear fluxos criticos que precisam de melhor visibilidade
- [ ] definir logging minimo util por fluxo
- [ ] revisar como expor diagnostico sem vazar dados sensiveis
- [ ] melhorar trilha de depuracao para push e billing

## Fora De Escopo

- plataforma completa de observabilidade externa logo de inicio
- coleta massiva de analytics de produto
- logar dados sensiveis de usuario ou segredos

## Regras De Negocio

- logs devem ajudar a responder por que um fluxo falhou
- observabilidade nao pode expor tokens, senhas ou payloads sensiveis desnecessarios
- em fluxos do usuario final, erros devem continuar retornando mensagens adequadas mesmo com logging adicional

## Mudancas Tecnicas Esperadas

- revisar auth callback e reset password
- revisar checkout e webhook Stripe
- revisar Edge Function ou endpoints de push
- decidir onde diagnosticos ficam e como sao consultados

## Checklist De Implementacao

- [ ] listar fluxos com menor visibilidade hoje
- [ ] definir eventos ou logs minimos por fluxo
- [ ] instrumentar os pontos mais criticos
- [ ] revisar mascaramento de dados sensiveis
- [ ] documentar como usar os logs no suporte tecnico

## Checklist De Validacao

- [ ] logs ajudam a identificar falha de auth callback
- [ ] logs ajudam a identificar falha de checkout/webhook
- [ ] logs ajudam a identificar falha de push
- [ ] nenhum segredo ou token sensivel e exposto indevidamente

## Dependencias

- estrategia de logging do projeto
- acesso a logs de plataforma quando necessario

## Observacoes

O recurso de lembrete por localizacao ja ganhou diagnostico interno; isso pode servir de referencia para outros fluxos.
