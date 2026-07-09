# Lembrete de abastecimento por localizacao

## Objetivo

Detectar quando o usuario esta parado por um periodo relevante perto de um posto de combustivel e enviar um lembrete para registrar o abastecimento no app.

## Encaixe no projeto atual

- O app ja tem `Next.js`, PWA e `Capacitor`, entao o caminho mais seguro para isso e tratar como recurso mobile-first.
- Ja existe infraestrutura de push:
  - inscricao no cliente em `src/hooks/usePushNotifications.ts`
  - historico em `public.notifications`
  - envio centralizado em `supabase/functions/send-push-notifications/index.ts`
- O abastecimento ja aceita `gas_station` em `fuel_logs`, o que ajuda a fechar o ciclo do lembrete para registro.

## Fluxo do usuario

1. O usuario ativa uma opcao no perfil para receber lembretes inteligentes de abastecimento.
2. O app explica claramente que vai usar localizacao apenas para detectar paradas proximas a postos.
3. O usuario concede:
   - permissao de notificacao
   - permissao de localizacao
4. Durante o uso mobile, o app observa mudancas de localizacao e estima se houve parada real.
5. Se o usuario ficar parado perto de um posto por tempo suficiente, o app agenda ou envia uma notificacao.
6. Ao tocar na notificacao, o usuario abre direto a tela de novo abastecimento.
7. Se ele registrar um abastecimento, o app bloqueia novos lembretes naquele contexto por um tempo.

## Regras de negocio recomendadas

### Gatilho principal

- Considerar parada apenas se:
  - velocidade estimada estiver muito baixa ou zero
  - variacao geografica estiver dentro de um raio pequeno
  - o estado durar pelo menos `60-120s`
- Considerar posto proximo apenas se houver um POI a ate `80-120m`.

### Regras anti-falso-positivo

- Nao disparar com apenas `30s` de parada.
- Nao disparar se o usuario estiver em deslocamento lento recente, como transito ou fila.
- Nao disparar se a precisao da localizacao estiver ruim.
- Nao disparar novamente no mesmo local em uma janela curta, por exemplo `2-6h`.
- Nao disparar se houve abastecimento recente, por exemplo nas ultimas `3h`.
- Limitar para no maximo `1` lembrete por dia por veiculo no MVP.

### Conteudo da notificacao

- Titulo: `Voce parou em um posto?`
- Corpo: `Se abasteceu agora, nao esqueca de registrar no app.`
- Deep link: `/fuel/new`

## Arquitetura sugerida

## 1. Preferencias do usuario

Criar uma tabela para armazenar opt-ins e limites do recurso.

Exemplo de campos:

- `user_id`
- `fuel_station_reminders_enabled`
- `location_permission_status`
- `push_permission_status`
- `last_fuel_reminder_at`
- `last_fuel_reminder_lat`
- `last_fuel_reminder_lng`

Observacao: isso pode ficar em `profiles` no MVP para reduzir complexidade, mas uma tabela dedicada de preferencias escala melhor.

## 2. Catalogo de postos

Voce vai precisar de uma fonte de postos. As opcoes mais realistas sao:

1. Base externa por API de mapas/POI.
2. Tabela propria `fuel_stations` com cache local dos postos consultados.

Para MVP, recomendo tabela propria com cache de consultas para reduzir custo e dependencia externa a cada parada.

Campos iniciais:

- `id`
- `name`
- `brand`
- `latitude`
- `longitude`
- `source`
- `updated_at`

Idealmente usar `PostGIS` ou ao menos lat/lng com calculo de distancia.

## 3. Eventos de contexto de parada

Criar uma tabela de eventos para nao depender so da memoria do app.

Exemplo: `fuel_reminder_events`

- `id`
- `user_id`
- `vehicle_id` opcional no MVP
- `status` (`candidate`, `sent`, `dismissed`, `converted`)
- `latitude`
- `longitude`
- `accuracy_m`
- `stopped_at`
- `notified_at`
- `station_id` nullable
- `station_name_snapshot`
- `created_at`

Isso permite:

- evitar duplicidade
- medir falso positivo
- saber quantos lembretes viraram registro de abastecimento

## 4. Deteccao no cliente mobile

O gatilho de parada deve nascer no cliente, porque o backend atual nao recebe stream de localizacao.

Fluxo tecnico:

1. O app coleta localizacao somente quando o recurso estiver ativo.
2. Mantem um estado local simples com:
   - ultima localizacao valida
   - inicio da possivel parada
   - ultima vez que notificou
3. Quando atingir o tempo minimo parado, o app consulta o backend.
4. O backend responde se existe posto proximo e se pode notificar.
5. O app mostra notificacao local ou chama endpoint para push remoto, dependendo do contexto.

Para o projeto atual, eu priorizaria notificacao local no mobile antes de push remoto. E mais simples e imediato para um evento detectado no proprio aparelho.

## 5. Backend de validacao

Criar um endpoint server-side para centralizar a decisao e nao deixar a regra toda no cliente.

Sugestao de contrato:

- entrada:
  - `lat`
  - `lng`
  - `accuracy`
  - `stoppedForSeconds`
  - `vehicleId` opcional
- saida:
  - `shouldNotify`
  - `reason`
  - `station`
  - `cooldownUntil`

Esse endpoint deve:

- validar opt-in do usuario
- buscar posto proximo
- verificar cooldown
- verificar lembrete recente
- opcionalmente verificar abastecimento recente em `fuel_logs`

## 6. Conversao do lembrete em abastecimento

Ao salvar um novo abastecimento:

- procurar evento recente `sent` do mesmo usuario em janela curta e marcar como `converted`
- salvar `gas_station` sugerido quando fizer sentido

No MVP, nao precisa preencher automaticamente o posto. Basta abrir `/fuel/new` com sugestao opcional depois.

## Implementacao por fases

## Status atual no projeto

### Ja implementado

- Opt-in no perfil em `src/app/(protected)/profile/page.tsx`
- Persistencia das preferencias em `public.profiles`
  - `fuel_station_reminders_enabled`
  - `location_permission_status`
  - `push_permission_status`
  - `last_fuel_reminder_at`
  - `last_fuel_reminder_lat`
  - `last_fuel_reminder_lng`
- Hook `src/hooks/useFuelStationReminder.ts`
  - leitura e escrita das preferencias
  - solicitacao de permissao de localizacao
  - solicitacao de permissao de notificacao
- Provider `src/components/providers/FuelStationReminderProvider.tsx`
  - observacao simples com `watchPosition`
  - deteccao de parada em foreground
  - chamada do backend para decidir se notifica
- Deep link de notificacao em `src/app/sw.ts`
  - suporte a `notification.data.url`
  - abertura de `/fuel/new?source=location-reminder`
- Cache de postos com base ANP
  - tabela `public.fuel_stations`
  - carga inicial no projeto: `1262` registros validos
- Endpoints implementados
  - `GET /api/fuel-stations/nearby`
  - `POST /api/fuel-stations/should-notify`

### Regras minimas atualmente ligadas

- parada minima: `90s`
- precisao maxima: `100m`
- raio para posto proximo: `120m`
- cooldown de lembrete: `6h`
- bloqueio por abastecimento recente: `3h`

### Ainda falta fazer

- validar em dispositivo real com geolocalizacao
- ajustar heuristicas com base no teste de campo
- decidir se o recurso sera Android/Capacitor-only no primeiro rollout ou se permanece tambem no PWA
- ampliar a carga da ANP caso a area de teste nao esteja coberta
- criar tabela/eventos dedicados de lembrete se precisarmos medir melhor conversao e falso positivo
- opcionalmente relacionar lembrete e abastecimento salvo

## Fase 1: MVP funcional

- [x] Adicionar preferencia do recurso no perfil.
- [x] Adicionar captura de permissao de localizacao.
- [x] Detectar parada simples no cliente mobile.
- [x] Criar endpoint para checar posto proximo e cooldown.
- [x] Disparar notificacao local com deep link para `/fuel/new`.
- [x] Registrar historico minimo no banco via `profiles` + `notifications`.
- [ ] Validar o comportamento em uso real.

## Fase 2: Melhorar precisao

- [x] Cache de postos em tabela propria.
- Regras por veiculo.
- Conversao automatica de evento em `converted`.
- Ajuste de heuristicas com dados reais.

## Fase 3: Inteligencia de produto

- Aprender horarios e locais frequentes.
- Diferenciar transito de parada real.
- Priorizar postos ja usados pelo usuario.
- Ajustar distancia e tempo conforme historico.

## Mudancas concretas no projeto

### Frontend

- `src/app/(protected)/profile/page.tsx`
  - adicionar toggle de lembrete inteligente
  - explicar permissao de localizacao
- novo hook, por exemplo `src/hooks/useFuelStationReminder.ts`
  - gerenciar permissao, observacao de localizacao e logica local de parada
- `src/app/sw.ts`
  - suportar notificacao com deep link para `/fuel/new`

### Backend / banco

- nova migration para preferencias do recurso
- nova migration para eventos de lembrete
- opcional: nova migration para `fuel_stations`
- novo endpoint ou edge function para `shouldNotify`
- ajuste da edge function de push caso o time prefira push remoto em vez de notificacao local

## Recomendacao pratica

Para este projeto, o melhor primeiro passo nao e geolocalizacao em background completa. O melhor primeiro passo e:

1. fazer o recurso opt-in no perfil
2. implementar deteccao simples de parada no app Android via Capacitor
3. validar posto proximo no backend
4. disparar notificacao local com deep link para novo abastecimento

Isso entrega valor rapido, reduz custo tecnico e permite medir se o lembrete realmente aumenta os registros.

## Decisoes em aberto

1. O recurso sera Android-only no inicio ou tambem precisa mirar navegador/PWA?
2. [Resolvido] Vamos usar base externa de postos ou manter cache proprio no Supabase?
   - adotado: API da ANP como fonte + cache proprio em `fuel_stations`
3. [Resolvido] O lembrete sera notificacao local imediata ou push remoto registrado pelo backend?
   - adotado: notificacao local imediata no MVP
4. O usuario escolhe um veiculo padrao para esse lembrete ou o MVP sera sem veiculo vinculado?
