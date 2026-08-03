# Implementar Calculator

## Status

`planejado`

## Objetivo

Implementar a tela `/fuel/calculator` com valor real para o usuario premium, permitindo comparar combustiveis e consultar metricas uteis de custo e autonomia.

## Contexto

Hoje a rota existe como placeholder e ja aparece como recurso premium. Isso cria um bom gatilho comercial, mas ainda nao entrega funcionalidade real.

## Escopo

- [ ] comparar gasolina vs etanol com base no preco por litro
- [ ] exibir recomendacao simples de melhor custo-beneficio
- [ ] calcular custo estimado por km quando houver dados suficientes
- [ ] calcular autonomia estimada com base em consumo informado
- [ ] manter bloqueio para usuarios `free`

## Fora De Escopo

- graficos historicos
- sincronizacao com dados externos de postos
- recomendacoes avancadas por tipo de motor ou cidade

## Regras De Negocio

- regra padrao de comparacao: etanol vale a pena quando o preco for ate 70% do preco da gasolina
- se o usuario informar consumo especifico por combustivel, a comparacao deve priorizar custo por km em vez de regra fixa de 70%
- a tela deve funcionar mesmo sem historico salvo no app
- usuarios `free` continuam vendo CTA de upgrade em vez da ferramenta completa

## Mudancas Tecnicas Esperadas

- criar ou completar a pagina `src/app/(protected)/fuel/calculator/page.tsx`
- criar componente dedicado em `src/features/fuel/view/`
- criar schema de formulario em `src/features/fuel/model/`
- opcionalmente criar helper de calculo em `src/features/fuel/services/` ou `src/lib/`
- integrar bloqueio com regras de monetizacao existentes

## Checklist De Implementacao

- [ ] mapear estado atual da rota `/fuel/calculator`
- [ ] definir campos do formulario e mensagens de validacao
- [ ] implementar calculos centrais
- [ ] renderizar resultado com recomendacao clara
- [ ] revisar comportamento para plano `free`
- [ ] validar responsividade mobile

## Checklist De Validacao

- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] validar comparacao com exemplos reais de gasolina e etanol
- [ ] validar estados com campos vazios ou valores invalidos
- [ ] validar bloqueio premium

## Dependencias

- regras atuais de monetizacao
- modulo `fuel`

## Observacoes

Se a calculadora crescer, pode valer separar em duas abas internas: `comparar combustivel` e `custo/autonomia`.
