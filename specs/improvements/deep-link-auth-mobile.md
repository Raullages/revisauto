# Deep Link Para Auth Mobile

## Status

`planejado`

## Objetivo

Garantir que fluxos de autenticacao que dependem de retorno por link funcionem corretamente no app mobile/Capacitor, especialmente confirmacao de cadastro e recuperacao de senha.

## Contexto

O projeto ja tem direcao mobile definida em `CAPACITOR.md`, mas auth mobile ainda e um dos pontos mais sensiveis. Fluxos baseados em email e callback web podem falhar ou ficar confusos dentro da WebView sem deep link bem resolvido.

## Escopo

- [ ] mapear fluxos de auth que dependem de callback por URL
- [ ] definir estrategia de deep link para app mobile
- [ ] alinhar `Supabase Auth` com URLs permitidas corretas
- [ ] revisar callback e reset password no contexto mobile
- [ ] validar retorno ao app em dispositivo real

## Fora De Escopo

- migrar auth para outro provedor
- reescrever toda a navegacao mobile
- substituir imediatamente todos os fluxos web por nativos

## Regras De Negocio

- login por email e senha deve continuar sendo o fluxo principal e mais confiavel
- cadastro com confirmacao e reset de senha nao podem depender de comportamento ambiguo da WebView
- configuracao de URLs no Supabase deve bater com os ambientes reais web e mobile

## Mudancas Tecnicas Esperadas

- revisar `src/features/auth/services/auth.service.ts`
- revisar `src/app/auth/callback/route.ts`
- revisar `capacitor.config.ts` e configuracoes de deep link
- revisar `CAPACITOR.md` e documentacao de auth mobile
- possivel ajuste em redirect URLs do Supabase

## Checklist De Implementacao

- [ ] mapear todos os pontos que usam callback/redirect de auth
- [ ] decidir esquema de deep link para o app
- [ ] alinhar configuracao do Supabase Auth
- [ ] ajustar codigo para URLs corretas por ambiente
- [ ] validar fluxo real em Android

## Checklist De Validacao

- [ ] confirmacao de cadastro retorna corretamente ao app
- [ ] recuperacao de senha abre a experiencia correta
- [ ] sessao final fica sincronizada no app e no servidor
- [ ] nao ha redirect para `localhost` ou origem errada

## Dependencias

- configuracao de Capacitor
- configuracao de Supabase Auth
- dispositivo real para validacao

## Observacoes

Esse item tem impacto direto na confiabilidade do app mobile e deve subir de prioridade se Android continuar sendo canal importante.
