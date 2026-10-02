# Deployment notes

## Existing MindGPT site

The currently linked Sites project is recorded in `.openai/hosting.json`. Preserve this identity for edits to that site. Its runtime environment already contains `CODECRAFT_API_KEY` as a secret and `CODECRAFT_BASE_URL` as configuration. Source pushes to an independent GitHub repository do not, by themselves, deploy this site.

Build and publish through the Sites workflow. Production migrations must be applied by the hosting workflow. Keep a previous saved version available for rollback; do not reset or delete user databases to update the interface.

## Independent hosting

The output is a Cloudflare Worker plus static browser assets. A compatible deployment needs:

| Resource              | Binding/configuration                               |
| --------------------- | --------------------------------------------------- |
| SQLite database       | D1 binding `DB`, with the migrations in `drizzle/`  |
| Uploaded-file storage | R2 binding `BUCKET`                                 |
| Provider credential   | Server secret `CODECRAFT_API_KEY`                   |
| Provider endpoint     | `CODECRAFT_BASE_URL=https://codecraftapi.com/v1`    |
| Web origin            | HTTPS for cookies, microphone APIs and installation |

For a separate Site, create a new project in your own account and configure its identity and resources. The original project ID is not a portable hosting credential. Provision independent resources before using the generated Worker configuration outside Sites; development placeholder database IDs are not production resources.

## Local development

Follow the README. `pnpm build` produces `dist/server/wrangler.json`; run the initial SQL migration against a fresh local database once, then start the development server. Changes to `db/schema.ts` require a new migration.

## Post-deployment verification

Open the app over HTTPS, confirm the model list loads, send a small test message, reload the conversation and check a file upload. On an Android device, explicitly check microphone permission, manual transcription confirmation, installed voices and PWA installation. The original CodeCraft 403 remains an unresolved provider-connectivity result until a real request succeeds.

## Account sign-in (1.3)

On the supplied Sites URL, browser sign-in and sign-out use dispatch-owned SIWC routes. API ownership derives from the platform-authenticated user ID in a separate account namespace. Guest cookies never grant access to account owners. Files and histories remain owner-scoped; guest records are not automatically merged with signed-in records.

Do not trust forwarded identity headers on an independent public Worker or reverse proxy. `platformUser` enables account identity only on `.chatgpt.site` requests behind Sites dispatch. External hosting needs its own verified authentication integration; do not expose a worker with spoofable identity headers. Local development does not run the platform sign-in dispatcher.
