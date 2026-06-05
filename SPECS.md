# SPECS.md — PessoAuto MVP

Sistema PWA de Controle de Manutenção Veicular

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
- [ ] Bucket no Supabase Storage para anexos

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

### 9.1 Status e Prioridade de Manutenções

Adicionar controle de status e prioridade às manutenções, permitindo registrar reparos pendentes sem data definida.

**Motivação:** Hoje toda manutenção exige data. Isso não cobre casos como "quebrou a grade do ar condicionado" — algo que precisa ser feito, mas não é urgente nem tem data marcada.

**Campos novos na tabela `maintenances`:**

| Campo | Tipo | Valores | Default |
|-------|------|---------|---------|
| `status` | `text` | `pending`, `scheduled`, `completed` | `completed` |
| `priority` | `text` | `low`, `medium`, `high` | `medium` |

**Mudanças no formulário (`MaintenanceForm`):**
- Campo `status` — radio/select: Pendente / Agendado / Concluído
- Campo `priority` — só aparece se `status = pending`: Baixa / Média / Alta
- `maintenance_date` — obrigatório apenas se `status = scheduled` ou `completed`

**Mudanças na listagem (`maintenances/page.tsx`):**
- Abas ou filtro por status (Todos / Pendentes / Agendados / Concluídos)
- Badge visual de prioridade (🔵 baixa, 🟡 média, 🔴 alta)
- Itens pendentes com alta prioridade aparecem nos alertas do dashboard

**Mudanças no Dashboard:**
- Nova seção "Reparos Pendentes" com cards agrupados por prioridade
- Itens `pending` + `priority = high` entram nos alertas vermelhos

**Migration necessária:**
```sql
alter table public.maintenances
  add column status text not null default 'completed',
  add column priority text not null default 'medium';

alter table public.maintenances
  add constraint check_status check (status in ('pending', 'scheduled', 'completed')),
  add constraint check_priority check (priority in ('low', 'medium', 'high'));
```

**Estimativa:** ~4h (migration + backend + formulário + listagem + dashboard)

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
