<p align="center">
  <a href="" rel="noopener">
    <img width="200px" height="200px" src="./assets/logo.png" alt="Project logo" style="fill:#000000">
  </a>
</p>

<h3 align="center">AutoDroid SDK</h3>

<div align="center">

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![Version](https://img.shields.io/npm/v/autodroid.svg)](https://www.npmjs.org/package/autodroid)
[![Build Status](https://github.com/MalwareDataLab/autodroid-sdk/actions/workflows/release.yml/badge.svg?branch=main)](https://github.com/MalwareDataLab/autodroid-sdk/actions?query=branch%3Amain)

</div>

---

## 📝 Índice <a name="summary"></a>

- [📖 Sobre](#about)
- [🚩 Antes de começar](#before_start)
- [👨🏻‍💻 Utilização](#usage)
- [✨ Visão Geral do Projeto](#overview)
- [⛏️ Tecnologias Utilizadas](#built_using)
- [🤝🏻 Contribuições](./CONTRIBUTING.md)
- [💾 Changelog](./CHANGELOG.md)
- [📖 Referências](#bibliography)

## 📖 Sobre <a name = "about"></a>

Este projeto parte da necessidade de oferecer a ferramenta DroidAugmentor e MalSynGen como um serviço, conforme apresentado em [AutoDroid](https://sol.sbc.org.br/index.php/sbseg_estendido/article/view/27273).

Esta SDK foi desenvolvida para facilitar a integração e desenvolvimento de aplicações que desejam se conectar com a [AutoDroid API](https://github.com/MalwareDataLab/autodroid-api).

Acesse o repositório da aplicação [AutoDroid API](https://github.com/MalwareDataLab/autodroid-api) para maiores informações sobre o projeto e as configurações necessárias antes de utilizar essa biblioteca.

O projeto também pode ser utilizado através [desta coleção do Postman](https://www.postman.com/luizfelipelaviola/workspace/autodroid/collection/17242387-d69ee1f8-a603-4ac8-89aa-787cfacffaee?action=share&creator=17242387&active-environment=17242387-4c3ade17-18ad-4b79-8e53-2e9b485e699f).

Conheça o projeto [Malware Datalab](https://malwaredatalab.github.io/)!

## 🚩 Antes de começar <a name = "before_start"></a>

O backend da aplicação utiliza o Firebase para autenticação e autorização de usuários. Para utilizar a aplicação, é necessário criar um projeto no Firebase e configurar as credenciais de acesso, conforme em [Firebase](https://firebase.google.com/).

## 👨🏻‍💻 Utilização <a name = "usage"></a>

Instale esta biblioteca utilizando seu gerenciador de pacotes favorito:

```bash
yarn add autodroid
# ou
npm install autodroid
# ou
pnpm install autodroid
```

Configurado o Firebase, você pode utilizar a biblioteca para se conectar com a API do AutoDroid:

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

Utilize a instância `autoDroid` para realizar as operações disponíveis na API, como por exemplo:

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

## ✨ Visão Geral do Projeto <a name="overview"></a>

A API está inserida no contexto do projeto AutoDroid, que é uma aplicação que visa oferecer a ferramenta DroidAugmentor/MalSynGen como um serviço.

<img src="./assets/system-context.jpg" alt="Overview" style="fill:#000000">

## ⛏️ Tecnologias Utilizadas <a name = "built_using"></a>

- [TypeScript](https://www.typescriptlang.org/) - Linguagem de programação
- [Node.js](https://nodejs.org/) - Ambiente de execução
- [Apollo Client](https://www.apollographql.com/docs/react/) - Cliente GraphQL
- [GraphQL Codegen](https://the-guild.dev/graphql/codegen) - Gerador de código GraphQL
- [Yarn](https://yarnpkg.com/) - Gerenciador de pacotes

### Geral

É importante mencionar as demais ferramentas que serão utilizadas nas duas partes do projeto:

- [Git](https://git-scm.com/) - Controle de versão
- [Husky](https://typicode.github.io/husky/#/) - Hooks do Git
- [Lint Staged](https://github.com/okonet/lint-staged) - Ferramenta para verificar arquivos commitados
- [Commitizen](https://github.com/commitizen/cz-cli) - Auxiliar para mensagens de commit do Git
- [Commitlint](https://commitlint.js.org/) - Verificador de mensagens de commit do Git
- [Standard Version](https://github.com/conventional-changelog/standard-version) - Gerador de changelog
- [Eslint](https://eslint.org/) - Framework de verificação de código
- [Prettier](https://prettier.io/) - Formatador de código
- [Semver](https://semver.org/) - Versionamento semântico

## 📖 Referências <a name="bibliography"></a>

LAVIOLA, Luiz Felipe; PAIM, Kayuã Oleques; KREUTZ, Diego; MANSILHA, Rodrigo Brandão. AutoDroid: disponibilizando a ferramenta DroidAugmentor como serviço. In: ESCOLA REGIONAL DE REDES DE COMPUTADORES (ERRC), 20. , 2023, Porto Alegre/RS. Anais [...]. Porto Alegre: Sociedade Brasileira de Computação, 2023 . p. 145-150. DOI: https://doi.org/10.5753/errc.2023.929.
