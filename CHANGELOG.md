# autodroid

## 0.5.0

### Minor Changes

- 1c8d4e9: add admin worker update mutation and worker name to worker register, refresh token and access token mutations
- cf3d5b1: Add the autodroid command line and stdio MCP server, built from one catalog of every user and admin operation. The CLI targets the production deployment unless `AUTODROID_CLI_API_URL`, `AUTODROID_CLI_WEB_URL` or `AUTODROID_CLI_FIREBASE_WEB_API_KEY` say otherwise.

  Add the SDK services `user.getMcpAuthorizationGrants`, `user.revokeMcpAuthorizationGrant`, `admin.file.removeAllDangling`, `admin.processing.getTimeEstimation` and `admin.processing.failDangling`.

  The minimum Node version is now 20, because the MCP SDK requires it.

  BREAKING: `admin.dataset.getMany` now takes `userId` and `fileId` instead of `user_id` and `file_id`, like every other list query.

  BREAKING: `WorkerRegistrationTokenFragment` no longer selects `token`, so `admin.worker.getRegistrationTokens` and `admin.worker.deleteRegistrationToken` return no token value; only `admin.worker.getRegistrationToken` and `admin.worker.createRegistrationToken` return it, through the new `WorkerRegistrationTokenWithValueFragment`.

  Every list command and MCP list tool returns one page, `{ items, total_count, has_next_page }`, and the CLI prints `Showing X of N.` under the table; dataset and processing results carry `user_id`, the owner's id, since `dataset list` and `processing list` also return other users' PUBLIC records. `skip` and processor parameter `sequence` are bounded to GraphQL's 32-bit `Int`.

  Every list query whose `take` is omitted now returns the API's default page of 100 items instead of every item; pass `take` (up to 1000) and `skip`, or `after` with `first` and `before` with `last`, to read further. The command line and the MCP list tools keep their own page of 10, at most 100.

  BREAKING: `Dataset.user` and `Processing.user` are now nullable, so `DatasetFragment`'s `user` is `null` on another user's dataset (including the dataset of a processing) unless the caller is an admin; read `user_id` for the owner's id.

## 0.4.1

### Patch Changes

- c3cd6bf: add notifications enabled field for user

## 0.4.0

### Minor Changes

- d9f9883: add seq and user notifications enabled flag

## 0.3.0

### Minor Changes

- eb2338c: add processing estimated finish time field

## 0.2.0

### Minor Changes

- f38a54d: add processing time estimate

## 0.1.4

### Patch Changes

- 96cdfe0: update package json repository reference

## 0.1.3

### Patch Changes

- 4094b70: update docs

## 0.1.2

### Patch Changes

- 196a296: update docs

## 0.1.1

### Patch Changes

- 07b82a3: update docs

## 0.1.0

### Minor Changes

- dc8ed8c: add learning data

## 0.0.6

### Patch Changes

- 7cedcce: add utils

## 0.0.5

### Patch Changes

- e4377fa: add multiple services

## 0.0.4

### Patch Changes

- f1336c4: add types

## 0.0.3

### Patch Changes

- c979906: update fields

## 0.0.2

### Patch Changes

- 4625abb: add mutations
