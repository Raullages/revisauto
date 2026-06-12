# Launch Execution Plan

Plano de execucao derivado de `LAUNCH_READINESS_CHECKLIST.md`.

Objetivo:
- transformar o checklist em ordem pratica de trabalho
- reduzir risco antes do lancamento publico inicial
- separar claramente o que deve ser corrigido, validado e documentado

Escopo deste plano:
- estabilizacao tecnica
- validacao funcional
- validacao mobile/PWA
- prontidao operacional minima

Fora do escopo deste plano:
- monetizacao
- features premium adiadas
- expansoes grandes de produto sem impacto direto em launch readiness

## 1. Strategy

Principio geral:
- primeiro corrigir inconsistencias estruturais
- depois validar fluxos criticos
- depois polir experiencia e operacao

Ordem de prioridade:
1. Integridade de dados e consistencia tecnica
2. Fluxos criticos do produto
3. Push notifications e comportamento PWA
4. UX de primeiro uso e estados de erro/loading
5. Documentacao e operacao de release

## 2. Workstreams

### WS1. Schema And Type Alignment

Objetivo:
- alinhar repositorio, banco e tipos TypeScript

Itens:
- corrigir desalinhamento entre migrations aplicadas no Supabase e arquivos versionados
- atualizar `src/types/supabase.ts` para refletir schema real
- incluir `notifications` nos tipos
- revisar `push_subscriptions` para suportar corretamente `upsert(onConflict: "user_id")`
- revisar se ha mais gaps entre codigo e schema atual

Saida esperada:
- repositorio representa corretamente o estado atual do banco
- tipos estao coerentes com as tabelas reais
- operacoes de push nao dependem de comportamento inconsistente

Critério de conclusao:
- migrations e schema atual reconciliados
- tipos atualizados
- pendencias estruturais conhecidas zeradas ou explicitamente aceitas

### WS2. Security And Access Control Validation

Objetivo:
- confirmar que a modelagem de acesso esta correta na pratica

Itens:
- revisar joins e consultas com foco em isolamento por usuario
- revisar RLS de tabelas de dominio e notificacoes
- revisar storage policies do bucket de anexos
- revisar exposicao de variaveis publicas vs privadas

Saida esperada:
- baixo risco de vazamento de dados entre usuarios

Critério de conclusao:
- nenhuma falha critica de ownership aberta
- riscos residuais documentados

### WS3. Critical Path Functional Validation

Objetivo:
- validar os fluxos mais importantes do usuario final

Itens:
- autenticacao completa: signup, callback, login, logout, reset
- CRUD de veiculos
- CRUD de manutencoes
- fluxo `pending`, `scheduled`, `completed`
- upload e remocao de anexos
- CRUD de combustivel
- dashboard com dados coerentes nos principais cenarios

Saida esperada:
- fluxo principal do produto confiavel para uso inicial

Critério de conclusao:
- todos os cenarios criticos executados sem erro bloqueante
- erros encontrados corrigidos ou explicitamente priorizados

### WS4. PWA, Push And Device Validation

Objetivo:
- validar comportamentos dependentes de ambiente real

Itens:
- instalacao do PWA
- funcionamento em modo standalone
- service worker em producao
- navegacao basica com cache offline sem regressao grave
- fluxo de permissao de notificacao
- subscribe/unsubscribe push
- entrega de notificacoes reais
- comportamento de clique da notificacao abrindo a manutencao correta

Saida esperada:
- PWA confiavel e notificacoes operacionais

Critério de conclusao:
- fluxo de push validado ponta a ponta
- PWA validado em pelo menos um iPhone e um Android

### WS5. UX Readiness And Product Polish

Objetivo:
- reduzir friccao para primeiro uso e melhorar confianca do usuario

Itens:
- revisar empty states e CTAs iniciais
- revisar mensagens de erro e sucesso
- revisar loading states das telas principais
- revisar protecao contra duplo submit
- revisar formularios em mobile

Saida esperada:
- experiencia inicial mais clara e menos propensa a abandono

Critério de conclusao:
- onboarding minimo claro
- estados de erro/loading consistentes nas telas principais

### WS6. Release Operations And Documentation

Objetivo:
- deixar o projeto pronto para uma primeira operacao publica controlada

Itens:
- revisar configuracao de URL e redirects no Supabase Auth
- revisar variaveis de ambiente de producao
- atualizar `README.md` com informacoes reais do projeto
- manter `RELEASE.md` coerente com o estado atual
- definir processo minimo de triagem de bugs e suporte

Saida esperada:
- projeto com documentacao minima confiavel para manutencao e launch

Critério de conclusao:
- configuracoes externas revisadas
- documentacao minima atualizada

## 3. Execution Phases

### Phase 1. Structural Stabilization

Prioridade: critica

Inclui:
- WS1 completo
- partes criticas do WS2

Motivo:
- nao faz sentido validar profundamente fluxos funcionais se schema, tipos e comportamento de push ainda estao desalinhados

Entregaveis:
- base tecnica reconciliada
- riscos estruturais mapeados

### Phase 2. Core Product Validation

Prioridade: critica

Inclui:
- WS3 completo

Motivo:
- garante que o produto principal funciona de ponta a ponta

Entregaveis:
- execucao dos fluxos criticos
- lista objetiva de bugs encontrados

### Phase 3. Device And Runtime Validation

Prioridade: alta

Inclui:
- WS4 completo

Motivo:
- PWA e push dependem de validacao real em ambiente/dispositivo

Entregaveis:
- validacao de dispositivos
- validacao do push real

### Phase 4. UX Hardening

Prioridade: media-alta

Inclui:
- WS5 completo

Motivo:
- produto pode ate funcionar sem isso, mas lancar sem polimento aumenta abandono e ruido de suporte

Entregaveis:
- estados de UI consistentes
- onboarding minimo melhorado

### Phase 5. Operational Readiness

Prioridade: media

Inclui:
- WS6 completo

Motivo:
- garante sustentacao minima do lancamento

Entregaveis:
- docs atualizadas
- configuracoes externas revisadas

## 4. Immediate Backlog

Ordem recomendada para os primeiros itens de execucao:

1. Corrigir alinhamento de `src/types/supabase.ts` com schema real.
2. Resolver inconsistencia de `push_subscriptions.user_id` vs `upsert(onConflict: "user_id")`.
3. Mapear diferenca entre migrations aplicadas no Supabase e migrations versionadas no repositorio.
4. Revisar consultas com join de `maintenances`, `fuel_logs` e anexos sob a otica de ownership.
5. Executar validacao funcional dos fluxos de auth.
6. Executar validacao funcional dos fluxos de veiculos e manutencoes.
7. Executar validacao funcional de anexos e combustivel.
8. Validar dashboard com cenarios reais.
9. Validar PWA e push em dispositivo real.
10. Atualizar `README.md` e revisar operacao de producao.

## 5. Dependencies

Dependencias fortes:
- WS1 antes de WS4
- WS1 antes de fechar WS3
- WS3 antes de declarar launch readiness
- WS4 antes de considerar push/PWA como feature de release
- WS6 depende do estado quase final das fases anteriores

Dependencias fracas:
- WS5 pode correr em paralelo apos estabilizacao estrutural inicial

## 6. Suggested Decision Gates

### Gate A. Technical Base Ready

Pergunta:
- schema, tipos e comportamento estrutural estao confiaveis o suficiente para comecar QA manual serio?

Para passar:
- WS1 concluido
- riscos criticos estruturais zerados

### Gate B. Product Core Ready

Pergunta:
- o usuario consegue usar o produto principal sem encontrar falhas bloqueantes?

Para passar:
- WS3 concluido
- sem bug bloqueante aberto em auth, vehicles, maintenances, attachments ou fuel

### Gate C. Launch Candidate

Pergunta:
- ja existe confianca suficiente para abrir o acesso publico inicial?

Para passar:
- WS4 concluido para os cenarios de release
- WS5 em nivel aceitavel
- WS6 concluido

## 7. Proposed Sequencing For The Next Session

Sequencia sugerida para a proxima etapa de trabalho tecnico:

1. Fechar WS1.
2. Revisar rapidamente WS2 nos pontos mais criticos.
3. Rodar WS3 por modulo.
4. Rodar WS4 em ambiente real.
5. Fechar WS5 e WS6.

## 8. Expected Outcome

Ao final deste plano, o projeto deve estar em um destes estados:

- `launch candidate`: pronto para liberacao controlada
- `needs another hardening pass`: funcional, mas ainda com gaps de confianca
- `not ready`: persistem gaps estruturais ou bloqueantes
