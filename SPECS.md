# SPECS.md — PessoAuto MVP

Sistema PWA de Controle de Manutenção Veicular

> Backlog executavel por feature: ver pasta `specs/`, com specs menores e checklists separados por iniciativa.

---

## Legenda

- ✅ Concluído
- ⚠️ Parcial / precisa ajuste
- ❌ Não iniciado

---

## 1. Milestone 1 — Setup & Fundação

| Item | Status | Observações |
|------|--------|-------------|
| Next.js 15 + TypeScript + App Router | ✅ | `src/` + `@/*` alias |
| TailwindCSS 4 | ✅ | Dark mode via `.dark` class |
| ESLint | ✅ | Zero erros, zero warnings |
| React Hook Form + Zod | ✅ | Schemas em `features/auth/model/schemas.ts` |
| TanStack Query | ✅ | `QueryProvider` configurado, ainda não usado |
| react-hot-toast | ✅ | `ToastProvider` configurado |
| clsx + tailwind-merge | ✅ | `cn()` em `lib/utils.ts` |

---

## 2. Supabase

| Item | Status | Observações |
|------|--------|-------------|
| Client (browser) | ✅ | `lib/supabase/client.ts` |
| Server | ✅ | `lib/supabase/server.ts` |
| Tipos do banco | ✅ | `types/supabase.ts` — 5 tabelas tipadas |
| Middleware de sessão | ✅ | Renova sessão automaticamente, redireciona não autenticados |
| Migrations SQL | ✅ | `supabase/migrations/20240604000000_initial_schema.sql` |
| RLS policies | ✅ | Implementadas para todas as 5 tabelas (TO authenticated + ownership) |
| Seed (categorias) | ✅ | 12 categorias de manutenção populadas |
| Trigger auto-profile | ✅ | `handle_new_user()` cria perfil ao cadastrar |
| MCP configurado | ✅ | OAuth autenticado no projeto `oechxpgspfzzkplnyudg` |
| Agent Skills | ✅ | `supabase` + `supabase-postgres-best-practices` instalados |

---

## 3. Autenticação

| Item | Status | Observações |
|------|--------|-------------|
| Login | ✅ | `/auth/login` — formulário + validação Zod + Supabase Auth |
| Cadastro | ✅ | `/auth/signup` — Supabase Auth com trigger de perfil |
| Logout | ✅ | `signOut()` Supabase + redirecionamento |
| Recuperação de senha | ✅ | `/auth/forgot-password` — Supabase `resetPasswordForEmail` |
| Callback (email confirmation) | ✅ | `/auth/callback` — exchange code for session |
| Rotas protegidas | ✅ | `AuthGuard` (client) + middleware (server) |
| Auth real (Supabase) | ✅ | `authService` 100% Supabase, sem branch dev/prod |

> **Email confirmation ativo:** Usuário recebe email do Supabase para confirmar cadastro. Callback em `/auth/callback` troca o code por sessão automaticamente.

---

## 4. PWA

| Item | Status | Observações |
|------|--------|-------------|
| Manifest | ✅ | `public/manifest.json` com nome, ícones, cores |
| Ícones (192x192 + 512x512) | ✅ | Gerados via `scripts/generate-icons.js` |
| Service Worker | ✅ | `@serwist/next` — build de produção funcional |
| Cache offline | ✅ | `defaultCache` do Serwist (NetworkFirst para navegação, CacheFirst para assets) |
| Instalação Android/iOS | ✅ | Manifest + meta tags + SW ativo em produção |

> **Migrado de `next-pwa@5.6.0` para `@serwist/next`** — compatível com Next.js 15, build de produção ok. SW em `src/app/sw.ts`, desativado em dev (`disable: true`).

---

## 5. Layout & UI

| Item | Status | Observações |
|------|--------|-------------|
| Mobile First | ✅ | BottomNav visível < `md`, Sidebar >= `md` |
| Dark mode | ✅ | Toggle sol/lua no header, `ThemeProvider` com SSR-safe |
| Navbar | ✅ | Logo + dark toggle + logout |
| BottomNav (mobile) | ✅ | 4 ícones: Dashboard, Veículos, Manutenções, Perfil |
| Sidebar (desktop) | ✅ | Mesma navegação em painel lateral |
| Loading states | ✅ | `LoadingSpinner`, `PageLoader` |
| Empty states | ✅ | `EmptyState` nos cards de veículos e manutenções |
| Skeletons | ✅ | `Skeleton`, `CardSkeleton` |
| Toasts | ✅ | `react-hot-toast` posicionado bottom-center |
| Safe area (iOS) | ✅ | CSS `pb-safe` com `env(safe-area-inset-bottom)` |

---

## 6. Páginas

| Página | Rota | Status | Observações |
|--------|------|--------|-------------|
| Login | `/auth/login` | ✅ | Form + Supabase Auth |
| Cadastro | `/auth/signup` | ✅ | Supabase Auth + trigger profile |
| Recuperar senha | `/auth/forgot-password` | ✅ | Supabase resetPasswordForEmail |
| Dashboard | `/dashboard` | ✅ | Cards, alertas (vencidos/em breve), últimas + próximas |
| Veículos | `/vehicles` | ✅ | Lista com cards, busca real do Supabase |
| Veículos | `/vehicles/new` | ✅ | Formulário de cadastro |
| Veículos | `/vehicles/[id]` | ✅ | Detalhes + exclusão com confirmação |
| Veículos | `/vehicles/[id]/edit` | ✅ | Edição com formulário pré-preenchido |
| Manutenções | `/maintenances` | ✅ | Histórico com filtro por veículo + badge VENCIDO |
| Manutenções | `/maintenances/new` | ✅ | Registro com selects de veículo + categoria |
| Manutenções | `/maintenances/[id]` | ✅ | Detalhes + próxima troca + exclusão |
| Manutenções | `/maintenances/[id]/edit` | ✅ | Edição com formulário pré-preenchido |
| Perfil | `/profile` | ✅ | Busca dados do Supabase (auth.user + profiles) |

---

## 7. Features Pendentes (MVP completo)

### 7.1 Banco de Dados

- [x] Criar migrations SQL para as 5 tabelas (`profiles`, `vehicles`, `maintenance_categories`, `maintenances`, `attachments`)
- [x] Criar RLS policies (usuário só vê os próprios dados)
- [x] Seed das categorias de manutenção
- [x] Bucket no Supabase Storage para anexos

### 7.2 Veículos — `features/vehicles/`

- [x] `model/types.ts` — tipos Vehicle
- [x] `model/schemas.ts` — Zod schema do formulário
- [x] `services/vehicle.service.ts` — CRUD via Supabase
- [x] `viewmodel/useVehicles.ts` — hooks com TanStack Query (useVehicles, useVehicle, useCreateVehicle, useUpdateVehicle, useDeleteVehicle)
- [x] `view/VehicleForm.tsx` — componente de formulário reutilizável (create + edit)
- [x] `view/` — páginas: lista com cards, cadastro, edição, detalhes com exclusão
- [x] Campos: marca, modelo, ano, versão, placa, cor, combustível, km atual, chassis, renavam, data aquisição, observações

### 7.3 Manutenções — `features/maintenances/`

- [x] `model/types.ts` — tipos Maintenance + MaintenanceWithRelations
- [x] `model/schemas.ts` — Zod schema + refine (next_change_km > vehicle_km)
- [x] `services/maintenance.service.ts` — CRUD com joins (vehicles + categories)
- [x] `viewmodel/useMaintenances.ts` — hooks TanStack Query (useMaintenances, useMaintenancesByVehicle, useMaintenance, useCreateMaintenance, useUpdateMaintenance, useDeleteMaintenance)
- [x] `view/MaintenanceForm.tsx` — formulário com selects de veículo + categoria + controle de próxima troca
- [x] `view/` — páginas: histórico com filtro por veículo, registro, edição, detalhes com badge VENCIDO
- [x] Cálculo de vida útil (KM e data) — controle de próxima troca com alerta visual
- [x] Controle de próxima troca (KM e data) — badge VENCIDO na listagem e detalhes
- [x] Upload de comprovantes (PDF, JPG, PNG, WEBP)

### 7.4 Dashboard — `features/dashboard/`

- [x] `services/dashboard.service.ts` — queries agregadas (total veículos, gastos mês/ano, alertas)
- [x] `viewmodel/useDashboard.ts` — hook com TanStack Query + auto-refresh a cada 60s
- [x] Cards: total veículos, gastos mês, gastos ano, total manutenções
- [x] Alertas: trocas vencidas (vermelho), próximas trocas (âmbar)
- [x] Resumo: últimas manutenções, próximas trocas programadas

### 7.5 Anexos

- [x] Serviço de upload para Supabase Storage (`attachment.service.ts`)
- [x] Vinculação com manutenção (tabela `attachments`)
- [x] Validação de tipo (PDF, JPG, PNG, WEBP) e tamanho (5MB)
- [x] Preview/download na tela de manutenção
- [x] Exclusão de anexos
- [x] Storage RLS policies (usuário só acessa próprios arquivos)

### 7.6 Correções Técnicas

- [x] Trocar `next-pwa` por `@serwist/next` (compatível com Next.js 15 build de produção)
- [x] Remover localStorage auth, usar Supabase Auth real
- [x] Conectar `authService` ao Supabase com credenciais reais
- [x] Middleware de proteção de rotas com Supabase
- [x] Perfil: carregar dados reais do usuário logado
- [x] Configurar credenciais Supabase no `.env.local`
- [x] Configurar MCP Supabase para gerenciamento do banco

---

## 8. Estrutura MVVM

```
src/
├── app/                        # Rotas (App Router)
│   ├── (protected)/            # Grupo de rotas protegidas
│   │   ├── dashboard/
│   │   ├── vehicles/
│   │   ├── maintenances/
│   │   └── profile/
│   └── auth/                   # Rotas públicas
├── components/
│   ├── guards/                 # AuthGuard
│   ├── layout/                 # Navbar, Sidebar, BottomNav
│   ├── providers/              # Theme, Query, Toast
│   └── ui/                     # Button, Input, Skeleton, etc.
├── features/
│   ├── auth/                   # ✅ Implementado
│   ├── vehicles/               # ✅ CRUD completo
│   │   ├── model/              # types.ts + schemas.ts (Zod)
│   │   ├── services/           # vehicle.service.ts (Supabase CRUD)
│   │   ├── view/               # VehicleForm.tsx (reutilizável)
│   │   └── viewmodel/          # useVehicles.ts (TanStack Query)
│   ├── maintenances/           # ✅ CRUD completo + controle próxima troca
│   │   ├── model/              # types.ts + schemas.ts (Zod + refine)
│   │   ├── services/           # maintenance.service.ts (Supabase CRUD com joins)
│   │   ├── view/               # MaintenanceForm.tsx (reutilizável)
│   │   └── viewmodel/          # useMaintenances.ts (TanStack Query)
│   └── dashboard/              # ✅ Dashboard agregado
│       ├── services/           # dashboard.service.ts (agregações)
│       └── viewmodel/          # useDashboard.ts (TanStack Query + auto-refresh)
├── hooks/                      # useTheme
├── lib/                        # supabase client/server, utils
├── types/                      # Database, tipos gerais
└── middleware.ts               # Renovação de sessão + proteção de rotas
```

---

## 9. Próximas Features (pós-MVP)

O backlog executavel do projeto foi movido para `specs/` para evitar duplicidade com este documento.

Use como fonte principal:

- `specs/README.md`
- `specs/backlog/`
- `specs/improvements/`
- `specs/qa/`
- `specs/operations/`

Resumo do que hoje esta tratado em specs:

- push notifications e historico de notificacoes
- calculator e relatorios de combustivel
- cancelamento Stripe
- Brasil API / FIPE
- lembrete por localizacao
- reconciliacao de migrations
- testes criticos
- revisao de envs e segredos
- onboarding / first run
- launch validation e runbook operacional

---

## 10. Fora do Escopo (confirmado)

- ❌ OCR / IA
- ❌ Integração FIPE
- ❌ Integração CRLV
- ❌ Gestão de oficinas
- ❌ Gestão de frotas
- ❌ Multiempresa
- ❌ React Native

---

## 11. Resumo

| Área | Concluído | Pendente |
|------|-----------|----------|
| Setup & Tooling | 100% | — |
| Autenticação | 100% | — |
| Layout & UI | 100% | — |
| PWA | 100% | — |
| Banco de Dados | 100% | — |
| Veículos | 100% | — |
| Manutenções | 100% | — |
| Dashboard | 100% | — |
| Anexos | 100% | — |

---

## 12. Próximas Features (pós-MVP) — Resumo

Este resumo deixou de ser a fonte principal do backlog.

Para priorizacao e ordem de execucao, consultar:

- `specs/README.md`

---

## 13. Módulo de Combustível (`features/fuel/`)

### 13.1 Banco de Dados

**Tabela `fuel_logs`:**

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | `uuid PK` | |
| `vehicle_id` | `uuid FK vehicles` | Veículo abastecido |
| `date` | `date NOT NULL` | Data do abastecimento |
| `odometer_km` | `int NOT NULL` | KM no momento do abastecimento |
| `liters` | `numeric(6,2) NOT NULL` | Litros abastecidos |
| `total_cost` | `numeric(10,2) NOT NULL` | Valor total pago |
| `price_per_liter` | `numeric(6,3)` | Preço/litro (auto: `total_cost / liters`) |
| `fuel_type` | `text NOT NULL` | `gasolina` / `etanol` / `diesel` / `gnv` |
| `is_full_tank` | `bool DEFAULT true` | Tanque cheio? Essencial para cálculo de média |
| `gas_station` | `text` | Nome do posto |
| `notes` | `text` | Observações |
| `created_at` | `timestamptz` | |

### 13.2 Cálculos

- **Média km/l:** diferença de KM entre 2 tanques cheios consecutivos ÷ litros do 2º abastecimento
- **Custo/km:** `total_cost ÷ km_percorridos`
- **Dashboard:** gasto total mês/ano, média geral km/l, última média

### 13.3 Estrutura (segue MVVM)

```
features/fuel/
├── model/types.ts       → FuelLog, FuelLogWithVehicle
├── model/schemas.ts     → Zod (fuelSchema + refine odometer_km > último)
├── services/fuel.service.ts → Supabase CRUD + cálculo de médias
├── view/FuelForm.tsx    → Formulário reutilizável
└── viewmodel/useFuel.ts → TanStack Query hooks
```

### 13.4 Rotas

| Rota | Descrição |
|------|-----------|
| `/fuel` | Abastecimentos — lista + cards de estatísticas |
| `/fuel/new` | Novo abastecimento |
| `/fuel/[id]` | Detalhes + preço/litro |
| `/fuel/[id]/edit` | Edição |
| `/fuel/calculator` | Calculadora de combustível (placeholder) |
| `/fuel/reports` | Relatórios semanal/mensal/anual (placeholder) |

**Layout:** tabs (Abastecimentos | Calculadora | Relatórios) + Sidebar colapsável

### 13.5 Integrações

- **BottomNav:** 5º ícone (bomba de combustível)
- **Dashboard:** card "Gasto com Combustível" (mês/ano) + média km/l
- **Veículo:** seção "Histórico de Combustível" na página de detalhes

### 13.6 RLS

Ownership via `vehicle_id`, mesmo padrão de `maintenances`.

---

## 14. Monetização (Freemium)

### 14.1 Plano Gratuito

| Funcionalidade | Limite |
|---------------|--------|
| Veículos | Até 2 |
| Manutenções | Até 50 registros |
| Abastecimentos | Até 50 registros |
| Anexos | 5 MB por arquivo, 25 MB total |
| Dashboard | Alertas + cards básicos |
| Badges in-app | ✅ |
| PWA + Offline | ✅ |
| Auth (email/senha) | ✅ |

### 14.2 Plano Premium — R$ 12,90/mês (ou R$ 99,90/ano)

| Funcionalidade | Descrição |
|---------------|-----------|
| Veículos ilimitados | Sem limite de veículos cadastrados |
| Histórico ilimitado | Manutenções e abastecimentos sem limite |
| Calculadora de combustível | Gasolina vs Etanol, custo/km, autonomia |
| Relatórios | Gráficos semanal, mensal, anual (gastos, km/l) |
| Exportação CSV | Baixar histórico de manutenções e abastecimentos |
| Web Push | Notificações de manutenções vencidas e trocas programadas |
| Brasil API (FIPE) | Preenchimento automático marca/modelo/ano |
| Anexos expandidos | 25 MB por arquivo, 250 MB total |
| Badge PRO | Indicador visual no perfil |

### 14.3 Implementação da Cobrança

**Stripe + Supabase (recomendado):**
- Stripe Checkout (cartão, PIX)
- Webhook atualiza `profiles.subscription_tier`
- Novas colunas em `profiles`:

```sql
alter table profiles add column subscription_tier text default 'free';
alter table profiles add column subscription_ends_at timestamptz;
alter table profiles add column stripe_customer_id text;
```

- Middleware/RLS restringe operações por tier
- Edge Function gerencia webhooks do Stripe

### 14.4 Gatilhos de Upgrade

| Gatilho | Momento |
|---------|---------|
| 3º veículo | Modal "Plano gratuito: até 2 veículos" |
| 51ª manutenção | Modal de upgrade |
| 51º abastecimento | Modal de upgrade |
| `/fuel/calculator` | Tela de preview + CTA |
| `/fuel/reports` | Tela de preview + CTA |
| Exportar / Push / FIPE | CTA de upgrade |

### 14.5 Projeção de Receita

| Cenário | Premium | Receita/mês | Custo Supabase | Lucro/mês |
|---------|---------|-------------|----------------|-----------|
| Conservador | 100 | R$ 1.290 | ~R$ 50 | R$ 1.240 |
| Moderado | 500 | R$ 6.450 | ~R$ 100 | R$ 6.350 |
| Otimista | 2.000 | R$ 25.800 | ~R$ 300 | R$ 25.500 |

> Supabase Free Tier cobre até ~500 usuários ativos. Upgrade para Pro (US$ 25/mês) necessário ao escalar.

### 14.6 Prioridade de Implementação

| # | Feature Premium | Estimativa |
|---|----------------|------------|
| 1 | Stripe Checkout + Webhook | ~3h |
| 2 | Limites de tier (RLS/middleware) | ~1h |
| 3 | Gatilhos de upgrade (modais) | ~2h |
| 4 | Relatórios de combustível | ~6h |
| 5 | Exportação CSV | ~2h |
| 6 | Calculadora de combustível | ~3h |
| 7 | Web Push notifications | ~4h |
| 8 | Brasil API (FIPE) | ~4h |

**Total monetização: ~25h**
