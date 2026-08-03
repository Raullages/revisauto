# Specs

Esta pasta concentra especificacoes pequenas, objetivas e executaveis para features, melhorias tecnicas e itens de produto.

## Objetivo

- tirar backlog e ideias de docs muito longos
- facilitar retomada de contexto por feature
- registrar checklist tecnico e funcional por item
- deixar claro o que falta implementar e como validar

## Estrutura

- `backlog/`: features e entregas ainda nao implementadas ou incompletas
- `improvements/`: melhorias tecnicas, refactors, documentacao, qualidade e operacao
- `qa/`: specs de validacao manual, smoke tests e readiness
- `operations/`: runbooks e organizacao de release/operacao
- `done/`: historico opcional de specs concluidas, quando fizer sentido preservar

## Convencao De Nome

Use nomes em minusculo, com palavras separadas por hifen.

Exemplos:

- `implementar-calculator.md`
- `implementar-relatorios-combustivel.md`
- `implementar-brasil-api-fipe.md`
- `reconciliar-migrations-supabase.md`

## Status Sugerido

Cada spec deve deixar claro seu status atual logo no topo.

Valores sugeridos:

- `planejado`
- `em andamento`
- `bloqueado`
- `concluido`

## Template Base

```md
# Titulo Da Spec

## Status

`planejado`

## Objetivo

Descrever o que precisa ser entregue.

## Contexto

Explicar por que isso existe e qual problema resolve.

## Escopo

- [ ] item 1
- [ ] item 2
- [ ] item 3

## Fora De Escopo

- item que nao entra agora

## Regras De Negocio

- regra 1
- regra 2

## Mudancas Tecnicas Esperadas

- arquivos e modulos afetados
- endpoints, migrations ou integracoes
- comportamento de UI

## Checklist De Implementacao

- [ ] ajustar schema/model
- [ ] implementar service
- [ ] implementar UI
- [ ] adicionar feedback de loading/erro
- [ ] revisar impacto em mobile e premium/free

## Checklist De Validacao

- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] teste manual do fluxo principal
- [ ] validar edge cases

## Dependencias

- dependencia 1
- dependencia 2

## Observacoes

Notas livres.
```

## Primeiras Specs

Backlog inicial estruturado nesta pasta:

- `backlog/implementar-calculator.md`
- `backlog/implementar-relatorios-combustivel.md`
- `backlog/implementar-brasil-api-fipe.md`
- `backlog/implementar-cancelamento-stripe.md`

Melhorias tecnicas iniciais estruturadas nesta pasta:

- `improvements/reconciliar-migrations-supabase.md`
- `improvements/adicionar-testes-criticos.md`
- `improvements/melhorar-readme.md`
- `improvements/deep-link-auth-mobile.md`

Specs adicionais de backlog:

- `backlog/implementar-push-notifications.md`
- `backlog/historico-notificacoes-ui.md`
- `backlog/ajustar-lembrete-localizacao.md`

Melhorias adicionais:

- `improvements/observabilidade-fluxos-criticos.md`
- `improvements/revisar-envs-e-segredos.md`
- `improvements/melhorar-onboarding-first-run.md`

Specs de QA e operacao:

- `qa/validar-launch-candidate.md`
- `operations/runbook-release-operacional.md`

## Prioridades

### Release Critical

Itens que mais reduzem risco estrutural, de release ou de ambiente real.

- `improvements/reconciliar-migrations-supabase.md`
- `improvements/revisar-envs-e-segredos.md`
- `improvements/deep-link-auth-mobile.md`
- `backlog/implementar-push-notifications.md`
- `qa/validar-launch-candidate.md`
- `operations/runbook-release-operacional.md`

### Alta

Itens com impacto forte em confianca do produto, onboarding e sustentacao tecnica.

- `improvements/adicionar-testes-criticos.md`
- `improvements/observabilidade-fluxos-criticos.md`
- `improvements/melhorar-readme.md`
- `improvements/melhorar-onboarding-first-run.md`
- `backlog/ajustar-lembrete-localizacao.md`

### Media

Itens importantes para aprofundar valor de produto e melhorar a experiencia premium.

- `backlog/historico-notificacoes-ui.md`
- `backlog/implementar-calculator.md`
- `backlog/implementar-relatorios-combustivel.md`
- `backlog/implementar-cancelamento-stripe.md`

### Pos-Launch / Expansao

Itens valiosos, mas menos urgentes para estabilizacao e readiness inicial.

- `backlog/implementar-brasil-api-fipe.md`

## Ordem Sugerida De Execucao

Sequencia pratica sugerida para as proximas rodadas de trabalho:

1. `improvements/reconciliar-migrations-supabase.md`
2. `improvements/revisar-envs-e-segredos.md`
3. `improvements/deep-link-auth-mobile.md`
4. `improvements/adicionar-testes-criticos.md`
5. `improvements/observabilidade-fluxos-criticos.md`
6. `improvements/melhorar-readme.md`
7. `improvements/melhorar-onboarding-first-run.md`
8. `backlog/implementar-push-notifications.md`
9. `backlog/ajustar-lembrete-localizacao.md`
10. `qa/validar-launch-candidate.md`
11. `operations/runbook-release-operacional.md`
12. `backlog/historico-notificacoes-ui.md`
13. `backlog/implementar-calculator.md`
14. `backlog/implementar-relatorios-combustivel.md`
15. `backlog/implementar-cancelamento-stripe.md`
16. `backlog/implementar-brasil-api-fipe.md`

## Observacao De Uso

- `README.md` e docs longos continuam como referencia ampla
- `specs/` passa a ser o backlog executavel principal
- quando uma iniciativa crescer demais dentro de um arquivo grande, prefira extrair para uma spec propria aqui
