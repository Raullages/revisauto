# Adicionar Testes Criticos

## Status

`planejado`

## Objetivo

Criar uma camada minima de testes automatizados para proteger regras criticas do projeto, reduzindo dependencia exclusiva de validacao manual via `lint`, `build` e smoke test.

## Contexto

Hoje o projeto compila e linta bem, mas fluxos sensiveis continuam dependentes de verificacao manual. Isso aumenta risco em auth, billing, validacoes de formulario e regras premium/free.

## Escopo

- [ ] testar schemas Zod criticos
- [ ] testar regras de limite do plano free/premium
- [ ] testar calculos centrais do modulo de combustivel
- [ ] testar comportamento essencial do webhook Stripe
- [ ] definir stack inicial de testes para o projeto

## Fora De Escopo

- cobertura ampla de UI em todas as telas
- E2E completo de ponta a ponta logo na primeira etapa
- cobertura de 100% do repositorio

## Regras De Negocio

- os primeiros testes devem proteger regras com alto impacto de produto ou cobranca
- testes devem ser pequenos, rapidos e baratos de manter
- preferir utilitarios puros, schemas e regras de negocio antes de mocks pesados de interface

## Mudancas Tecnicas Esperadas

- escolher e configurar framework de testes
- criar estrutura inicial de testes no repositorio
- adicionar scripts de execucao no `package.json`
- cobrir pelo menos auth validation, billing limits e regras de combustivel

## Checklist De Implementacao

- [ ] decidir stack de testes inicial
- [ ] configurar execucao local e CI-friendly
- [ ] mapear funcoes e regras de maior risco
- [ ] escrever primeira leva de testes pequenos e objetivos
- [ ] documentar como rodar testes

## Checklist De Validacao

- [ ] suite roda localmente sem configuracao fraca ou manual demais
- [ ] testes falham quando regras criticas sao quebradas
- [ ] tempo de execucao inicial permanece aceitavel

## Dependencias

- decisao de stack de testes
- identificacao dos modulos de maior risco

## Observacoes

Uma primeira leva pequena, mas confiavel, vale mais que tentar cobrir tudo de uma vez.
