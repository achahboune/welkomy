# Welkomy API

Cloudflare Worker API for the MVP. Local commands from repository root:

```cmd
npm install
npm run build
npx wrangler d1 migrations apply welkomy-db --local --config apps/api/wrangler.toml
npx wrangler dev --config apps/api/wrangler.toml
```

Create `apps/api/.dev.vars` locally and set a random `BETTER_AUTH_SECRET` of at least 32 characters. Never commit secrets. Remote migration and deployment require confirmation of the target Cloudflare account.
