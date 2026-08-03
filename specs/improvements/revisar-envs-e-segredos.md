# Revisar Envs E Segredos

## Status

`planejado`

## Objetivo

Revisar e documentar corretamente as variaveis de ambiente do projeto, separando publicas, privadas, opcionais e obrigatorias por feature.

## Contexto

As configuracoes do projeto estao espalhadas entre `README`, `CAPACITOR.md`, integracoes de push e billing. Tambem existem pontos sensiveis de launch readiness ligados a envs e segredos externos.

## Escopo

- [ ] mapear todas as envs usadas no codigo
- [ ] classificar publicas vs privadas
- [ ] classificar obrigatorias vs opcionais
- [ ] documentar onde cada uma precisa existir
- [ ] revisar risco de exposicao indevida

## Fora De Escopo

- rotacionar segredos de producao nesta etapa sem necessidade concreta
- mudar todas as configuracoes externas imediatamente
- auditar toda a infra fora do contexto do app

## Regras De Negocio

- nenhuma chave sensivel deve ir para env publica com `NEXT_PUBLIC_` sem necessidade real
- cada feature deve deixar claro o conjunto minimo de envs necessarias
- docs devem refletir o uso real do codigo, nao apenas intencoes antigas

## Mudancas Tecnicas Esperadas

- revisar codigo que usa `process.env`
- revisar `README.md` e docs de integracao
- revisar push, Stripe, Supabase e Capacitor
- possivel criacao de tabela/documento central de envs

## Checklist De Implementacao

- [ ] mapear envs do projeto por busca no codigo
- [ ] classificar publico/privado e obrigatorio/opcional
- [ ] revisar pontos de maior risco
- [ ] documentar em local central
- [ ] alinhar docs existentes com o resultado

## Checklist De Validacao

- [ ] toda env listada existe no codigo ou em doc justificada
- [ ] nenhuma env sensivel foi documentada de forma insegura
- [ ] producao e desenvolvimento ficam com requisitos claros

## Dependencias

- leitura do codigo
- entendimento das integracoes externas

## Observacoes

Esse item conversa diretamente com launch readiness e com a futura melhora do README.
