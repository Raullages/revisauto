# Release Smoke Test

Roteiro curto de validacao manual para decidir se o `PessoAuto` esta pronto para um lancamento inicial controlado.

Objetivo:
- executar os fluxos mais sensiveis em pouco tempo
- capturar bloqueadores reais de producao
- evitar abrir o produto ao publico com falhas basicas de auth, dados ou PWA

Duracao estimada:
- 15 a 20 minutos

## 1. Pre-Flight

Antes de testar:

- [ ] Deploy atual publicado no ambiente alvo
- [ ] `Site URL` e `Redirect URLs` revisados no Supabase Auth
- [ ] variaveis de ambiente de producao revisadas
- [ ] decidir se push notifications entram nesta release

Observacao:
- se push ainda nao estiver resolvido com seguranca, nao bloquear o restante do smoke test por isso. Tratar como feature opcional da release.

## 2. Test Accounts

Preparar:

- [ ] Conta A nova ou limpa
- [ ] Conta B secundaria para teste de isolamento

## 3. Auth Smoke Test

### 3.1 Signup

Passos:
1. Abrir `/auth/signup`
2. Criar conta com email real acessivel
3. Confirmar que a UI nao quebra e exibe feedback coerente

Esperado:
- redireciona para login ou feedback claro de sucesso
- email de confirmacao chega

Bloqueia release se:
- signup falha sem motivo claro
- email nao chega

### 3.2 Email Confirmation

Passos:
1. Clicar no link do email
2. Verificar callback
3. Verificar se sessao foi criada

Esperado:
- usuario cai no app sem loop estranho
- acesso a `/dashboard` funciona

Bloqueia release se:
- callback nao cria sessao
- redireciona para URL errada

### 3.3 Logout/Login

Passos:
1. Fazer logout
2. Fazer login novamente
3. Recarregar pagina protegida

Esperado:
- login funciona
- sessao persiste no refresh

Bloqueia release se:
- login falha com credenciais validas
- sessao some no refresh

### 3.4 Forgot Password

Passos:
1. Abrir `/auth/forgot-password`
2. Solicitar redefinicao
3. Abrir email recebido
4. Redefinir senha em `/auth/reset-password`
5. Fazer login com a nova senha

Esperado:
- email chega
- nova senha e salva
- login com nova senha funciona

Bloqueia release se:
- email nao chega
- fluxo nao permite trocar senha
- login com nova senha falha

## 4. Data Ownership Smoke Test

### 4.1 Vehicles

Conta A:
1. Criar 1 veiculo
2. Editar o veiculo
3. Abrir detalhe do veiculo

Conta B:
1. Tentar acessar a URL direta do veiculo da Conta A

Esperado:
- Conta A acessa normalmente
- Conta B nao acessa o registro

Bloqueia release se:
- conta errada consegue visualizar ou editar veiculo alheio

### 4.2 Maintenances

Conta A:
1. Criar manutencao `completed`
2. Criar manutencao `pending`
3. Testar transicao rapida para `scheduled` e `completed`
4. Ver detalhe da manutencao

Conta B:
1. Tentar acessar URL direta de manutencao da Conta A

Esperado:
- regras de status funcionam
- manutencao com transicao recebe data coerente quando necessario
- Conta B nao acessa

Bloqueia release se:
- status gera registro inconsistente
- conta errada acessa manutencao alheia

### 4.3 Attachments

Conta A:
1. Subir PDF ou imagem
2. Abrir anexo
3. Excluir anexo

Esperado:
- upload funciona
- preview/download funciona
- exclusao funciona

Bloqueia release se:
- anexos nao abrem
- storage falha para caso basico

### 4.4 Fuel

Conta A:
1. Criar abastecimento
2. Editar abastecimento
3. Ver detalhe e lista

Conta B:
1. Tentar acessar URL direta do abastecimento da Conta A

Esperado:
- CRUD basico funciona
- Conta B nao acessa

Bloqueia release se:
- CRUD falha no fluxo basico
- acesso cruzado funciona

## 5. Dashboard Smoke Test

Passos:
1. Abrir dashboard apos criar dados reais
2. Verificar cards
3. Verificar alertas
4. Verificar ultimas manutencoes e proximas trocas

Esperado:
- dados coerentes com o que foi criado

Bloqueia release se:
- dashboard mostra informacao claramente incorreta
- alertas basicos nao aparecem

## 6. Mobile/PWA Smoke Test

### 6.1 Mobile Browser

Passos:
1. Abrir no celular
2. Navegar por login, vehicles, maintenances, profile
3. Preencher campos de valor e km

Esperado:
- sem scroll horizontal estranho
- sem zoom indevido em inputs
- mascara de valor e km agradavel para uso real

Bloqueia release se:
- formularios ficam inviaveis em mobile

### 6.2 PWA Install

Passos:
1. Instalar app
2. Abrir em modo standalone
3. Navegar por telas principais

Esperado:
- instalacao funciona
- app abre corretamente apos instalar

Bloqueia release se:
- PWA nao instala ou abre quebrado

## 7. Push Smoke Test

Executar apenas se push for feature de release.

Passos:
1. Confirmar que a funcao de push escolhida e a canonica
2. Confirmar estrategia de seguranca da funcao
3. Assinar notificacoes no perfil
4. Disparar envio de teste
5. Clicar na notificacao

Esperado:
- notificacao chega
- clique abre a manutencao correta

Bloqueia release se:
- push e feature de release e nao funciona
- funcao continua insegura sem aceitacao consciente

## 8. Go / No-Go Rule

### Go

Pode lancar se:
- auth passa
- ownership passa
- CRUD basico de veiculos/manutencoes/anexos/combustivel passa
- dashboard passa no basico
- mobile/PWA passa no minimo aceitavel
- push esta ou validado ou explicitamente fora da release

### No-Go

Nao lancar se houver qualquer um destes:
- falha de signup/login/reset password
- acesso a dado de outro usuario
- anexos quebrados no fluxo principal
- manutencoes inconsistentes por status/data
- PWA/mobile impraticavel no uso real

## 9. Resultado Final

Preencher ao final:

- Data do smoke test:
- Ambiente testado:
- Responsavel:
- Resultado: `GO` / `NO-GO`
- Bloqueadores encontrados:
- Observacoes:
