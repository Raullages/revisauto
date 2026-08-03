# Ajustar Lembrete Por Localizacao

## Status

`planejado`

## Objetivo

Refinar o recurso de lembrete de abastecimento por localizacao com base na implementacao atual e na validacao em campo que ainda falta consolidar.

## Contexto

O MVP funcional ja existe e a base tecnica do recurso esta pronta. O que ainda falta e transformar essa base em comportamento confiavel de produto, com heuristicas ajustadas, rollout claro e melhor capacidade de observacao.

## Escopo

- [ ] validar o recurso em dispositivo real com geolocalizacao
- [ ] ajustar heuristicas de parada, raio e precisao
- [ ] decidir rollout inicial: Android-only, Capacitor-only ou tambem PWA
- [ ] revisar cobertura da base de postos para area de teste real
- [ ] avaliar necessidade de eventos dedicados de lembrete

## Fora De Escopo

- geolocalizacao em background completa logo na primeira iteracao
- machine learning ou personalizacao complexa
- integracao com mapas de terceiros em tempo real para cada evento

## Regras De Negocio

- o recurso deve continuar opt-in
- precisao ruim de GPS nao pode gerar falso positivo agressivo
- o cooldown nao deve ser salvo de modo a bloquear o usuario quando a notificacao falhar
- a experiencia precisa priorizar notificacao local simples antes de sofisticacoes extras

## Mudancas Tecnicas Esperadas

- revisar `FuelStationReminderProvider`
- revisar endpoint `POST /api/fuel-stations/should-notify`
- revisar diagnostico local e ferramentas internas de teste
- revisar cobertura da tabela `fuel_stations`
- possivel criacao futura de `fuel_reminder_events`

## Checklist De Implementacao

- [ ] rodar validacao em campo em dispositivo real
- [ ] ajustar thresholds com base no teste
- [ ] decidir escopo de plataforma do primeiro rollout
- [ ] revisar necessidade de ampliar base ANP
- [ ] avaliar modelagem de eventos dedicados

## Checklist De Validacao

- [ ] validar parada real perto de posto
- [ ] validar que transito lento nao dispara falso positivo frequente
- [ ] validar cooldown e bloqueio por abastecimento recente
- [ ] validar deep link abrindo `/fuel/new`

## Dependencias

- dispositivo real
- base `fuel_stations`
- permissao de localizacao e notificacao

## Observacoes

Esse item ja esta alem de ideacao: a base existe e o trabalho agora e hardening do comportamento em uso real.
