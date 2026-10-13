# Sorteio de Grupos (AdonisJS)

Sistema feito em **AdonisJS 6 + TypeScript** que sorteia 12 pessoas em **4 grupos de 3**, da forma mais aleatória e justa possível. Dá para usar pelo navegador, pela API ou pelo terminal, trocar a lista de nomes e o tamanho dos grupos, e consultar o **histórico de sorteios**, que fica salvo num banco SQLite. O acesso pelo navegador e pela API exige **login**, e qualquer pessoa pode criar a própria conta na tela inicial.

Participantes padrão: Dude, Sofia, Marcio, Pedro, Wilson, Ana, Vinicius, Kauan, Luiz, Caique, Samuel e Ellon.

## Sumário

1. [O problema](#1-o-problema)
2. [Tecnologias](#2-tecnologias)
3. [Como rodar](#3-como-rodar)
4. [Como usar](#4-como-usar)
5. [Estrutura do projeto](#5-estrutura-do-projeto)
6. [Como o sorteio funciona](#6-como-o-sorteio-funciona)
7. [Login e contas](#7-login-e-contas)
8. [Banco de dados e histórico](#8-banco-de-dados-e-histórico)
9. [Como as partes se conectam](#9-como-as-partes-se-conectam)
10. [Configuração (.env)](#10-configuração-env)
11. [O que aprendi](#11-o-que-aprendi)
12. [Próximos passos](#12-próximos-passos)

---

## 1. O problema

Eu precisava dividir 12 pessoas em grupos de 3 de um jeito **justo de verdade**: ninguém pode ter mais chance de cair com uma pessoa do que com outra.

Requisitos que defini:

- sorteio realmente aleatório, sem viés;
- usar tanto pelo navegador quanto pelo terminal;
- poder trocar a lista de nomes e o tamanho dos grupos sem mexer no código;
- mostrar uma mensagem clara quando a entrada não fizer sentido (nomes repetidos, gente sobrando etc.);
- guardar os sorteios feitos para poder consultá-los depois;
- só deixar usar quem tiver uma conta (login com e-mail e senha).

## 2. Tecnologias

| Tecnologia | Por que foi escolhida |
|---|---|
| **Node.js** | O módulo `node:crypto` tem um gerador de números aleatórios criptograficamente seguro e o `scrypt` para guardar senhas, e o `node:sqlite` traz um banco SQLite embutido. |
| **AdonisJS 6** | Framework com estrutura organizada (rotas, controllers, services, comandos de terminal) pronta para usar. |
| **TypeScript** | A tipagem evita erros, por exemplo garante que todo grupo tem `numero` e `integrantes`. |
| **SQLite** (`node:sqlite`) | Banco em um único arquivo, sem servidor e sem instalar nenhuma biblioteca a mais. |
| **React 19** | A página visual é feita em componentes, com o estado (nomes, resultado, erro) controlado pelo React. |
| **Vite** | Compila o React + TypeScript para arquivos estáticos em `public/` e oferece recarga instantânea no desenvolvimento. |

O projeto é enxuto de propósito: **sem ORM, sem pacotes de autenticação e sem bibliotecas de UI**. O banco é acessado com SQL puro, o login usa só recursos do Node e do AdonisJS, e o front-end usa só React.

## 3. Como rodar

Requisito: **Node.js 22.5 ou superior**. O AdonisJS 6 pede pelo menos a 20.6, mas o módulo `node:sqlite` só existe a partir da 22.5.

### Jeito mais fácil (Windows)

Dê dois cliques em **`iniciar.bat`**. Ele sobe o servidor numa janela chamada "Sorteio de Grupos" e abre **http://localhost:3333** no navegador. Para parar, feche essa janela.

> O `iniciar.bat` usa a versão já compilada na pasta `build/`. Se você mudar o código, gere o build de novo (veja abaixo) antes de usá-lo.

### Instalação do zero

```bash
cd sorteio-grupos
npm install
```

O `.env` já vem com uma `APP_KEY` gerada. Se precisar recriar o arquivo, copie o `.env.example` e preencha a `APP_KEY` com qualquer texto aleatório de 32 caracteres ou mais.

O banco não precisa de instalação: o arquivo `tmp/db.sqlite3` e as tabelas são criados sozinhos na primeira execução.

Depois de subir o servidor, abra a página e crie sua conta na aba **Criar conta** (ou use `node ace criar-usuario`, veja a [seção 4.3](#43-pelo-terminal)).

### Modo desenvolvimento

O back-end (AdonisJS) e o front-end (React) rodam separados. Use dois terminais:

```bash
npm run dev       # terminal 1: API em http://localhost:3333, recarrega ao salvar arquivos do servidor
npm run dev:web   # terminal 2: página React em http://localhost:5173, atualiza na hora ao salvar
```

No `dev:web`, o Vite repassa as chamadas `/sorteio`, `/sorteios`, `/auth` e `/api` para o servidor na porta 3333, então os dois precisam estar rodando.

Se você só mexer no back-end, basta o `npm run dev`: ele já entrega em http://localhost:3333 a última versão compilada da página (pasta `public/`). Para atualizar essa versão sem o build completo, rode `npm run build:web`.

### Modo produção (build)

> **Atenção:** o `npm run build` apaga e recria a pasta `build/` inteira, incluindo `build/.env`, `build/node_modules` e o banco `build/tmp/db.sqlite3` (o histórico de quem usa o `iniciar.bat`). Copie o banco antes se quiser mantê-lo.

```bash
npm run build          # compila o React para public/ e o TypeScript para build/
cd build
npm ci --omit=dev      # instala só as dependências de produção
copy ..\.env .env      # o .env precisa estar dentro de build/
node bin/server.js     # sobe o servidor
```

> Rodando a partir de `build/`, o banco é criado em `build/tmp/db.sqlite3`, separado do banco do modo desenvolvimento.

### Scripts do `package.json`

| Script | O que faz |
|---|---|
| `npm run dev` | Servidor AdonisJS de desenvolvimento com recarga automática |
| `npm run dev:web` | Servidor do Vite para a página React, com atualização instantânea |
| `npm run build` | Compila o React (`public/`) e gera a versão de produção em `build/` |
| `npm run build:web` | Compila só o React para `public/` |
| `npm start` | Roda `node bin/server.js` |
| `npm run sortear` | Faz um sorteio no terminal e salva no banco |
| `node ace criar-usuario` | Cadastra um usuário pelo terminal (não é script do `package.json`, mas fica aqui para referência) |
| `npm run typecheck` | Confere os tipos do TypeScript do servidor e do front-end sem gerar arquivos |

## 4. Como usar

### 4.1 Pelo navegador

Acesse **http://localhost:3333**. Se você ainda não entrou, aparece a tela de login com duas abas:

- **Entrar**: e-mail e senha de uma conta existente;
- **Criar conta**: nome, e-mail, senha (mínimo 6 caracteres) e confirmação da senha. Ao criar a conta, você já entra direto.

O login fica guardado por **7 dias** no navegador. Depois de entrar, a página do sorteio mostra seu nome e um botão **Sair** no topo, e tem:

- uma caixa de texto com os participantes, um por linha, já preenchida com os 12 nomes (pode editar à vontade);
- um campo para escolher quantas pessoas vão em cada grupo, com um contador que mostra quantos grupos vão sair;
- o botão **Sortear**, que mostra os grupos em cartões e o horário do sorteio (cada sorteio feito pela página é salvo no banco);
- o **último sorteio salvo**, que já aparece ao abrir a página;
- uma mensagem de erro em vermelho quando a divisão não é possível;
- layout que se adapta ao celular e ao tema claro ou escuro do sistema.

### 4.2 Pela API HTTP

| Método | Rota | O que faz |
|---|---|---|
| Método | Rota | Precisa de login? | O que faz |
|---|---|---|---|
| GET | `/` | Não | Página visual (React compilado em `public/`); ela mesma mostra o login |
| GET | `/api` | Não | Lista as rotas disponíveis em JSON |
| POST | `/auth/cadastro` | Não | Cria uma conta com `{ "nome", "email", "senha" }` e já entra (status **201**) |
| POST | `/auth/login` | Não | Entra com `{ "email", "senha" }` |
| POST | `/auth/logout` | Não | Sai (apaga o cookie de login; status **204**) |
| GET | `/auth/me` | Sim | O usuário logado: `{ "id", "nome", "email" }` |
| GET | `/sorteio` | Sim | Sorteia os 12 participantes padrão em grupos de 3 (**não salva**) |
| POST | `/sorteio` | Sim | Sorteia a lista enviada no corpo, com o tamanho escolhido, e **salva no banco** |
| GET | `/sorteios` | Sim | Histórico de sorteios salvos, do mais recente para o mais antigo |
| GET | `/sorteios/ultimo` | Sim | O sorteio salvo mais recente (status **204**, sem corpo, se ainda não houver nenhum) |
| GET | `/sorteios/:id` | Sim | Um sorteio salvo específico |

O login funciona por **cookie**: o `POST /auth/login` (ou `/auth/cadastro`) devolve um cookie que precisa ser enviado nas próximas requisições. Com o `curl`, use `-c` para guardar o cookie num arquivo e `-b` para enviá-lo:

```bash
# entra e guarda o cookie em cookies.txt
curl -c cookies.txt http://localhost:3333/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"voce@exemplo.com","senha":"sua-senha"}'

# usa o cookie nas rotas protegidas
curl -b cookies.txt http://localhost:3333/sorteio
```

Exemplo de resposta de `GET /sorteio`:

```json
{
  "sorteadoEm": "2026-10-06T14:00:00.000Z",
  "totalParticipantes": 12,
  "tamanhoGrupo": 3,
  "grupos": [
    { "numero": 1, "integrantes": ["Vinicius", "Ana", "Dude"] },
    { "numero": 2, "integrantes": ["Wilson", "Marcio", "Sofia"] },
    { "numero": 3, "integrantes": ["Caique", "Luiz", "Kauan"] },
    { "numero": 4, "integrantes": ["Pedro", "Ellon", "Samuel"] }
  ]
}
```

| Campo | Significado |
|---|---|
| `id` | Número do sorteio no banco (só aparece em sorteios salvos) |
| `sorteadoEm` | Data e hora do sorteio (UTC) |
| `totalParticipantes` | Quantas pessoas entraram no sorteio |
| `tamanhoGrupo` | Quantas pessoas por grupo |
| `grupos` | Lista de grupos, cada um com `numero` e `integrantes` |

Exemplo de `POST /sorteio` (os dois campos do corpo são opcionais; o que faltar usa o padrão):

```bash
curl -X POST http://localhost:3333/sorteio -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"participantes":["A","B","C","D"],"tamanho":2}'
```

A resposta vem com status **201** e o mesmo formato acima, mais o campo `id` do sorteio salvo:

```json
{
  "id": 7,
  "sorteadoEm": "2026-10-06T14:05:00.000Z",
  "totalParticipantes": 4,
  "tamanhoGrupo": 2,
  "grupos": [
    { "numero": 1, "integrantes": ["C", "A"] },
    { "numero": 2, "integrantes": ["D", "B"] }
  ]
}
```

Possíveis erros:

| Status | Quando | Exemplo |
|---|---|---|
| **400** | Entrada inválida no `POST /sorteio` | `{ "erro": "10 participantes não podem ser divididos em grupos de 3" }` |
| **400** | Dados inválidos no `POST /auth/cadastro` | `{ "erro": "Já existe um usuário com esse e-mail" }` |
| **401** | E-mail ou senha errados no `POST /auth/login` | `{ "erro": "E-mail ou senha incorretos" }` |
| **401** | Rota protegida sem login | `{ "erro": "Faça login para continuar" }` |
| **404** | `GET /sorteios/:id` com um id que não existe | `{ "erro": "Sorteio não encontrado" }` |

### 4.3 Pelo terminal

```bash
node ace sortear              # grupos de 3
node ace sortear --tamanho=4  # outro tamanho de grupo
```

O comando sorteia os participantes padrão, **salva o resultado no banco** e mostra:

```
┌─────────┬──────────────────────────┐
│ Grupo   │ Integrantes              │
├─────────┼──────────────────────────┤
│ Grupo 1 │ Vinicius, Ana, Dude      │
│ Grupo 2 │ Wilson, Marcio, Sofia    │
│ Grupo 3 │ Caique, Luiz, Kauan      │
│ Grupo 4 │ Pedro, Ellon, Samuel     │
└─────────┴──────────────────────────┘
[ success ] Sorteio #8 realizado em 2026-10-06T14:10:00.000Z e salvo no banco
```

O `node ace sortear` não pede login, porque roda direto na máquina do servidor.

Para cadastrar um usuário pelo terminal (útil para criar a primeira conta, por exemplo):

```bash
node ace criar-usuario voce@exemplo.com "Seu Nome"
```

O comando pede a senha sem mostrá-la na tela e aplica as mesmas regras da aba **Criar conta**.

## 5. Estrutura do projeto

```
sorteio-grupos/
├── app/
│   ├── controllers/
│   │   ├── sorteios_controller.ts          # Recebe as requisições de sorteio
│   │   └── auth_controller.ts              # Login, cadastro, logout e usuário logado
│   ├── exceptions/handler.ts               # Tratamento de erros
│   ├── middleware/auth_middleware.ts       # Bloqueia as rotas protegidas para quem não fez login
│   ├── services/
│   │   ├── sorteio_service.ts              # Lógica do sorteio
│   │   ├── database.ts                     # Conexão com o SQLite e criação das tabelas
│   │   ├── sorteio_repository.ts           # Grava e lê sorteios no banco
│   │   └── usuario_repository.ts           # Cria usuários e confere senhas
│   └── shared/
│       ├── sorteio.ts                      # Lista padrão e tipos, usados pelo servidor e pelo React
│       └── usuario.ts                      # Tipo do usuário logado (sem a senha)
├── frontend/                               # Página visual em React
│   ├── index.html                          # HTML base onde o React é montado
│   ├── vite.config.ts                      # Configuração do Vite (saída em public/, proxy da API)
│   ├── tsconfig.json                       # TypeScript do front-end (JSX, DOM)
│   └── src/
│       ├── main.tsx                        # Ponto de entrada do React
│       ├── App.tsx                         # Decide entre login e sorteio; estado e chamada à API
│       ├── api.ts                          # Funções que chamam a API (fetch)
│       ├── styles.css                      # Estilos (tema claro/escuro, layout responsivo)
│       └── components/
│           ├── Login.tsx                   # Tela de login com as abas "Entrar" e "Criar conta"
│           ├── Formulario.tsx              # Caixa de nomes, tamanho, botão e contador
│           └── Resultado.tsx               # Erro, informações do sorteio e cartões dos grupos
├── public/                                 # React compilado (gerado pelo Vite)
├── bin/
│   ├── server.ts                           # Ponto de entrada do servidor HTTP
│   └── console.ts                          # Ponto de entrada dos comandos Ace
├── commands/
│   ├── sortear.ts                          # Comando `node ace sortear`
│   └── criar_usuario.ts                    # Comando `node ace criar-usuario`
├── config/                                 # Configurações do app, bodyparser, logger e arquivos estáticos
├── start/
│   ├── env.ts                              # Validação das variáveis de ambiente
│   ├── kernel.ts                           # Middlewares (arquivos estáticos, corpo JSON, login)
│   └── routes.ts                           # Rotas
├── tmp/db.sqlite3                          # Banco de dados (criado automaticamente)
├── build/                                  # Versão compilada (gerada pelo npm run build)
├── .env / .env.example                     # Variáveis de ambiente
├── adonisrc.ts                             # Configuração do AdonisJS
├── iniciar.bat                             # Atalho para subir o servidor no Windows
└── package.json
```

O que cada parte faz:

- **`shared/sorteio.ts`**: a lista padrão de participantes, o tamanho padrão e os tipos (`Grupo`, `ResultadoSorteio`, `SorteioSalvo`). Fica num arquivo próprio, sem nada do Node, para que o servidor e o React usem exatamente as mesmas definições.
- **`sorteio_service.ts`**: toda a regra do sorteio (validar, embaralhar e dividir). Não sabe nada de HTTP, terminal ou banco.
- **`database.ts`**: abre o arquivo `tmp/db.sqlite3` e cria as tabelas se ainda não existirem.
- **`sorteio_repository.ts`**: salva um sorteio, lista o histórico, busca o último e busca por id. É o único lugar com SQL.
- **`usuario_repository.ts`**: cria usuários (validando nome, e-mail e senha), guarda a senha em hash e confere as credenciais no login.
- **`sorteios_controller.ts`**: recebe as requisições, chama o service e o repository e devolve o resultado. Se o service lançar erro, responde 400.
- **`auth_controller.ts`**: faz o login, o cadastro e o logout, gravando ou apagando o cookie de login.
- **`auth_middleware.ts`**: lê o cookie de login e, se ele não apontar para um usuário existente, responde 401 antes de a requisição chegar ao controller.
- **`sortear.ts`**: comando de terminal que usa o mesmo service, salva pelo repository e mostra o resultado em tabela.
- **`criar_usuario.ts`**: comando de terminal que cadastra um usuário pelo mesmo repository da página.
- **`frontend/`**: a página visual em React. O `App.tsx` verifica ao abrir se há alguém logado e mostra o `Login.tsx` ou a tela do sorteio. A tela do sorteio guarda o estado (nomes digitados, tamanho, resultado, erro), busca o último sorteio ao abrir e chama a API ao clicar em **Sortear**. O `Formulario.tsx` e o `Resultado.tsx` só desenham o que recebem.
- **`public/`**: o React compilado pelo Vite (HTML, JS e CSS). É gerado automaticamente; não edite à mão.
- **`routes.ts`**: liga cada endereço da API (`/api`, `/auth`, `/sorteio`, `/sorteios`) ao código que responde e aplica o middleware de login nas rotas protegidas.
- **`kernel.ts`**: registra o middleware que entrega os arquivos de `public/` (é ele que responde o `GET /`), o que lê o corpo JSON das requisições `POST` e o middleware de login (`auth`).
- **`env.ts`**: confere se o `.env` tem todas as variáveis necessárias com valores válidos antes de o servidor subir.
- **`package.json`**: além das dependências e scripts, define atalhos de importação como `#services/*` e `#middleware/*`, para não precisar escrever caminhos relativos longos.

## 6. Como o sorteio funciona

### 6.1 Fonte de aleatoriedade: `crypto.randomInt`

O `Math.random()` comum é pseudoaleatório e previsível. O projeto usa o **`randomInt` do módulo `node:crypto`**, que:

- vem do gerador **criptograficamente seguro** do sistema operacional, alimentado por entropia do hardware e do SO;
- já elimina o *modulo bias*: todo número do intervalo tem exatamente a mesma chance.

### 6.2 Embaralhamento Fisher-Yates

Para misturar a lista é usado o algoritmo **Fisher-Yates** (versão de Durstenfeld):

```ts
embaralhar<T>(itens: readonly T[]): T[] {
  const copia = [...itens]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = randomInt(0, i + 1)
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}
```

Passo a passo:

1. Faz uma cópia da lista, para não alterar a original.
2. Começa pela última posição (`i`).
3. Sorteia uma posição `j` entre `0` e `i`.
4. Troca os elementos das posições `i` e `j`.
5. Anda uma posição para trás e repete até chegar ao início.

Resultado: **cada uma das 12! = 479.001.600 ordens possíveis tem a mesma probabilidade**.

O atalho popular `array.sort(() => Math.random() - 0.5)` foi evitado de propósito, porque é **enviesado**: algumas ordens saem mais que outras.

### 6.3 Formação dos grupos

Com a lista embaralhada, ela é cortada em blocos do tamanho escolhido: posições 1–3 viram o Grupo 1, 4–6 o Grupo 2, e assim por diante. Como a ordem é uniformemente aleatória, a composição dos grupos também é.

### 6.4 Validações

Antes de sortear, o service confere se:

| Regra | Mensagem de erro |
|---|---|
| A lista não está vazia | "Informe uma lista de participantes não vazia" |
| Todos os itens são nomes (texto não vazio) | "Todos os participantes devem ser nomes (texto não vazio)" |
| Não há nomes repetidos (sem diferenciar maiúsculas e minúsculas) | "Há participantes repetidos na lista" |
| O tamanho é um inteiro maior que zero | "O tamanho do grupo deve ser um inteiro maior que zero" |
| O total é divisível pelo tamanho, sem ninguém sobrando | "X participantes não podem ser divididos em grupos de Y" |

Espaços antes e depois dos nomes são removidos automaticamente.

## 7. Login e contas

O login foi feito sem pacotes extras, só com o `node:crypto` e os cookies criptografados do próprio AdonisJS.

### 7.1 Senhas

A senha **nunca é salva como texto**. No cadastro, o `UsuarioRepository` gera um *sal* aleatório de 16 bytes e calcula o hash com **`scrypt`**, um algoritmo feito para ser lento e caro de quebrar por força bruta. No banco fica só `sal:hash`.

No login, o hash é recalculado com o mesmo sal e comparado com `timingSafeEqual`, que leva sempre o mesmo tempo e não dá pistas de quantos caracteres batem.

### 7.2 Sessão (cookie)

Quando o login dá certo, o servidor grava um cookie chamado `usuario` com o id do usuário, **criptografado com a `APP_KEY`**. Por isso:

- ninguém consegue trocar o id dentro do cookie para entrar como outra pessoa;
- o cookie é `httpOnly` (o JavaScript da página não consegue lê-lo) e vale por **7 dias**;
- o **Sair** apenas apaga o cookie.

> Se a `APP_KEY` mudar, todos os cookies antigos deixam de valer e todo mundo precisa entrar de novo.

### 7.3 Regras de cadastro

| Regra | Mensagem de erro |
|---|---|
| Nome e e-mail preenchidos | "Informe nome e e-mail" |
| Senha com pelo menos 6 caracteres | "A senha precisa ter pelo menos 6 caracteres" |
| E-mail ainda não cadastrado (sem diferenciar maiúsculas e minúsculas) | "Já existe um usuário com esse e-mail" |
| Senha e confirmação iguais (conferido só na página) | "As senhas não conferem" |

O e-mail é salvo em letras minúsculas, então `Ana@Exemplo.com` e `ana@exemplo.com` são a mesma conta.

### 7.4 O que é protegido

O middleware `auth` protege `/auth/me`, `/sorteio` e `/sorteios/*`. Ficam livres a página em si (que mostra o login), `/api`, `/auth/login`, `/auth/cadastro` e `/auth/logout`. O comando `node ace sortear` também não pede login.

Qualquer pessoa que acessar a página pode criar uma conta. Todas as contas veem o mesmo histórico de sorteios.

## 8. Banco de dados e histórico

O banco é um **SQLite** acessado pelo módulo nativo `node:sqlite`, sem ORM. O arquivo `tmp/db.sqlite3` e as tabelas são criados automaticamente na primeira execução (`CREATE TABLE IF NOT EXISTS`), o que faz o papel das migrations.

| Tabela | Colunas |
|---|---|
| `sorteios` | `id`, `tamanho_grupo`, `total_participantes`, `sorteado_em` |
| `grupos` | `id`, `sorteio_id` (ligado a `sorteios`), `numero`, `integrantes` |
| `usuarios` | `id`, `nome`, `email` (único), `senha_hash`, `criado_em` |

Detalhes:

- Os integrantes de cada grupo ficam numa coluna de texto, guardados como **JSON** (ex.: `["Ana","Dude","Luiz"]`).
- O sorteio e seus grupos são gravados numa **transação**: ou tudo é salvo, ou nada é.
- As consultas usam parâmetros `?`, então o driver escapa os valores e evita **SQL injection**.
- O repository converte as colunas do banco (`snake_case`, JSON em texto) para o mesmo formato que a API devolve.

O que salva e o que não salva:

| Origem | Salva no banco? |
|---|---|
| Botão **Sortear** da página | Sim |
| `POST /sorteio` | Sim |
| `node ace sortear` | Sim |
| `GET /sorteio` | Não (sorteio rápido, só para ver) |

Para apagar o histórico, basta parar o servidor e excluir o arquivo `tmp/db.sqlite3`. **Atenção:** isso apaga também todas as contas de usuário.

A pasta `tmp/` está no `.gitignore`, então o banco (com os usuários e os hashes das senhas) nunca vai para o GitHub.

## 9. Como as partes se conectam

Toda a regra do sorteio fica no `SorteioService`, e toda a parte de banco no `SorteioRepository`. As três formas de uso são só "portas de entrada" diferentes para eles:

```
 Navegador (React em /) ─fetch POST /sorteio──┐
                                              ├─► auth ─► SorteiosController ──┐
 API (GET/POST /sorteio, /sorteios) ──────────┘                                ├──► SorteioService
                                                                        │    (valida, embaralha,
 Terminal (node ace sortear) ──────────────────────────────────────────────────┤     divide em grupos)
                                                                               │
                                                                               └──► SorteioRepository
                                                                                    (salva e lê no SQLite)
```

O `auth` é o middleware de login: ele fica no caminho da página e da API, mas não do terminal.

Por isso a página, a API e o terminal produzem exatamente o mesmo tipo de sorteio, e foi possível adicionar a página visual, o banco e o login depois sem mudar a regra do sorteio.

Ao abrir a página:

1. O middleware de arquivos estáticos entrega o `public/index.html`, que carrega o JavaScript do React.
2. O `App.tsx` chama `GET /auth/me`. Se a resposta for 401, mostra a tela de login.
3. Depois do login (ou se já havia um cookie válido), mostra a tela do sorteio, que chama `GET /sorteios/ultimo` e, se houver um sorteio salvo, mostra os grupos dele.

Caminho de um login:

1. O `Login.tsx` envia `POST /auth/login` com `{ email, senha }` (ou `POST /auth/cadastro` com `{ nome, email, senha }`).
2. O `AuthController` pede ao `UsuarioRepository` para conferir a senha (ou criar a conta).
3. Se deu certo, o controller grava o cookie criptografado e devolve o usuário.
4. O `App.tsx` guarda o usuário no estado e troca para a tela do sorteio.

Caminho de um clique em **Sortear**:

1. O `App.tsx` pega os nomes da caixa de texto (um por linha) e o tamanho escolhido, que já estão no estado do React.
2. A função `sortear` do `api.ts` envia um `POST /sorteio` com `{ participantes, tamanho }` em JSON. O navegador manda o cookie de login junto.
3. O middleware do `kernel.ts` lê o corpo da requisição, e o middleware `auth` confere o cookie.
4. A rota leva ao `SorteiosController.store`, que chama o `SorteioService.sortear`.
5. O service valida, embaralha e divide. Se der erro, o controller responde 400.
6. O controller manda o resultado para o `SorteioRepository.salvar`, que grava no banco e devolve o sorteio com seu `id`.
7. O React guarda o resultado (ou o erro) no estado, e o `Resultado.tsx` redesenha os cartões dos grupos.

## 10. Configuração (.env)

| Variável | Valor usado | Para que serve |
|---|---|---|
| `TZ` | `UTC` | Fuso horário do servidor |
| `PORT` | `3333` | Porta em que o servidor escuta |
| `HOST` | `::` | Endereço em que o servidor escuta |
| `LOG_LEVEL` | `info` | Quanto detalhe aparece nos logs |
| `APP_KEY` | texto aleatório | Chave interna do AdonisJS (32+ caracteres). Também criptografa o cookie de login, então deve ficar em segredo |
| `NODE_ENV` | `development` | Ambiente: `development`, `production` ou `test` |

## 11. O que aprendi

- **Aleatoriedade justa exige cuidado:** a forma "óbvia" de embaralhar (`sort` com `Math.random`) é enviesada. Fisher-Yates com uma fonte criptográfica resolve.
- **Separar a lógica da interface compensa:** como o sorteio ficou isolado num service, adicionar o comando de terminal, a página visual e o banco não exigiu mudar a regra.
- **Validar a entrada evita resultados estranhos:** é melhor avisar que 10 pessoas não cabem em grupos de 3 do que montar um grupo incompleto sem ninguém perceber.
- **Compartilhar tipos entre servidor e front-end evita divergência:** com o `app/shared/sorteio.ts`, se o formato do resultado mudar, o TypeScript acusa o erro nos dois lados.
- **Nem sempre é preciso um ORM:** para poucas tabelas simples, SQL puro com parâmetros e uma transação é suficiente e fácil de entender.
- **Senha nunca vai em texto para o banco:** com `scrypt` e um sal aleatório por usuário, nem quem tiver o arquivo do banco descobre as senhas.
- **Middleware deixa a proteção num lugar só:** em vez de checar o login em cada método do controller, um middleware aplicado ao grupo de rotas resolve tudo.

## 12. Próximos passos

- Permitir grupos de tamanhos diferentes quando a divisão não for exata.
- Mostrar o histórico de sorteios na página visual (hoje ela mostra só o último).
- Guardar também a lista de participantes usada em cada sorteio.
- Adicionar testes automatizados para o `SorteioService`, o `SorteioRepository` e o login.
- Guardar quem fez cada sorteio e mostrar o histórico de cada usuário.
- Opção de recuperar ou trocar a senha.
- Limitar tentativas de login seguidas, para dificultar ataques de força bruta.
- Botão para copiar ou compartilhar o resultado.
