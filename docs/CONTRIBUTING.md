# Contribuindo

Antes de começar, leia o [AGENTS.md](../AGENTS.md), com as regras de código, de imports e de testes. Use Node.js 20 (a versão exata está em `.nvmrc`) e Yarn 1.

## Fluxo

1. Faça um fork do repositório e clone o seu fork.
2. Crie um branch a partir do `develop`, um por correção ou funcionalidade. O nome começa com o tipo: `bugfix`, `feature`, `hotfix`, `release` ou `other`.

   ```bash
   git checkout -b bugfix/mudar-algo
   ```

   Se der erro, busque o repositório antes:

   ```bash
   git remote update && git fetch
   ```

3. Mantenha o branch atualizado:

   ```bash
   git pull origin develop
   ```

   Pode ser preciso resolver conflitos.

4. Instale as dependências:

   ```bash
   yarn
   ```

5. Faça o commit. O husky roda o lint-staged antes de cada commit. O commitizen abre um assistente para a mensagem, no padrão Conventional Commits, e o commitlint valida o resultado. As regras estão em [Mensagens de commit](./COMMIT_MESSAGE_GUIDELINES.md).
6. Se a mudança altera o que o pacote entrega, crie um changeset com `npx changeset` e inclua o arquivo gerado em `.changeset/` no commit. Não altere a versão no `package.json`.
7. Abra o pull request para o branch `develop`.

Ao participar, siga o [código de conduta](./CODE_OF_CONDUCT.md).

## Verificação local

| Comando | O que faz |
| --- | --- |
| `yarn lint` | ESLint, `tsc` e a checagem do esquema GraphQL. A checagem lê o repositório da API em `../autodroid-api-gateway`, ou o caminho de `BACKEND_SCHEMA_PATH` |
| `yarn test` | Compila o pacote e roda todas as camadas de teste, com cobertura de 100% |
| `yarn codegen` | Gera o cliente a partir do esquema da API, em `BACKEND_GRAPHQL_ENDPOINT` (padrão `http://localhost:3333/graphql`) |
| `yarn contract` | Gera o contrato das ferramentas MCP, que a API guarda em cópia idêntica |

## Release

O workflow `release.yml` roda em pushes para `main`: ele confere o esquema contra o repositório da API, abre o PR de versão do Changesets e publica o pacote no npm. Para o checkout do repositório da API, o segredo `CROSS_REPO_CHECKOUT_TOKEN` precisa ser um token pessoal com acesso de leitura a ele, porque o `GITHUB_TOKEN` padrão só alcança este repositório.
