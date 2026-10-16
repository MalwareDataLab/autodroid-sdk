# Mensagens de commit

O projeto usa o [Commitizen](https://github.com/commitizen/cz-cli) para montar a mensagem e o [commitlint](https://commitlint.js.org/) (com `@commitlint/config-conventional`) para validá-la. As versões e o changelog vêm dos changesets (`npx changeset`), não das mensagens de commit.

O hook `prepare-commit-msg` abre o assistente do Commitizen a cada commit.

Não desabilite essas ferramentas sem a aprovação da equipe. Para pular os hooks `pre-commit` (lint) e `commit-msg` (validação da mensagem) em um commit:

```bash
git commit --no-verify
```
