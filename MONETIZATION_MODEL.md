# Backlog de Monetizacao — revisAuto

## Status Atual

- [x] Modelo freemium definido
- [x] Plano `free` com limites documentados
- [x] Plano `premium` mensal definido em `R$ 12,90/mes`
- [x] Sem plano anual por enquanto
- [x] Base tecnica inicial da monetizacao implementada
- [x] Migration aplicada no Supabase remoto
- [x] Dashboard simples para free e completo para premium
- [x] Página protegida de upgrade com CTA comercial
- [x] Checkout mensal iniciado via Stripe Checkout
- [x] Webhook Stripe preparado para atualizar assinatura
- [ ] Upgrade real via Stripe
- [ ] Validar fluxo completo em ambiente real
- [ ] Resolver erro de prerender no `build` em `/` e `/profile`

## Objetivo

Implementar um modelo freemium simples, facil de comunicar e facil de operar.

O plano gratuito deve permitir o uso real do produto por um motorista individual.
O plano premium deve monetizar conveniencia, volume e recursos avancados.

---

## Estrategia

O `revisAuto` nao deve cobrar para o usuario simplesmente cadastrar um carro e registrar informacoes basicas.
O produto deve cobrar para entregar mais controle, mais praticidade e mais inteligencia no uso recorrente.

Mensagem central sugerida:

> Cuide melhor do seu veiculo com menos esquecimento e mais controle dos gastos.

---

## Estrutura de Planos

### Plano Gratuito

Pensado para o usuario testar e usar o app no dia a dia com um unico veiculo.

| Recurso | Limite |
|---|---|
| Veiculos | 1 veiculo |
| Manutencoes | 25 registros |
| Abastecimentos | 25 registros |
| Dashboard | Versao simples |
| Cadastro manual de abastecimento | Liberado |
| Auth | Liberado |
| PWA / app | Liberado |

### Plano Premium — R$ 12,90/mes

Assinatura mensal com cancelamento a qualquer momento.

| Recurso | Descricao |
|---|---|
| Veiculos ilimitados | Sem limite de cadastro |
| Manutencoes ilimitadas | Historico completo |
| Abastecimentos ilimitados | Historico completo |
| Dashboard completo | Mais visao sobre uso e custos |
| Postos proximos | Recurso premium no fluxo de abastecimento |
| Calculadora de combustivel | Comparacoes e apoio a decisao |
| Relatorios | Visao por periodo e acompanhamento de gastos |

---

## Decisoes de Produto

### O que fica no plano gratuito

O gratuito continua util de verdade:

1. cadastrar 1 veiculo
2. registrar manutencoes
3. registrar abastecimentos
4. acessar dashboard simples

Isso evita que o produto pareca travado cedo demais.

### O que fica no premium

O premium concentra o que aumenta valor percebido no uso recorrente:

1. mais de 1 veiculo
2. historico maior de manutencoes
3. historico maior de abastecimentos
4. dashboard mais completo
5. postos proximos no abastecimento
6. calculadora de combustivel
7. relatorios

Essa divisao faz sentido porque o usuario paga por profundidade e conveniencia, nao por acesso minimo.

---

## Gatilhos de Upgrade

Os principais gatilhos dentro do produto devem ser:

1. tentativa de cadastrar o 2o veiculo
2. tentativa de registrar a 26a manutencao
3. tentativa de registrar o 26o abastecimento
4. acesso a `postos proximos`
5. acesso a `calculadora`
6. acesso a `relatorios`

Mensagens sugeridas:

- `O plano gratuito permite 1 veiculo. Faça upgrade para cadastrar mais.`
- `Voce atingiu o limite de 25 manutencoes do plano gratuito.`
- `Voce atingiu o limite de 25 abastecimentos do plano gratuito.`
- `Este recurso faz parte do plano Premium.`

---

## Posicionamento Comercial

### Oferta principal

- `Premium por R$ 12,90/mes`
- `Cancelamento a qualquer momento`

### Decisao sobre plano anual

Neste momento, a melhor decisao e nao lancar plano anual.

Motivos:

1. reduz atrito de compra no inicio
2. evita sensacao ruim de aprisionamento
3. simplifica suporte e comunicacao
4. permite validar preco e proposta com menos risco

Se o produto ganhar maturidade e a conversao mensal ficar boa, o anual pode entrar depois como opcao adicional, nunca como obrigacao.

---

## Regra de Liberacao por Plano

### Free

Permite:

1. `1` veiculo
2. `25` manutencoes
3. `25` abastecimentos
4. `dashboard simples`

Bloqueia:

1. `mais de 1 veiculo`
2. `mais de 25 manutencoes`
3. `mais de 25 abastecimentos`
4. `postos proximos`
5. `calculadora`
6. `relatorios`

### Premium

Permite:

1. veiculos ilimitados
2. manutencoes ilimitadas
3. abastecimentos ilimitados
4. dashboard completo
5. postos proximos
6. calculadora
7. relatorios

---

## Recomendacao Tecnica

Para a implementacao, aplicar controle em duas camadas:

1. interface: esconder ou sinalizar recurso premium e exibir CTA de upgrade
2. regra de negocio: validar limite antes de criar veiculo, manutencao e abastecimento

Implementacao inicial sugerida:

1. `profiles.subscription_tier` com default `free`
2. checagem de tier nos services
3. pagina de assinatura no perfil
4. integracao futura com Stripe Checkout mensal

---

## Backlog Inicial de Monetizacao

### Fase 1 — Base do plano

1. [x] adicionar tier no perfil do usuario
2. [x] mostrar status do plano na pagina de perfil
3. [x] criar componente de CTA para upgrade

### Fase 2 — Limites do gratuito

1. [x] limitar criacao de veiculos a 1 no free
2. [x] limitar manutencoes a 25 no free
3. [x] limitar abastecimentos a 25 no free

### Fase 3 — Travas de recurso premium

1. [x] bloquear `postos proximos`
2. [x] bloquear `calculadora`
3. [x] bloquear `relatorios`
4. [x] diferenciar dashboard simples x completo

### Fase 4 — Cobranca

1. [ ] integrar Stripe Checkout mensal
2. [x] receber webhook
3. [x] atualizar tier do usuario via webhook
4. [ ] permitir cancelamento

---

## Implementado Nesta Etapa

1. migration adicionando `profiles.subscription_tier` com `default 'free'`
2. helpers de billing com tiers, limites e validacoes de acesso
3. bloqueio de criacao acima do limite free para:
   - veiculos
   - manutencoes
   - abastecimentos
4. exibicao do plano atual na pagina de perfil
5. bloqueio visual e funcional das paginas premium:
   - `postos proximos`
   - `calculadora`
   - `relatorios`
6. badges `Premium` nas tabs do modulo de combustivel
7. mensagens reais de erro de limite nos fluxos de cadastro
8. aplicacao da migration de `subscription_tier` no projeto Supabase
9. dashboard reduzido para `free` e dashboard completo mantido para `premium`
10. pagina `/premium` criada com oferta, comparativo e CTA de upgrade
11. rota `POST /api/billing/checkout` criada para abrir o Stripe Checkout
12. rota `POST /api/stripe/webhook` criada para sincronizar assinatura com `profiles`

## Configuracao Necessaria do Stripe

Env vars necessarias no app:

1. `STRIPE_SECRET_KEY`
2. `STRIPE_PRICE_MONTHLY_ID`
3. `STRIPE_WEBHOOK_SECRET`

Passos no Stripe:

1. criar um produto Premium com preco mensal de `R$ 12,90`
2. copiar o `price_id` mensal para `STRIPE_PRICE_MONTHLY_ID`
3. criar um webhook apontando para `/api/stripe/webhook`
4. assinar os eventos:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. copiar o segredo do webhook para `STRIPE_WEBHOOK_SECRET`

---

## Ponto Atual

Estado atual da implementacao:

1. a pagina `/premium` ja chama a rota de checkout real do Stripe
2. a rota `POST /api/billing/checkout` ja cria sessao de assinatura mensal
3. a rota `POST /api/stripe/webhook` ja esta pronta para atualizar:
   - `subscription_tier`
   - `subscription_status`
   - `stripe_customer_id`
   - `stripe_subscription_id`
4. as colunas de billing ja foram aplicadas no Supabase remoto
5. as envs do Stripe ja foram configuradas

Pendencias imediatas:

1. testar o clique real de upgrade em `/premium`
2. confirmar redirecionamento para Checkout hospedado do Stripe
3. confirmar retorno do webhook promovendo o usuario para `premium`
4. investigar e corrigir erro de prerender no `build` para as rotas `/` e `/profile`

Observacao tecnica:

- `npm run lint` esta ok, sem erros
- `npm run build` compila a parte do Stripe, mas hoje para em um erro de prerender fora do fluxo de cobranca

## Proximos Passos Recomendados

1. aplicar o mesmo conceito de plano no dashboard
2. criar pagina de upgrade mais explicita dentro de `/profile`
3. integrar Stripe Checkout mensal
4. ligar webhook para promover `subscription_tier` para `premium`
5. criar fluxo de cancelamento

---

## Resumo Executivo

Modelo aprovado para primeira versao:

- `Free`: 1 veiculo, 25 manutencoes, 25 abastecimentos, dashboard simples
- `Premium`: R$ 12,90/mes, cancelamento a qualquer momento
- `Premium inclui`: veiculos ilimitados, historico ilimitado, dashboard completo, postos proximos, calculadora e relatorios
- `Sem plano anual por enquanto`

Esse modelo e simples, claro para o usuario e tecnicamente facil de implementar em etapas.
