## Objetivo

Adotar `Capacitor` neste projeto para distribuir o app com instalacao simples no celular, gerar `APK` para testes e abrir caminho para uso correto de recursos nativos.

## Status Atual

Implementado ate aqui:

- dependencias base do `Capacitor` adicionadas ao projeto
- arquivo `capacitor.config.ts` criado
- `webDir` fallback criado em `dist/capacitor`
- projeto Android criado na pasta `android/`
- scripts basicos adicionados ao `package.json`

Pendencia atual para gerar `APK` localmente:

- instalar/configurar `Java` no ambiente antes de rodar `Gradle`

## Direcao

Vamos seguir com `Capacitor` como passo intermediario entre o `PWA` atual e uma possivel migracao futura para `React Native`.

Motivos:

- reduz bastante a friccao de instalacao para familiares e testers
- reaproveita o app atual em vez de reescrever tudo agora
- permite evoluir para recursos nativos reais
- mantem a opcao de migrar para outra stack no futuro sem pressa

## Estrategia

O caminho recomendado para este projeto e:

1. criar o app mobile com `Capacitor`
2. usar primeiro a versao publicada do app dentro da WebView
3. validar os fluxos principais do MVP no Android
4. adaptar os pontos web-only para abordagens mobile corretas
5. substituir integracoes web por nativas onde fizer sentido

Observacao importante:

- neste momento, nao vamos tentar empacotar uma versao estaticamente embutida do app dentro do APK
- o projeto atual usa `Next.js` com partes de auth e roteamento que tornam esse caminho menos favoravel agora
- para ganhar velocidade, a primeira entrega deve carregar a URL publicada do sistema

## Configuracao Atual

O projeto suporta 2 modos de app mobile:

- `remote`: a WebView abre a URL publicada definida em `CAPACITOR_SERVER_URL`
- `local`: a WebView abre o bundle embutido em `dist/capacitor`

Importante:

- `remote` nao significa desktop; significa app mobile carregando a versao publicada
- `local` nao depende da URL publicada, mas hoje precisa de um bundle real gerado para `dist/capacitor`

O app mobile usa a variavel abaixo para carregar a versao publicada do sistema:

- `CAPACITOR_SERVER_URL`
- `CAPACITOR_LIVE_RELOAD=true`

Forma recomendada:

- criar um arquivo `.env.capacitor` a partir de `.env.capacitor.example`
- definir nele a URL publicada do app
- manter `NEXT_PUBLIC_APP_URL` apontando para a mesma URL publicada para callbacks de auth

Exemplo:

```bash
cp .env.capacitor.example .env.capacitor
```

```bash
CAPACITOR_SERVER_URL="https://seu-dominio.com"
NEXT_PUBLIC_APP_URL="https://seu-dominio.com"
```

Depois:

```bash
npm run cap:sync:android:remote
```

Fallbacks aceitos na configuracao:

- `CAPACITOR_SERVER_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SITE_URL`

Para auth mobile:

- `NEXT_PUBLIC_APP_URL` e a opcao preferida para `emailRedirectTo` e `redirectTo`
- sem ela, o app cai no fallback de `window.location.origin`

Se a variavel nao estiver definida, o app usa um `fallback` minimo apenas para manter o projeto Android sincronizavel.

## Scripts Disponiveis

- `npm run cap:sync`
- `npm run cap:sync:remote`
- `npm run cap:sync:local`
- `npm run cap:sync:android`
- `npm run cap:sync:android:remote`
- `npm run cap:sync:android:local`
- `npm run cap:sync:ios`
- `npm run cap:sync:ios:remote`
- `npm run cap:sync:ios:local`
- `npm run cap:open:android`
- `npm run cap:run:android`

## Build Remota Do APK

Como a maquina local pode nao ter `Java`, `Android SDK` ou espaco para `Android Studio`, o projeto agora tem um workflow de `GitHub Actions` para gerar o `APK`.

Arquivo:

- `.github/workflows/android-apk.yml`

Como usar:

1. subir as alteracoes para o repositorio
2. abrir a aba `Actions` no GitHub
3. executar o workflow `Build Android APK`
4. manter ou ajustar a URL publicada do app
5. ao final, baixar o artifact `pessoauto-debug-apk`

Saida esperada:

- arquivo `app-debug.apk` pronto para instalar no Android

Observacoes:

- o workflow usa `Java 21`
- a URL padrao da build remota e `https://pessoauto.vercel.app`
- o APK gerado e de `debug`, adequado para testes internos

## Estado Atual Do Projeto

Pontos positivos para `Capacitor`:

- a maior parte das telas e fluxos esta em `client components`
- o app ja consome o `Supabase` diretamente no cliente
- os CRUDs principais estao organizados em services e hooks
- o layout protegido ja usa guarda no client

Pontos de atencao:

- autenticacao ainda depende de fluxo web em alguns cenarios
- push atual usa `service worker`, que nao e o modelo certo para app mobile instalado
- anexos usam `File` do navegador
- existe `middleware` e callback de auth no lado `Next`

## O Que Deve Funcionar Logo No Inicio

Esperado para a primeira fase com `Capacitor`:

- login com email e senha
- logout
- dashboard
- cadastro, edicao e exclusao de veiculos
- cadastro, edicao e exclusao de manutencoes
- cadastro, edicao e exclusao de abastecimentos
- persistencia basica de sessao na WebView
- tema claro/escuro

## O Que Precisa De Adaptacao

### 1. Autenticacao

Hoje existem fluxos que dependem de URL web e callback no navegador.

Impacto:

- cadastro com confirmacao por email pode exigir ajuste
- reset de senha por email precisa ser revisado
- deep link deve entrar no plano cedo

Direcao:

- manter login por email/senha como primeiro fluxo principal
- validar sessao do `Supabase` dentro da WebView do app
- configurar deep link para fluxos de callback e recuperacao de senha
- revisar redirecionamentos hoje baseados em `window.location.origin`

### 2. Navegacao E Roteamento

No curto prazo, a navegacao atual deve continuar funcionando dentro da WebView.

Direcao:

- manter o roteamento do `Next` na primeira entrega
- evitar refatoracoes grandes de navegacao no inicio
- revisar apenas comportamentos que dependam de abrir navegador externo

### 3. Push Notifications

O push atual e web push, baseado em `service worker`.

Direcao correta para mobile:

- desativar ou ignorar a estrategia atual no app mobile
- implementar push nativo com plugin do `Capacitor` em fase posterior
- manter o push web somente para o PWA/navegador

### 4. Anexos E Arquivos

Hoje o upload usa `File` do navegador.

Direcao:

- validar se o fluxo atual quebra ou funciona mal na WebView
- depois migrar para selecao de arquivo nativa
- considerar camera, galeria e documentos como fontes validas

### 5. Links Externos E Fluxos Fora Do App

Precisamos revisar qualquer fluxo que dependa de abrir email, callback, navegador externo ou retorno ao app.

Direcao:

- mapear todos os links externos
- definir quando abrir dentro do app e quando abrir fora
- configurar retorno por deep link quando necessario

## Fases De Implementacao

### Fase 1. Base Do App Mobile

Objetivo:

- criar o shell nativo com `Capacitor`
- gerar um primeiro `APK` Android de teste

Escopo:

- instalar e configurar `Capacitor`
- criar projeto Android
- apontar o app para a URL publicada do sistema
- definir nome, icone, splash e identificador do app
- validar abertura e navegacao geral

Saida esperada:

- `APK` instalavel para testes internos

### Fase 2. Validacao Dos Fluxos Principais

Objetivo:

- garantir que o MVP funcione de ponta a ponta no app Android

Checklist:

- login
- logout
- sessao persistida
- dashboard
- veiculos
- manutencoes
- abastecimentos
- navegacao entre telas

Saida esperada:

- app usavel por testers sem depender de instalar PWA

### Fase 3. Ajustes De Auth Mobile

Objetivo:

- adaptar os fluxos de autenticacao para ambiente mobile corretamente

Escopo:

- revisar signup com confirmacao
- revisar forgot/reset password
- configurar deep link
- alinhar URLs de redirecionamento no `Supabase`

Saida esperada:

- fluxos de auth consistentes dentro do app

### Fase 4. Recursos Nativos Prioritarios

Objetivo:

- sair de dependencias web-only nos pontos importantes

Prioridade sugerida:

1. arquivos e anexos
2. camera ou galeria para comprovantes/fotos
3. compartilhamento nativo
4. push nativo

Saida esperada:

- experiencia mobile mais natural

### Fase 5. Polimento E Distribuicao

Objetivo:

- estabilizar para uso recorrente e ampliar distribuicao

Escopo:

- revisar erros especificos de Android
- revisar permissao de arquivos/camera
- tratar loading e estados offline basicos
- preparar assinatura e distribuicao mais organizada

## Ajustes Minimos Recomendados No Codigo

Esses pontos devem entrar cedo porque reduzem risco:

1. isolar URLs de callback de auth
2. parar de depender diretamente de `window.location.origin` nos fluxos de auth
3. separar claramente o que e web-only e o que pode ser mobile
4. colocar feature flags ou checagem de plataforma para push web
5. revisar upload de anexos para nao assumir `input file` como unico caminho

## Riscos Principais

1. `Supabase Auth` em WebView exigir ajustes de callback
2. reset de senha e confirmacao por email terem comportamento ruim sem deep link
3. push web atual nao atender o app mobile
4. upload de arquivos funcionar de forma inconsistente entre aparelhos
5. dependencia da URL publicada na primeira fase

## O Que Nao Vamos Fazer Agora

- reescrever o app em `React Native`
- trocar toda a navegacao
- refazer a UI inteira para nativo
- empacotar uma versao estaticamente embutida do `Next` dentro do app
- implementar offline completo neste primeiro ciclo

## Ordem Recomendada De Execucao

1. configurar `Capacitor` no projeto
2. criar app Android e abrir a URL publicada
3. gerar primeiro `APK`
4. testar login e CRUD principal
5. corrigir problemas de auth mobile
6. adaptar anexos
7. implementar push nativo
8. polir distribuicao

## Criterio De Sucesso

Consideraremos a iniciativa bem sucedida quando tivermos:

- app Android instalavel por `APK`
- login funcional
- dashboard e CRUD principal funcionando
- fluxo de sessao estavel
- caminho claro para deep link, anexos e push nativo

## Proximo Passo

Proximo passo pratico: iniciar a `Fase 1`, configurando o `Capacitor` no projeto e preparando o primeiro app Android de teste.

## Ponto De Retomada

Estado ao parar:

- build remota do `APK` via GitHub Actions ja validada
- app Android ja instalado e testado em celular
- ajuste de safe area no topo ja aplicado no app web/mobile
- branding Android foi preparado com novo `splash` e novo `icone`
- branch de trabalho correta e `feat/capacitor-android`
- conflitos dessa branch ja foram resolvidos
- workflow nao precisa mudar neste momento

Retomar por aqui:

1. gerar um novo `APK` na branch `feat/capacitor-android`
2. validar no celular o novo `splash` inicial
3. validar no celular o novo `icone` do app
4. seguir com ajustes finos de layout mobile
