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

### 9.2 Correção de Typos (Acentuação)

Corrigir palavras sem acentuação/cedilha/til em toda a codebase.

**Motivação:** ~101 ocorrências em 15 arquivos com texto em português faltando `ç`, `~`, `´`, `^`. Ex: "manutencao", "veiculo", "proxima", "nao", "Eletrico", "Hibrido", "servico", "Media", "oleo".

**Arquivos afetados (15):**
- `src/app/(protected)/dashboard/page.tsx` — 5 ocorrências
- `src/app/(protected)/maintenances/page.tsx` — 10 ocorrências
- `src/app/(protected)/maintenances/[id]/page.tsx` — 11 ocorrências
- `src/app/(protected)/maintenances/[id]/edit/page.tsx` — 4 ocorrências
- `src/app/(protected)/maintenances/new/page.tsx` — 4 ocorrências
- `src/app/(protected)/vehicles/page.tsx` — 12 ocorrências
- `src/app/(protected)/vehicles/[id]/page.tsx` — 8 ocorrências
- `src/app/(protected)/vehicles/[id]/edit/page.tsx` — 4 ocorrências
- `src/app/(protected)/vehicles/new/page.tsx` — 4 ocorrências
- `src/app/auth/signup/page.tsx` — 1 ocorrência
- `src/app/(protected)/profile/page.tsx` — 1 ocorrência
- `src/features/maintenances/view/MaintenanceForm.tsx` — 14 ocorrências
- `src/features/maintenances/model/schemas.ts` — 4 ocorrências
- `src/features/vehicles/model/schemas.ts` — 4 ocorrências
- `src/features/vehicles/view/VehicleForm.tsx` — 6 ocorrências

**Padrões de substituição:**

| Errado | Correto | Ocorrências |
|--------|---------|-------------|
| `manutencao` / `Manutencao` | `manutenção` / `Manutenção` | 11 |
| `veiculo` / `Veiculo` | `veículo` / `Veículo` | 24 |
| `veiculos` / `Veiculos` | `veículos` / `Veículos` | 11 |
| `proxima` | `próxima` | 4 |
| `nao` | `não` | 5 |
| `Eletrico` | `Elétrico` | 6 |
| `Hibrido` | `Híbrido` | 6 |
| `servico` | `serviço` | 4 |
| `Media` | `Média` | 4 |
| `Visao` | `Visão` | 2 |
| `comecar` | `começar` | 2 |
| `anotacoes` | `anotações` | 2 |
| `obrigatorio` / `obrigatoria` | `obrigatório` / `obrigatória` | 4 |
| `acao` | `ação` | 1 |
| `serao` | `serão` | 1 |
| `ultimas` / `Ultimas` | `últimas` / `Últimas` | 1 |
| `invalido` | `inválido` | 2 |
| `Descricao` | `Descrição` | 2 |
| `Titulo` | `Título` | 2 |
| `Concluida` | `Concluída` | 1 |
| `Observacoes` | `Observações` | 4 |
| `oleo` | `óleo` | 1 |
| `usuario` | `usuário` | 1 |

**Estimativa:** ~1h (substituições em massa com verificação)

---

### 9.3 Shimmer no Perfil

Adicionar loading state na página de perfil enquanto os dados do usuário são buscados.

**Motivação:** A página renderiza imediatamente com placeholders "Usuario" / "usuario@email.com" enquanto `supabase.auth.getUser()` e a query na tabela `profiles` estão pendentes. Outras páginas (`vehicles`, `maintenances`, `dashboard`) já usam `CardSkeleton` — o perfil é a única sem loading state.

**Mudanças em `src/app/(protected)/profile/page.tsx`:**
- Adicionar estado `loading` (inicia `true`)
- Enquanto `loading === true`, renderizar `CardSkeleton` ou shimmer específico do perfil
- Após fetch, setar `loading = false` e renderizar dados reais
- Remover fallbacks `"Usuario"` / `"usuario@email.com"` do render final (só mostrar se dado real vier vazio)

**Componentes reutilizáveis:**
- `CardSkeleton` em `src/components/ui/Skeleton.tsx`
- `LoadingSpinner` / `PageLoader` em `src/components/ui/LoadingSpinner.tsx`

**Estimativa:** ~30min

---

### 9.4 Correção do Redirect de Email (Supabase Config)

Corrigir o link de confirmação de email que envia `redirect_to` apontando para `localhost`.

**Motivação:** O `signUp` em `auth.service.ts` não define `redirectTo`. O Supabase usa a URL padrão do projeto (`Site URL`), que está configurada como `http://localhost:3000`. Em produção, usuários são redirecionados para localhost ao clicar no link de confirmação.

**Solução (dashboard Supabase):**
- Acessar [Supabase Dashboard](https://supabase.com/dashboard/project/oechxpgspfzzkplnyudg) > Authentication > URL Configuration
- Alterar **Site URL** para a URL de produção (ex: `https://pessoauto.vercel.app`)
- Adicionar URLs de redirecionamento permitidas em **Redirect URLs**

**Solução (código):**
- Opcionalmente adicionar `redirectTo` explícito no `signUp` em `auth.service.ts`:
  ```ts
  supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  ```

**Estimativa:** ~15min (config no dashboard)

---

### 9.5 Correção do `maintenance_date NOT NULL`

Permitir salvar manutenção com status "Pendente" sem data.

**Motivação:** O banco exige `maintenance_date NOT NULL`, mas o Zod schema permite opcional quando `status = "pending"`. O service filtra strings vazias, removendo o campo do payload, causando erro no banco.

**Solução — Migration para remover o NOT NULL:**
```sql
alter table public.maintenances
  alter column maintenance_date drop not null;
```

**Solução — Ajuste no service (`maintenance.service.ts`):**
- Na filtragem de payload (linhas 50-52 e 67-69), preservar `maintenance_date` como `null` quando string vazia e status for `"pending"`:
  ```ts
  // Ao invés de remover strings vazias, transformar em null
  if (data.maintenance_date === "" && data.status === "pending") {
    payload.maintenance_date = null;
  }
  ```

**Solução — Ajuste no tipo TypeScript:**
- `maintenance_date: string | null` já está correto em `types.ts`

**Estimativa:** ~1h (migration + service + validação)

---

### 9.6 Botões de Transição de Status (Workflow)

Adicionar botões de workflow na página de detalhes da manutenção para avançar o status sem precisar editar o formulário completo.

**Motivação:** Hoje o usuário precisa clicar em "Editar", abrir o formulário, alterar o status no dropdown e salvar. Um fluxo mais natural teria botões diretos como "Iniciar manutenção" (pending → scheduled) e "Finalizar" (scheduled → completed).

**Transições possíveis:**

| De | Para | Rótulo do botão | Cor |
|----|------|-----------------|-----|
| `pending` | `scheduled` | Agendar manutenção | Azul (primary) |
| `pending` | `completed` | Marcar como concluída | Verde |
| `scheduled` | `completed` | Finalizar manutenção | Verde |
| `scheduled` | `pending` | Voltar para pendente | Cinza (secondary) |
| `completed` | `pending` | Reabrir manutenção | Cinza (secondary) |

**Mudanças em `maintenances/[id]/page.tsx`:**
- Importar `useUpdateMaintenance` do viewmodel
- Adicionar handler `handleTransition(newStatus)` que chama `updateMaintenance({ id, data: { status: newStatus } })`
- Novo `Card` de "Ações" entre a seção "Próxima troca" e "Anexos"
- Botões condicionais baseados no `maintenance.status` atual
- Estado `transitioning` para loading dos botões

**Infraestrutura já existente:**
- `useUpdateMaintenance()` — aceita `Partial<MaintenanceFormData>`, já invalida cache
- `maintenance.service.update(id, data)` — já suporta partial updates
- `Button` com variantes `primary`, `secondary`, `outline`, `ghost`
- `CardFooter` no componente `Card`

**Estimativa:** ~1h30 (UI + handlers + toast feedback)

---

### 9.7 Notificações (Badges + Web Push)

Sistema de notificações para alertar o usuário sobre manutenções pendentes, agendadas não realizadas e prazos vencidos.

**Motivação:** Hoje o usuário só vê alertas ao abrir o dashboard. Com notificações, ele é proativamente avisado mesmo fora do app.

#### Fase 1 — Badges in-app (~2h)

- Badge com contador de alertas no ícone "Manutenções" do `BottomNav`
- Contador considera: pendentes com alta prioridade + trocas vencidas + agendadas com data passada
- Atualização em tempo real via `useDashboard` (já tem `refetchInterval: 60000`)
- Badge no ícone do `BottomNav` com `absolute` positioning e indicador numérico

**Mudanças:**
- `BottomNav.tsx` — adicionar badge numérico no item "Manutenções"
- Hook `useAlertCount` ou reutilizar `useDashboard` com `staleTime` baixo
- Separar alertas pendentes no `dashboard.service.ts` (já existe `pendingHighPriority`)

#### Fase 2 — Web Push (~4h) ✅

Arquitetura implementada:

```
pg_cron (diário 9h BRT)
  → Edge Function send-push-notifs
    → Query: maintenances com next_change_date vencida ou em até 3 dias
    → Busca push_subscriptions do usuário
    → Criptografa payload com crypto.subtle (ECDH + AES-128-GCM)
    → Assina com VAPID JWT (ES256)
    → Envia via Web Push API
  → Service Worker (sw.ts)
    → push event → showNotification
    → notificationclick → abre /maintenances/[id]
```

**Tabelas:**
- `push_subscriptions` — endpoint, p256dh, auth por usuário
- `notifications` — histórico de notificações enviadas

**Arquivos:**
- `src/app/sw.ts` — push + notificationclick handlers
- `src/hooks/usePushNotifications.ts` — hook subscribe/unsubscribe
- `supabase/functions/send-push-notifs/index.ts` — Edge Function sem dependências npm
- Profile page — toggle de ativação

**Configuração pendente:** secrets no Supabase Dashboard (`SUPABASE_SERVICE_ROLE_KEY`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`) + `NEXT_PUBLIC_VAPID_PUBLIC_KEY` no deploy de produção.

**Estimativa total:** ~6h (2h badges + 4h push)

---

### 9.8 Select de Veículo em Cascata (Brasil API)

Preenchimento assistido dos dados do veículo usando a Brasil API (FIPE), com selects em cascata: Marca → Modelo → Ano → Versão.

**Motivação:** Hoje o usuário precisa digitar manualmente marca, modelo, ano, versão. Com a API pública, ele seleciona o veículo em cascata e os campos são preenchidos automaticamente, reduzindo erros de digitação e padronizando os dados.

**API utilizada:** [Brasil API](https://brasilapi.com.br/api/fipe) (gratuita, sem autenticação)

**Endpoints:**
| Etapa | Endpoint | Retorno |
|-------|----------|---------|
| 1. Marcas | `GET /api/fipe/marcas/v1/carros` | Lista de marcas |
| 2. Modelos | `GET /api/fipe/marcas/v1/carros/{codigoMarca}/modelos` | Modelos da marca |
| 3. Anos | `GET /api/fipe/marcas/v1/carros/{codigoMarca}/modelos/{codigoModelo}/anos` | Anos do modelo |
| 4. Versão | Seleciona o ano → retorna valor FIPE e detalhes | Dados completos do veículo |

**Fluxo no formulário (`VehicleForm.tsx`):**

1. Botão "Buscar veículo" ao lado dos campos manuais (ou toggle)
2. Ao ativar, mostra 4 selects em cascata:
   - **Marca** (ex: Honda) → carrega ao montar
   - **Modelo** (ex: Civic) → carrega ao selecionar marca
   - **Ano** (ex: 2020) → carrega ao selecionar modelo
   - **Versão** (ex: 2.0 LX 16V Flex) → carrega ao selecionar ano
3. Ao selecionar a versão, preenche automaticamente: `brand`, `model`, `year`, `version`
4. Demais campos (placa, cor, km, combustível, etc.) continuam manuais
5. Se a API falhar ou o usuário preferir, campos manuais continuam funcionando

**Serviço (`fipe.service.ts`):**
```ts
// features/vehicles/services/fipe.service.ts
export const fipeService = {
  getBrands(): Promise<{ code: string; name: string }[]>,
  getModels(brandCode: string): Promise<{ code: string; name: string }[]>,
  getYears(brandCode: string, modelCode: string): Promise<{ code: string; name: string }[]>,
  getVersion(brandCode: string, modelCode: string, yearCode: string): Promise<FipeVehicle>,
};
```

**Cache:** Respostas da API cacheadas via TanStack Query com `staleTime: Infinity` (dados da FIPE não mudam com frequência).

**UI:**
- Toggle "Buscar por API" / "Cadastro manual" no topo do formulário
- Selects com loading state e mensagem de erro se API indisponível
- Fallback automático para campos manuais se API falhar

**Estimativa:** ~4h (serviço + viewmodel + UI + cache)

---

### 9.9 Lembrete Inteligente de Abastecimento por Localização

Lembrete mobile-first para sugerir o registro de abastecimento quando o usuário permanece parado próximo a um posto.

**Status atual:** ⚠️ Base funcional implementada, ainda pendente validação em campo e ajustes finos de heurística.

**O que já foi implementado:**

- Opt-in no perfil em `/profile`
  - toggle `Lembrete inteligente de abastecimento`
  - botões `Permitir localização` e `Permitir notificações`
  - status persistido de permissões
- Preferências no banco (`profiles`)
  - `fuel_station_reminders_enabled`
  - `location_permission_status`
  - `push_permission_status`
  - `last_fuel_reminder_at`
  - `last_fuel_reminder_lat`
  - `last_fuel_reminder_lng`
- Cache de postos ANP
  - tabela `public.fuel_stations`
  - carga inicial aplicada no projeto Supabase: `1262` postos
- Backend
  - `GET /api/fuel-stations/nearby` — busca postos próximos a partir do cache local
  - `POST /api/fuel-stations/should-notify` — decisão centralizada com regras mínimas
- Cliente
  - `useFuelStationReminder` para preferências e permissões
  - `FuelStationReminderProvider` com detecção simples de parada em foreground
  - notificação local com deep link para `/fuel/new?source=location-reminder`
- Service Worker
  - suporte a `notification.data.url` para deep link genérico

**Regras mínimas já ligadas no `should-notify`:**

- recurso precisa estar ativado
- localização precisa estar concedida
- parada mínima de `90s`
- precisão máxima de `100m`
- busca de posto em raio de `120m`
- cooldown de `6h` para lembrete recente
- bloqueio se houve abastecimento recente nas últimas `3h`

**Arquivos principais:**

- `src/app/(protected)/profile/page.tsx`
- `src/hooks/useFuelStationReminder.ts`
- `src/components/providers/FuelStationReminderProvider.tsx`
- `src/app/api/fuel-stations/nearby/route.ts`
- `src/app/api/fuel-stations/should-notify/route.ts`
- `src/lib/anp/fuel-stations.ts`
- `src/lib/fuel-stations.ts`
- `src/lib/geo.ts`
- `src/app/sw.ts`
- `supabase/migrations/20240604000007_location_reminder_preferences.sql`
- `supabase/migrations/20240604000008_fuel_stations_cache.sql`

**O que falta fazer:**

- testar em dispositivo com geolocalização real
- ajustar thresholds de parada/raio/precisão com base no teste real
- decidir se o recurso ficará só no app Android/Capacitor ou também no PWA
- ampliar a carga da ANP se a região de teste não estiver coberta pela carga inicial
- opcional: registrar eventos dedicados de lembrete (`fuel_reminder_events`) em vez de usar apenas `profiles` + `notifications`
- opcional: converter automaticamente o lembrete em contexto de abastecimento salvo

**Estimativa restante:** ~2h a ~6h, dependendo do resultado dos testes em campo e da necessidade de ampliar a heurística.

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

| # | Item | Status | Estimativa |
|---|------|--------|------------|
| 9.1 | Status e Prioridade de Manutenções | ✅ | ~4h |
| 9.2 | Correção de Typos (acentuação) | ✅ | ~1h |
| 9.3 | Shimmer no Perfil | ✅ | ~30min |
| 9.4 | Correção do Redirect de Email | ✅ | ~15min |
| 9.5 | Correção do `maintenance_date NOT NULL` | ✅ | ~1h |
| 9.6 | Botões de Transição de Status (Workflow) | ✅ | ~1h30 |
| 9.7 | Notificações — Badges in-app | ✅ | ~2h |
| 9.8 | Notificações — Web Push | ✅ | ~4h — Edge Function `send-push-notifs` + SW + toggle no perfil |
| 9.9 | Select de Veículo em Cascata (Brasil API) | ❌ | ~4h |
| 9.10 | Módulo de Combustível | ✅ | ~5h |
| 9.11 | Lembrete Inteligente por Localização | ⚠️ | base pronta; falta teste real e ajuste fino |

**Total restante:** ~4h + validação em campo da feature de localização

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
