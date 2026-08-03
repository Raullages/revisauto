# Implementar Brasil API FIPE

## Status

`planejado`

## Objetivo

Adicionar preenchimento assistido de dados do veiculo com Brasil API, usando fluxo em cascata de marca, modelo e ano na criacao ou edicao de veiculos.

## Contexto

O cadastro manual funciona, mas exige muita digitacao e gera variacao de padrao em marca, modelo e versao. A Brasil API pode reduzir friccao e padronizar os dados sem substituir totalmente o preenchimento manual.

## Escopo

- [ ] carregar marcas de veiculos
- [ ] carregar modelos ao selecionar marca
- [ ] carregar anos ao selecionar modelo
- [ ] preencher automaticamente `brand`, `model`, `year` e, se fizer sentido, `version`
- [ ] permitir fallback para cadastro manual
- [ ] manter o recurso como premium, se essa for a regra final do produto

## Fora De Escopo

- salvar tabela FIPE local no banco
- suporte inicial a motos ou caminhoes, se o escopo imediato for apenas carros
- enriquecimento automatico de combustivel, placa ou dados de documento

## Regras De Negocio

- o usuario deve conseguir alternar entre fluxo assistido e manual sem perder dados relevantes
- falha da API nao pode bloquear o formulario manual
- respostas da API podem ser cacheadas para reduzir latencia e chamadas repetidas
- a UI deve deixar claro quando um campo foi preenchido automaticamente

## Mudancas Tecnicas Esperadas

- criar service `fipe` no modulo de veiculos
- adicionar hooks de consulta em `src/features/vehicles/viewmodel/`
- ajustar `VehicleForm` para suportar selects em cascata
- definir se o recurso sera liberado para todos ou so para premium

## Checklist De Implementacao

- [ ] confirmar endpoints e formato real da Brasil API
- [ ] implementar service com tipagem minima
- [ ] adicionar hooks de query e cache
- [ ] criar UI de selecao em cascata no `VehicleForm`
- [ ] manter fallback manual robusto
- [ ] revisar comportamento mobile

## Checklist De Validacao

- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] validar fluxo completo marca > modelo > ano
- [ ] validar fallback manual com API indisponivel
- [ ] validar gating premium, se aplicavel

## Dependencias

- modulo `vehicles`
- possivel decisao de produto sobre premium/free

## Observacoes

Vale decidir cedo se a feature entra como ajuda opcional no formulario ou como modo principal de cadastro.
