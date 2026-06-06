# Release v1.1.0

## Melhorias e Correções

### 🔧 Correções de Infraestrutura

- **Sessão persistente** — Corrigido bug que exigia novo login ao reabrir o app. `AuthGuard` agora usa `getUser()` (validação no Supabase com refresh automático) em vez de `getSession()` (cache local). A sessão permanece ativa por até 7 dias (padrão do refresh token).
- **Redirect de email** — Links de confirmação de cadastro não apontam mais para `localhost`. Adicionado `emailRedirectTo` explícito no `signUp` apontando para `/auth/callback`.
- **`maintenance_date NOT NULL`** — Corrigido erro ao salvar manutenção com status "Pendente" sem data. Migration `drop not null` aplicada no banco + ajuste no service para enviar `null` quando o status for `pending`.

### ✨ Novas Funcionalidades

- **Badge de alertas no BottomNav** — Ícone "Manutenções" agora exibe contador numérico vermelho com o total de alertas ativos (pendentes alta prioridade + trocas vencidas + agendadas com data passada). Atualiza a cada 60s.
- **Botões de workflow na manutenção** — Card "Ações" na tela de detalhes com transições rápidas de status: Agendar, Finalizar, Marcar como concluída, Voltar para pendente, Reabrir. Sem precisar entrar no formulário de edição.
- **Alertas de alta prioridade no Dashboard** — Itens pendentes com prioridade alta agora aparecem como alertas vermelhos na seção "Alertas", com badge "ALTA PRIORIDADE".

### 🎨 UI/UX

- **Shimmer no Perfil** — Loading state com skeleton (avatar circular + linhas) substitui os placeholders "Usuario" / "usuario@email.com" enquanto os dados são carregados.
- **Zoom em inputs (mobile)** — Corrigido zoom indesejado do iOS ao focar inputs. Todos `<input>`, `<select>` e `<textarea>` agora usam `text-base` (16px) em telas mobile, prevenindo o zoom automático do Safari.
- **Overflow horizontal (mobile)** — Corrigido scroll lateral nas páginas de manutenção. Adicionado `overflow-x-hidden` no container principal do layout protegido.

### 📝 Ortografia

- **120+ correções de acentuação** em 18 arquivos. Palavras como "manutencao", "veiculo", "proxima", "nao", "Eletrico", "Hibrido", "servico", "Media", "oleo" agora estão corretas com `ç`, `~`, `´`, `^`.

### 📄 Documentação

- `SPECS.md` atualizado com status de todos os itens pós-MVP (seções 9.1 a 9.9).
- Novas features planejadas: Web Push notifications (9.8) e Select de veículo em cascata via Brasil API (9.9).

---

## Arquivos Alterados

| Arquivo | Mudança |
|---------|---------|
| `src/components/guards/AuthGuard.tsx` | `getSession()` → `getUser()` |
| `src/features/auth/services/auth.service.ts` | `emailRedirectTo` no `signUp` |
| `src/features/dashboard/services/dashboard.service.ts` | +`alertCount`, +`pendingHighPriority`, +`scheduledPastDate` |
| `src/app/(protected)/dashboard/page.tsx` | Alertas de alta prioridade na seção Alertas |
| `src/app/(protected)/maintenances/[id]/page.tsx` | Card "Ações" com botões de workflow |
| `src/app/(protected)/profile/page.tsx` | Shimmer/loading state |
| `src/components/layout/BottomNav.tsx` | Badge numérico no ícone Manutenções |
| `src/components/ui/Input.tsx` | `text-base md:text-sm` |
| `src/app/(protected)/layout.tsx` | `overflow-x-hidden` no `<main>` |
| `src/features/maintenances/services/maintenance.service.ts` | Ajuste `maintenance_date: null` para pending |
| `src/features/maintenances/view/MaintenanceForm.tsx` | Typos + `text-base md:text-sm` |
| `src/features/vehicles/view/VehicleForm.tsx` | Typos + `text-base md:text-sm` |
| `src/features/maintenances/model/schemas.ts` | Typos nas mensagens de validação |
| `src/features/vehicles/model/schemas.ts` | Typos nas mensagens de validação |
| `src/app/(protected)/vehicles/page.tsx` | Typos |
| `src/app/(protected)/vehicles/[id]/page.tsx` | Typos |
| `src/app/(protected)/vehicles/[id]/edit/page.tsx` | Typos |
| `src/app/(protected)/vehicles/new/page.tsx` | Typos |
| `src/app/(protected)/maintenances/page.tsx` | Typos + `text-base md:text-sm` |
| `src/app/(protected)/maintenances/[id]/edit/page.tsx` | Typos |
| `src/app/(protected)/maintenances/new/page.tsx` | Typos |
| `src/app/auth/signup/page.tsx` | Typos |
| `supabase/migrations/20240604000003_drop_maintenance_date_not_null.sql` | Migration |
| `SPECS.md` | Atualização de status |
| `RELEASE.md` | Este documento |

