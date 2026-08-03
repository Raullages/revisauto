# Launch Readiness Checklist

> Checklist de referencia ampla. Para execucao pratica e priorizada, ver `specs/qa/validar-launch-candidate.md` e `specs/operations/runbook-release-operacional.md`.

Documento operacional para avaliar se o `PessoAuto` esta pronto para um lancamento publico inicial.

Objetivo:
- concentrar criterios de prontidao tecnica, produto e operacao
- servir como checklist executavel para humanos e agentes LLM
- evitar que novas features avancem antes do nucleo estar confiavel

Escopo:
- PWA web com `Next.js + Supabase`
- autenticacao por email/senha
- modulos principais: `vehicles`, `maintenances`, `dashboard`, `attachments`, `fuel`, `profile`, `push notifications`

Convencoes de status:
- `[ ]` nao iniciado
- `[-]` em andamento
- `[x]` concluido
- `[n/a]` fora do escopo desta release

Status inicial preenchido em `2026-06-12` com base em:
- leitura do codigo e das migrations no repositorio
- `npm run lint` e `npm run build`
- inspecao basica do projeto Supabase conectado

Regra usada neste preenchimento inicial:
- `[x]` verificado diretamente nesta analise
- `[-]` implementado ou fortemente indicado no codigo, mas sem validacao manual ponta a ponta
- `[ ]` ausente, contradito pela evidencia atual, ou dependente de ambiente/QA ainda nao confirmado

## 1. Release Gate

Marcar esta secao apenas quando todos os itens criticos abaixo estiverem fechados.

- [ ] Autenticacao validada ponta a ponta em ambiente real
- [ ] Banco, migrations e tipos TypeScript alinhados
- [-] RLS validado para todos os recursos sensiveis
- [-] CRUD de veiculos validado
- [-] CRUD de manutencoes validado
- [-] Upload, listagem e exclusao de anexos validados
- [-] Modulo de combustivel validado
- [-] Dashboard sem erros funcionais nos cenarios principais
- [ ] Experiencia mobile validada em dispositivo real
- [-] PWA instalada e funcional em producao
- [ ] Erros criticos conhecidos resolvidos ou documentados com aceitacao explicita

## 2. Critical Path Validation

### 2.1 Authentication

- [-] Cadastro de usuario cria conta com sucesso
- [-] Confirmacao de email redireciona corretamente para `/auth/callback`
- [-] Login funciona com credenciais validas
- [-] Login exibe erro util com credenciais invalidas
- [-] Logout encerra sessao e redireciona corretamente
- [-] Recuperacao de senha envia email corretamente
- [-] Sessao persiste ao recarregar a pagina
- [-] Sessao persiste ao reabrir o app dentro da janela esperada
- [-] Rotas protegidas bloqueiam usuario anonimo
- [-] Usuario autenticado nao sofre loop de redirect

### 2.2 Vehicles

- [-] Criar primeiro veiculo
- [-] Listar veiculos do usuario autenticado
- [-] Buscar/filtrar veiculos
- [-] Editar veiculo existente
- [-] Excluir veiculo com confirmacao
- [-] Verificar que um usuario nao acessa veiculos de outro usuario

### 2.3 Maintenances

- [-] Criar manutencao `completed`
- [-] Criar manutencao `scheduled`
- [-] Criar manutencao `pending` sem data
- [-] Editar manutencao alterando status
- [-] Validar workflow rapido de status na tela de detalhe
- [-] Excluir manutencao com confirmacao
- [-] Validar badge/alerta de vencido
- [-] Validar proxima troca por data
- [-] Validar proxima troca por quilometragem
- [-] Verificar que um usuario nao acessa manutencoes de outro usuario

### 2.4 Attachments

- [-] Upload de PDF
- [-] Upload de imagem suportada
- [-] Bloqueio de tipo nao suportado
- [-] Bloqueio de arquivo acima do limite
- [-] Preview ou download funciona
- [-] Exclusao do anexo remove referencia e arquivo esperado
- [-] Verificar que um usuario nao acessa anexos de outro usuario

### 2.5 Fuel

- [-] Criar abastecimento
- [-] Editar abastecimento
- [-] Excluir abastecimento
- [-] Calculo de `price_per_liter` correto
- [-] Estatisticas basicas exibidas sem erro
- [-] Media km/l coerente com abastecimentos de tanque cheio
- [-] Verificar que um usuario nao acessa abastecimentos de outro usuario

### 2.6 Dashboard

- [-] Cards principais exibem dados corretos
- [-] Gastos do mes coerentes com manutencoes concluidas
- [-] Gastos do ano coerentes com manutencoes concluidas
- [-] Alertas de vencido aparecem corretamente
- [-] Alertas de proxima troca aparecem corretamente
- [-] Pendencias de alta prioridade aparecem corretamente
- [-] Lista de ultimas manutencoes coerente
- [-] Lista de proximas trocas coerente

## 3. Data And Schema Integrity

- [x] Revisar todas as migrations em `supabase/migrations/`
- [ ] Confirmar que ambiente alvo recebeu todas as migrations necessarias
- [x] Confirmar alinhamento entre schema real e `src/types/supabase.ts`
- [-] Confirmar existencia e comportamento correto de `status` e `priority` em `maintenances`
- [x] Confirmar que `maintenance_date` aceita `null` para `pending`
- [x] Confirmar schema e RLS de `fuel_logs`
- [x] Confirmar schema e RLS de `push_subscriptions`
- [x] Confirmar schema e RLS de `notifications`
- [x] Validar seeds necessarios, especialmente `maintenance_categories`
- [x] Revisar constraints que suportam `upsert` e conflitos esperados

Observacoes tecnicas atuais a revisar:
- [x] Resolvido: `src/types/supabase.ts` foi atualizado a partir do schema real e agora inclui `notifications`
- [x] Resolvido: push subscriptions agora usam unicidade por `endpoint`, com index unico e `upsert(onConflict: "endpoint")`
- [x] Confirmado desalinhamento entre migrations aplicadas no Supabase e arquivos versionados no repositorio

## 4. Security And Access Control

- [x] Validar RLS de `profiles`
- [x] Validar RLS de `vehicles`
- [x] Validar RLS de `maintenances`
- [x] Validar RLS de `attachments`
- [x] Validar RLS de `fuel_logs`
- [x] Validar RLS de `push_subscriptions`
- [x] Validar RLS de `notifications`
- [-] Confirmar que nenhum dado de outro usuario aparece em joins
- [x] Confirmar que bucket/storage segue mesma regra de ownership
- [ ] Revisar variaveis de ambiente expostas e segredos necessarios

Notas desta revisao:
- `vehicles`, `maintenances` e `fuel_logs` receberam filtros explicitos de ownership nas leituras por `id`
- mutacoes criticas agora validam ownership antes de `update` ou `delete`
- `attachments` teve endurecimento em `list` e `upload`; `remove` continua principalmente apoiado em RLS e deve ser observado no QA funcional
- detalhes tecnicos registrados em `supabase/OWNERSHIP_REVIEW.md`

## 5. UX And Product Readiness

### 5.1 First Run Experience

- [-] Usuario entende o que fazer ao entrar sem dados
- [-] Existe CTA claro para cadastrar primeiro veiculo
- [-] Existe CTA claro para registrar primeira manutencao
- [-] Empty states explicam valor da tela, nao apenas ausencia de dados

### 5.2 Form Quality

- [-] Mensagens de validacao sao claras e em portugues consistente
- [-] Campos obrigatorios estao claros
- [-] Labels e placeholders sao consistentes
- [-] Formularios funcionam bem com teclado mobile
- [-] Nao ha zoom indesejado em inputs no iOS
- [ ] Estados de submit evitam duplo envio

### 5.3 Loading And Error States

- [-] Todas as telas principais possuem loading state coerente
- [-] Todas as mutacoes principais exibem feedback de sucesso
- [-] Todas as mutacoes principais exibem feedback de erro
- [ ] Falhas de rede nao deixam a UI em estado confuso

## 6. Mobile And PWA Validation

- [ ] Validar em iPhone real
- [ ] Validar em Android real
- [-] Bottom navigation utilizavel
- [-] Safe area correta no iOS
- [-] Scroll e overflow horizontal ausentes nas telas principais
- [-] Instalacao do PWA funciona
- [-] App abre como standalone apos instalacao
- [x] Service worker ativo em producao
- [ ] Cache offline nao quebra navegacao principal
- [x] Manifest, icones e nome do app corretos

## 7. Notifications

- [-] Permissao de notificacao solicitada em momento adequado
- [-] Assinatura push salva corretamente em `push_subscriptions`
- [-] Cancelamento da assinatura remove registro corretamente
- [x] Edge Function de envio esta implantada e configurada
- [ ] VAPID keys configuradas no cliente e no backend
- [ ] Alertas relevantes geram notificacoes esperadas
- [ ] Historico de notificacoes esta consistente, se fizer parte da release

## 8. Performance And Reliability

- [x] `npm run lint` sem erros
- [x] `npm run build` sem erros
- [ ] Dashboard aceitavel com volume moderado de historico
- [ ] Listagens principais sem regressao perceptivel de performance
- [ ] Navegacao entre telas sem travamentos perceptiveis
- [-] Falhas do Supabase degradam com comportamento aceitavel

## 9. Launch Content And Operations

- [ ] URL de producao configurada no Supabase Auth
- [ ] Redirect URLs configuradas no Supabase Auth
- [ ] Variaveis de ambiente de producao revisadas
- [x] Documento de release atualizado
- [ ] README atualizado com informacoes reais do projeto
- [ ] Processo minimo de suporte/triagem definido
- [ ] Backup e recuperacao entendidos para o ambiente de dados

Notas desta revisao:
- existe um checklist externo dedicado em `EXTERNAL_RELEASE_VERIFICATION.md`
- foram confirmadas duas Edge Functions de push ativas no projeto (`send-push-notifications` e `send-push-notifs`)
- ambas estao sem `verify_jwt`, o que precisa de decisao antes do launch se push for feature de release

## 10. Nice To Have Before Or Soon After Launch

- [ ] Select de veiculo em cascata via Brasil API
- [-] Dashboard com insights mais fortes
- [ ] Melhorias extras de onboarding
- [ ] Historico de notificacoes visivel na interface
- [ ] Relatorios simples de combustivel

## 11. Explicitly Deferred

Itens que nao devem bloquear a primeira release publica.

- [n/a] Stripe e monetizacao completa
- [n/a] Gatilhos sofisticados de upgrade
- [n/a] Exportacao CSV
- [n/a] Calculadora avancada de combustivel
- [n/a] Relatorios complexos com graficos
- [n/a] Multiempresa, frota ou oficina

## 12. Recommended Launch Sequence

Ordem sugerida de execucao:

1. Corrigir desalinhamentos de schema, tipos e RLS.
2. Validar fluxos criticos de autenticacao, veiculos, manutencoes, anexos e combustivel.
3. Validar experiencia mobile e PWA em dispositivos reais.
4. Fechar polimento de UX: empty states, erros, loading, onboarding minimo.
5. Validar push notifications e operacao basica de producao.
6. Atualizar documentacao e executar release gate final.

## 13. Final Sign-Off

Preencher antes do lancamento:

- Responsavel tecnico:
- Data da validacao final:
- Ambiente validado:
- Riscos aceitos conscientemente:
- Go / No-Go:
