# Historico De Notificacoes Na Interface

## Status

`planejado`

## Objetivo

Exibir ao usuario um historico simples de notificacoes relevantes dentro do app, principalmente para manutencoes e lembretes que ja foram enviados.

## Contexto

O projeto ja possui a tabela `notifications`, mas hoje esse historico ainda nao aparece claramente para o usuario final. Isso pode aumentar confianca, dar contexto de alertas e ajudar a reduzir dependencia exclusiva do push do sistema.

## Escopo

- [ ] criar listagem de notificacoes do usuario autenticado
- [ ] mostrar tipo, titulo, data e destino associado
- [ ] permitir abrir o recurso relacionado a partir da notificacao
- [ ] exibir estado vazio coerente

## Fora De Escopo

- inbox complexo com filtros avancados
- notificacoes em tempo real via realtime
- marcacao sofisticada de lida/nao lida, se nao existir no schema

## Regras De Negocio

- o usuario so pode ver o proprio historico
- a interface deve ser util mesmo com volume pequeno de notificacoes
- se o schema atual nao tiver campo de leitura, a UI inicial pode ser apenas historica

## Mudancas Tecnicas Esperadas

- revisar schema e tipos de `notifications`
- criar service/query de listagem
- decidir onde a tela fica: perfil, dashboard ou pagina dedicada
- criar componentes de listagem e empty state

## Checklist De Implementacao

- [ ] revisar campos disponiveis na tabela `notifications`
- [ ] criar query de listagem do usuario
- [ ] definir rota ou secao da UI
- [ ] renderizar lista com CTA de abertura
- [ ] validar ownership e mensagens de vazio

## Checklist De Validacao

- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] validar usuario sem notificacoes
- [ ] validar usuario com notificacoes reais
- [ ] validar links abrindo destino esperado

## Dependencias

- tabela `notifications`
- definicao de UX para onde essa lista fica

## Observacoes

Essa spec pode ganhar prioridade se push virar parte central da experiencia do produto.
