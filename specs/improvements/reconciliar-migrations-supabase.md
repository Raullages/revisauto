# Reconciliar Migrations Do Supabase

## Status

`planejado`

## Objetivo

Reconciliar o historico de migrations entre repositorio e projeto Supabase remoto, para que o banco volte a ter um fluxo previsivel e auditavel de evolucao.

## Contexto

Hoje existe divergencia clara entre o que esta versionado em `supabase/migrations/` e o que aparece no projeto remoto. Isso aumenta risco ao criar novas migrations, revisar schema ou automatizar deploy de banco.

## Escopo

- [ ] mapear estado real do schema remoto
- [ ] mapear migrations locais e remotas equivalentes
- [ ] registrar divergencias confirmadas
- [ ] definir estrategia de reconciliacao sem perda de schema funcional
- [ ] estabilizar convencao para novas migrations

## Fora De Escopo

- refatorar schema de produto sem necessidade real
- apagar historico remoto sem plano seguro
- reescrever tabelas estaveis apenas por organizacao estetica

## Regras De Negocio

- o schema funcional em producao nao pode ser quebrado durante a reconciliacao
- a fonte de verdade imediata para comportamento do app continua sendo o schema real do banco
- nenhuma migration nova deve assumir que o historico local representa exatamente o remoto sem confirmacao

## Mudancas Tecnicas Esperadas

- revisar `supabase/MIGRATION_STATE.md`
- revisar `supabase/migrations/`
- revisar schema remoto e tipos em `src/types/supabase.ts`
- definir processo para novas migrations e geracao de tipos

## Checklist De Implementacao

- [ ] levantar lista atual de migrations locais
- [ ] levantar lista atual de migrations remotas
- [ ] comparar schema remoto com tipos gerados
- [ ] decidir estrategia: baseline nova, reconciliacao documental ou limpeza controlada
- [ ] documentar procedimento futuro para evolucao de schema

## Checklist De Validacao

- [ ] confirmar que novas migrations podem ser aplicadas com previsibilidade
- [ ] confirmar alinhamento entre schema real e tipos TypeScript
- [ ] revisar se `MIGRATION_STATE.md` ficou suficiente para retomada futura

## Dependencias

- acesso ao projeto Supabase
- tipos atualizados do banco

## Observacoes

Essa melhoria reduz risco estrutural e deve acontecer antes de crescer muito mais o numero de migrations.
