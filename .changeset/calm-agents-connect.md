---
"autodroid": minor
---

Add the autodroid command line and stdio MCP server, built from one catalog of every user and admin operation. The CLI targets the production deployment unless `AUTODROID_CLI_API_URL`, `AUTODROID_CLI_WEB_URL` or `AUTODROID_CLI_FIREBASE_WEB_API_KEY` say otherwise.

Add the SDK services `user.getMcpAuthorizationGrants`, `user.revokeMcpAuthorizationGrant`, `admin.file.removeAllDangling`, `admin.processing.getTimeEstimation` and `admin.processing.failDangling`.

The minimum Node version is now 20, because the MCP SDK requires it.

BREAKING: `admin.dataset.getMany` now takes `userId` and `fileId` instead of `user_id` and `file_id`, like every other list query.

BREAKING: `WorkerRegistrationTokenFragment` no longer selects `token`, so `admin.worker.getRegistrationTokens` and `admin.worker.deleteRegistrationToken` return no token value; only `admin.worker.getRegistrationToken` and `admin.worker.createRegistrationToken` return it, through the new `WorkerRegistrationTokenWithValueFragment`.

Every list command and MCP list tool returns one page, `{ items, total_count, has_next_page }`, and the CLI prints `Showing X of N.` under the table; dataset and processing results carry `user_id`, the owner's id, since `dataset list` and `processing list` also return other users' PUBLIC records. `skip` and processor parameter `sequence` are bounded to GraphQL's 32-bit `Int`.

Every list query whose `take` is omitted now returns the API's default page of 100 items instead of every item; pass `take` (up to 1000) and `skip`, or `after` with `first` and `before` with `last`, to read further. The command line and the MCP list tools keep their own page of 10, at most 100.

BREAKING: `Dataset.user` and `Processing.user` are now nullable, so `DatasetFragment`'s `user` is `null` on another user's dataset (including the dataset of a processing) unless the caller is an admin; read `user_id` for the owner's id.
