<p align="center">
  <img width="200px" height="200px" src="./docs/assets/logo.png" alt="Logo da AutoDroid" style="fill:#000000">
</p>

<h3 align="center">AutoDroid SDK</h3>

<div align="center">

![Status](https://img.shields.io/badge/status-active-success.svg)
[![Version](https://img.shields.io/npm/v/autodroid.svg)](https://www.npmjs.org/package/autodroid)
[![Build Status](https://github.com/MalwareDataLab/autodroid-sdk/actions/workflows/release.yml/badge.svg?branch=main)](https://github.com/MalwareDataLab/autodroid-sdk/actions?query=branch%3Amain)

</div>

---

## Sumário

- [Sobre](#sobre)
- [Instalação](#instalação)
- [Biblioteca](#biblioteca)
- [Linha de comando](#linha-de-comando)
- [Servidor MCP](#servidor-mcp)
- [Visão geral do projeto](#visão-geral-do-projeto)
- [Tecnologias utilizadas](#tecnologias-utilizadas)
- [Contribuições](./docs/CONTRIBUTING.md)
- [Changelog](./CHANGELOG.md)
- [Referências](#referências)

## Sobre

Este projeto parte da necessidade de oferecer a ferramenta DroidAugmentor e MalSynGen como um serviço, conforme apresentado em [AutoDroid](https://sol.sbc.org.br/index.php/sbseg_estendido/article/view/27273).

O pacote `autodroid` tem três usos: uma biblioteca TypeScript para integrar aplicações à [API da AutoDroid](https://github.com/MalwareDataLab/AutoDroid), a linha de comando `autodroid` e um servidor MCP por stdio (`autodroid mcp`). Para quem hospeda a API, as configurações necessárias estão no repositório dela.

A API também pode ser usada pela [coleção do Postman](https://www.postman.com/luizfelipelaviola/workspace/autodroid/collection/17242387-d69ee1f8-a603-4ac8-89aa-787cfacffaee?action=share&creator=17242387&active-environment=17242387-9dcb7b8e-4eb1-4a10-b607-74725449575f).

Conheça o projeto [Malware Datalab](https://malwaredatalab.github.io/).

## Instalação

O pacote exige Node.js 20 ou mais recente.

```bash
yarn add autodroid
# ou
npm install autodroid
# ou
pnpm install autodroid
```

A API autentica com o Firebase. Quem usa a instância pública da AutoDroid não precisa configurar nada: a linha de comando faz o login sozinha. Quem hospeda a própria API precisa do seu projeto no Firebase, descrito na configuração da API.

## Biblioteca

```typescript
import { AutoDroidSdk } from "autodroid";

const autoDroid = new AutoDroidSdk({
  baseUrl: "https://mdl-api.unihacker.club/graphql",

  getAuthToken: async () => {
    const token = (await firebaseAuth.currentUser?.getIdToken()) || "";
    return token;
  },

  onAuthError: () => {
    // OPTIONAL: add your logic here for Authentication Error
  },

  onGraphQLError: error => {
    // OPTIONAL: add your logic here for GraphQL Errors
  },

  onNetworkError: error => {
    // OPTIONAL: add your logic here for Network Errors
  },
});

export { autoDroid };
```

Use a instância `autoDroid` para as operações da API:

```typescript
import { autoDroid } from "./api";

const start = async () => {
  const response = await autoDroid.processing.requestDatasetProcessing({
    data: {
      dataset_id: "...",
      processor_id: "...",
      parameters: [
        {
          name: "training_algorithm",
          value: "RandomForest,SupportVectorMachine,DecisionTree",
        },
        {
          name: "number_epochs",
          value: "100",
        },
      ],
    },
  });

  console.log(response.status);
};

start();
```

## Linha de comando

O pacote instala a CLI `autodroid` (use `npx autodroid` para rodar sem instalar). Cada operação da API tem um comando `<recurso> <ação>`:

```bash
npx autodroid login
npx autodroid dataset list --take 5 --skip 10
npx autodroid processing run --dataset-id <id> --processor-id <id> --param k_fold=2
npx autodroid connections list
```

Use `--help` em qualquer comando para ver as opções, e `--json` para a saída em JSON.

### Login

`autodroid login` mostra um endereço e um código de 8 caracteres, e abre `<AUTODROID_CLI_WEB_URL>/cli/authorize` no navegador. Entre na sua conta nessa página e digite o código no campo "Código do terminal". A CLI espera a confirmação por até 5 minutos. O login também aceita `--email`, com a senha em `AUTODROID_CLI_PASSWORD` ou digitada no terminal, o que é melhor que `--password`, que fica no histórico do shell. A sessão fica em `~/.autodroid/session.json`.

Na primeira chamada sem sessão, a CLI abre esse login sozinha, mas só quando a saída é um terminal.

### Listas

As listas paginam com `--take` (quantos itens, padrão 10, máximo 100) e `--skip` (quantos pular, até 2147483647, o `Int` de 32 bits do GraphQL), os mesmos nomes da paginação por deslocamento da API. Cada lista devolve uma página com `items`, `total_count` (quantos itens existem) e `has_next_page`. A CLI mostra a tabela dos itens seguida de `Showing X of N.`, e com `--json` imprime o objeto inteiro.

`dataset list` traz os seus datasets `PRIVATE` e todos os `PUBLIC`, e o `user_id` de cada um identifica o dono. Os seus datasets em revisão não aparecem. `processing list` traz as suas execuções e todas as `PUBLIC`, também com `user_id`.

### Ambientes

Sem configuração, a CLI usa o ambiente de produção. Para apontar para outro ambiente, defina:

| Variável                             | Padrão                                    | Uso                                                     |
| ------------------------------------ | ----------------------------------------- | ------------------------------------------------------- |
| `AUTODROID_CLI_API_URL`              | `https://mdl-api.unihacker.club/graphql`  | Endpoint GraphQL da API (a base REST é derivada dele)   |
| `AUTODROID_CLI_WEB_URL`              | `https://mdl.unihacker.club`              | Aplicação web onde o login pelo navegador é confirmado  |
| `AUTODROID_CLI_FIREBASE_WEB_API_KEY` | `AIzaSyBt-FkToQznrkXvSHYF2fM3G4XajCsgihs` | Chave web pública do Firebase usada para obter a sessão |

### Administração

As operações de administrador (`autodroid admin ...`) só aparecem para uma conta administradora, e a API rejeita essas chamadas para qualquer outra conta. O valor de um token de registro de worker só é mostrado por `admin worker-token create` e `admin worker-token show`. A listagem e a exclusão nunca o exibem.

## Servidor MCP

A AutoDroid oferece as mesmas operações a clientes MCP de dois jeitos:

- stdio: `autodroid mcp`, deste pacote. O cliente MCP inicia o comando e usa a sessão do `autodroid login`.
- HTTP remoto: o endereço `https://<host-da-api>/mcp` (Streamable HTTP), com OAuth 2.1 e os escopos `autodroid:read`, `autodroid:write` e `autodroid:admin`. Não precisa instalar nada. Os detalhes estão no [MCP.md da API](https://github.com/MalwareDataLab/AutoDroid/blob/main/docs/MCP.md).

Os dois modos têm as mesmas 53 ferramentas (26 de usuário e 27 de administrador), listadas em `src/cli/operations/toolContract.json`. O nome de cada ferramenta é `autodroid_<nome>`, como em `dataset publish` e `autodroid_publish_dataset`. Os argumentos mudam: o modo stdio usa os nomes da CLI em camelCase (`datasetId`), e o modo remoto usa os nomes da API (`dataset_id`). As conexões que clientes remotos fazem aparecem em `autodroid connections list`, onde `connections revoke` as encerra, e na página "Aplicativos conectados" do perfil no site.

Rode `npx autodroid login` num terminal antes de configurar o modo stdio: o cliente MCP costuma esconder a saída do comando, e o código do login só aparece nela. Depois, aponte o cliente para o pacote:

```json
{
  "mcpServers": {
    "autodroid": { "command": "npx", "args": ["-y", "autodroid", "mcp"] }
  }
}
```

## Visão geral do projeto

O SDK está inserido no contexto do projeto AutoDroid, que oferece a ferramenta DroidAugmentor/MalSynGen como um serviço.

<img src="./docs/assets/system-context.jpg" alt="Contexto do sistema AutoDroid" style="fill:#000000">

## Tecnologias utilizadas

- [TypeScript](https://www.typescriptlang.org/): linguagem de programação
- [Node.js](https://nodejs.org/): ambiente de execução
- [Apollo Client](https://www.apollographql.com/docs/react/): cliente GraphQL
- [GraphQL Codegen](https://the-guild.dev/graphql/codegen): gerador de código GraphQL
- [yargs](https://yargs.js.org/): linha de comando
- [Model Context Protocol SDK](https://github.com/modelcontextprotocol/typescript-sdk) e [Zod](https://zod.dev/): servidor MCP
- [tsup](https://tsup.egoist.dev/): empacotamento
- [Vitest](https://vitest.dev/): testes
- [Yarn](https://yarnpkg.com/): gerenciador de pacotes

Ferramentas de desenvolvimento:

- [Git](https://git-scm.com/): controle de versão
- [Husky](https://typicode.github.io/husky/#/) e [Lint Staged](https://github.com/okonet/lint-staged): hooks do Git
- [Commitizen](https://github.com/commitizen/cz-cli) e [Commitlint](https://commitlint.js.org/): mensagens de commit
- [Changesets](https://github.com/changesets/changesets): versões e changelog
- [ESLint](https://eslint.org/) e [Prettier](https://prettier.io/): qualidade e formatação do código
- [Semver](https://semver.org/): versionamento semântico

## Referências

LAVIOLA, Luiz Felipe; PAIM, Kayuã Oleques; KREUTZ, Diego; MANSILHA, Rodrigo Brandão. AutoDroid: disponibilizando a ferramenta DroidAugmentor como serviço. In: ESCOLA REGIONAL DE REDES DE COMPUTADORES (ERRC), 20. , 2023, Porto Alegre/RS. Anais [...]. Porto Alegre: Sociedade Brasileira de Computação, 2023 . p. 145-150. DOI: https://doi.org/10.5753/errc.2023.929.
