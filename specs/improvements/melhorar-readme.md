# Melhorar README Principal

## Status

`planejado`

## Objetivo

Transformar o `README.md` em uma porta de entrada real do projeto, com contexto funcional, setup minimo, arquitetura resumida e links claros para operacao e backlog.

## Contexto

O `README` atual ainda esta parcial e mistura um pouco de template com informacoes pontuais. O projeto ja possui mais modulos, docs operacionais e integracoes do que o arquivo principal hoje comunica.

## Escopo

- [ ] descrever o produto de forma objetiva
- [ ] listar stack principal
- [ ] documentar setup local minimo
- [ ] listar envs principais por grupo de feature
- [ ] apontar para `specs/`, docs de release e docs de mobile
- [ ] resumir scripts mais usados

## Fora De Escopo

- documentar todos os detalhes de todas as features no README
- duplicar integralmente docs longos como `CAPACITOR.md` e `SPECS.md`
- transformar README em manual operacional completo

## Regras De Negocio

- o README deve ser util para onboarding rapido
- detalhes longos devem continuar em docs especificos, com links claros
- o README deve refletir o estado real do projeto, evitando informacoes historicas desatualizadas

## Mudancas Tecnicas Esperadas

- atualizar `README.md`
- revisar links para `specs/`, `CAPACITOR.md`, `SPECS.md`, `RELEASE.md` e checklist de launch
- revisar envs e scripts em `package.json`

## Checklist De Implementacao

- [ ] definir estrutura final do README
- [ ] consolidar descricao do produto e modulos
- [ ] listar envs essenciais por integracao
- [ ] listar scripts mais usados
- [ ] linkar docs complementares certos
- [ ] revisar consistencia do texto com estado atual do projeto

## Checklist De Validacao

- [ ] novo colaborador consegue entender o projeto sem abrir muitos arquivos antes
- [ ] envs e scripts listados existem de verdade
- [ ] links internos apontam para docs corretos

## Dependencias

- estado atual das docs existentes
- scripts e integracoes reais do projeto

## Observacoes

Esse item e pequeno, mas melhora bastante onboarding e manutencao do projeto.
