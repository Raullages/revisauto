# Implementar Relatorios De Combustivel

## Status

`planejado`

## Objetivo

Transformar a rota `/fuel/reports` em um modulo premium util, com visao por periodo sobre gastos, abastecimentos e consumo.

## Contexto

Hoje a tela existe como placeholder. O projeto ja possui `fuel_logs`, calculos basicos e historico suficiente para gerar relatorios simples sem depender de integracoes externas.

## Escopo

- [ ] relatorio semanal
- [ ] relatorio mensal
- [ ] relatorio anual
- [ ] total gasto no periodo
- [ ] litros abastecidos no periodo
- [ ] quantidade de abastecimentos
- [ ] media de preco por litro
- [ ] media km/l quando houver base valida de tanque cheio
- [ ] bloqueio para usuarios `free`

## Fora De Escopo

- exportacao CSV
- dashboards com bibliotecas de grafico complexas, se atrasarem a entrega
- benchmarking entre veiculos de usuarios diferentes

## Regras De Negocio

- filtros por periodo devem considerar timezone coerente com o app
- media km/l so deve usar sequencias validas de tanque cheio
- se nao houver base suficiente para media km/l, a UI deve explicar isso claramente
- usuarios com mais de um veiculo devem conseguir filtrar por veiculo ou ver consolidado

## Mudancas Tecnicas Esperadas

- completar `src/app/(protected)/fuel/reports/page.tsx`
- criar queries agregadas no modulo `src/features/fuel/services/`
- criar componentes de apresentacao em `src/features/fuel/view/`
- integrar com hooks de query em `src/features/fuel/viewmodel/`
- revisar gating premium na interface e no acesso funcional

## Checklist De Implementacao

- [ ] mapear dados disponiveis em `fuel_logs`
- [ ] definir agregacoes minimas por periodo
- [ ] implementar service de relatorio
- [ ] criar UI com filtros claros
- [ ] exibir empty states e mensagens quando faltarem dados
- [ ] revisar premium gating

## Checklist De Validacao

- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] validar periodo semanal, mensal e anual
- [ ] validar consolidado e filtro por veiculo
- [ ] validar media km/l com e sem tanques cheios suficientes

## Dependencias

- modulo `fuel`
- regras de monetizacao premium

## Observacoes

Na primeira versao, tabelas e cards resumidos podem ser melhores que introduzir graficos cedo demais.
