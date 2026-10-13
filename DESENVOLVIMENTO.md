# Como desenvolvi o Sorteio de Grupos

Este documento conta, etapa por etapa, como o projeto foi construído: o que eu queria resolver, as decisões que tomei, os problemas que apareceram no caminho e como resolvi cada um. Para instruções rápidas de instalação e uso da API, veja o [README.md](README.md).

---

## 1. O problema

Eu precisava dividir 12 pessoas (Dude, Sofia, Marcio, Pedro, Wilson, Ana, Vinicius, Kauan, Luiz, Caique, Samuel e Ellon) em **4 grupos de 3**, de um jeito que fosse **justo de verdade**: ninguém deveria ter mais chance de cair com alguém do que com outra pessoa.

Os requisitos que defini:

- sorteio realmente aleatório, sem viés;
- poder usar tanto pelo terminal quanto pelo navegador;
- poder trocar a lista de nomes e o tamanho dos grupos sem mexer no código;
- avisar com uma mensagem clara quando a entrada não fizer sentido (nomes repetidos, gente sobrando etc.).

## 2. Escolha das tecnologias

| Tecnologia | Por que escolhi |
|---|---|
| **Node.js** | Tem no módulo `node:crypto` um gerador de números aleatórios criptograficamente seguro. |
| **AdonisJS 6** | Framework com estrutura organizada (rotas, controllers, services, comandos de terminal) pronta para usar. |
| **TypeScript** | Tipagem ajuda a evitar erros, por exemplo garantir que um grupo sempre tem `numero` e `integrantes`. |

Mantive o projeto enxuto de propósito: **sem banco de dados, sem login e sem bibliotecas de front-end**. Nada precisa ser salvo, porque cada sorteio é independente.

## 3. Estrutura do projeto

Parti da estrutura padrão do AdonisJS 6 e mantive só o necessário:

```
sorteio-grupos/
├── app/
│   ├── controllers/sorteios_controller.ts  # Recebe as requisições HTTP
│   ├── exceptions/handler.ts               # Tratamento de erros
│   ├── services/sorteio_service.ts         # Lógica do sorteio
│   └── views/home.ts                       # Página visual (HTML)
├── bin/                                    # Pontos de entrada (servidor e Ace)
├── commands/sortear.ts                     # Comando `node ace sortear`
├── config/                                 # Configurações do app, bodyparser e logger
├── start/
│   ├── env.ts                              # Validação das variáveis de ambiente
│   ├── kernel.ts                           # Middlewares
│   └── routes.ts                           # Rotas
├── iniciar.bat                             # Atalho para subir o servidor no Windows
└── package.json
```

## 4. A lógica do sorteio (o coração do projeto)

Toda a regra ficou em um único lugar: a classe **`SorteioService`** ([app/services/sorteio_service.ts](app/services/sorteio_service.ts)). Ela não sabe nada sobre HTTP nem terminal; só recebe uma lista de nomes e um tamanho e devolve os grupos.

### 4.1 Fonte de aleatoriedade

Não usei o `Math.random()`, porque ele é pseudoaleatório e previsível. Usei o **`crypto.randomInt`**, que:

- usa o gerador criptograficamente seguro do sistema operacional;
- já elimina o *modulo bias*, ou seja, todo número do intervalo tem exatamente a mesma chance.

### 4.2 Embaralhamento Fisher-Yates

Para misturar a lista, implementei o algoritmo **Fisher-Yates** (versão de Durstenfeld):

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

Ele percorre a lista de trás para frente e troca cada posição com outra escolhida ao acaso. Com isso, **cada uma das 12! = 479.001.600 ordens possíveis tem a mesma probabilidade**.

Evitei de propósito o atalho popular `array.sort(() => Math.random() - 0.5)`, que é **enviesado**: algumas ordens saem mais que outras.

### 4.3 Formação dos grupos

Com a lista embaralhada, basta cortá-la em blocos do tamanho escolhido: posições 1–3 viram o Grupo 1, 4–6 o Grupo 2, e assim por diante. Como a ordem é uniformemente aleatória, a composição dos grupos também é.

### 4.4 Validações

Antes de sortear, o service confere se:

- a lista não está vazia e só tem nomes (texto não vazio);
- não há nomes repetidos (sem diferenciar maiúsculas de minúsculas);
- o tamanho do grupo é um número inteiro maior que zero;
- o total de pessoas é divisível pelo tamanho do grupo, para ninguém ficar sobrando.

Se alguma regra falha, o service lança um erro com uma mensagem em português, por exemplo *"10 participantes não podem ser divididos em grupos de 3"*.

## 5. Três formas de usar o mesmo sorteio

Como a lógica ficou isolada no service, consegui oferecer três "portas de entrada" sem repetir código.

### 5.1 Pelo terminal: comando Ace

Criei o comando [commands/sortear.ts](commands/sortear.ts), que imprime os grupos em uma tabela:

```bash
node ace sortear              # grupos de 3
node ace sortear --tamanho=4  # outro tamanho
```

### 5.2 Pela API HTTP

O controller [sorteios_controller.ts](app/controllers/sorteios_controller.ts) expõe duas rotas:

| Método | Rota | O que faz |
|---|---|---|
| GET | `/sorteio` | Sorteia os 12 participantes padrão em grupos de 3 |
| POST | `/sorteio` | Recebe `{ "participantes": [...], "tamanho": n }` no corpo |

Quando a entrada é inválida, a API responde **400** com `{ "erro": "mensagem" }`.

### 5.3 Pela interface visual

Inicialmente o projeto era só uma API: abrindo `http://localhost:3333`, aparecia apenas um JSON. Para facilitar o uso no dia a dia, criei uma página em [app/views/home.ts](app/views/home.ts), servida na rota `/`. Ela tem:

- uma caixa de texto com os participantes (um por linha), já preenchida com os 12 nomes;
- um campo para escolher quantas pessoas vão em cada grupo, com um contador que mostra quantos grupos vão sair;
- o botão **Sortear**, que chama o `POST /sorteio` e mostra os grupos em cartões;
- mensagens de erro em destaque quando a divisão não é possível;
- layout que se adapta ao celular e ao tema claro/escuro do sistema.

Escrevi o HTML dentro de um módulo TypeScript em vez de um arquivo `.html` separado. Assim ele é compilado junto com o resto do projeto e não precisei instalar um template engine nem configurar a cópia de arquivos extras no build. A lista de rotas em JSON que ficava em `/` passou para **`/api`**.

## 6. Build e execução

Para rodar a versão de produção:

```bash
npm run build          # compila o TypeScript para a pasta build/
cd build
npm ci --omit=dev      # instala só as dependências de produção
node bin/server.js     # sobe o servidor
```

O `.env` precisa ser copiado para dentro da pasta `build/`.

Para não ter que digitar isso toda vez, criei o **[iniciar.bat](iniciar.bat)**: com dois cliques ele sobe o servidor numa janela própria e abre `http://localhost:3333` no navegador. Fechar a janela para o servidor.



## 7. O que aprendi

- **Aleatoriedade justa exige cuidado:** a forma "óbvia" de embaralhar (`sort` com `Math.random`) é enviesada. Fisher-Yates com uma fonte criptográfica resolve.
- **Separar a lógica da interface compensa:** como o sorteio ficou num service isolado, adicionar o comando de terminal e depois a página visual não exigiu mudar nada na regra.
- **Validar a entrada evita resultados estranhos:** é melhor avisar que 10 pessoas não cabem em grupos de 3 do que montar um grupo incompleto sem ninguém perceber.
- **Detalhes de ambiente importam:** PATH, pastas travadas e IPv4 versus IPv6 não têm a ver com o código, mas impediam o projeto de funcionar.

## 9. Próximos passos possíveis

- Permitir grupos de tamanhos diferentes quando a divisão não for exata.
- Guardar um histórico de sorteios.
- Adicionar testes automatizados para o `SorteioService`.
- Botão para copiar ou compartilhar o resultado.
