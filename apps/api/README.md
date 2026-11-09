# Welkomy API

Cloudflare Worker API for authentication and private property management.

## Stack

- Hono for HTTP routing
- Better Auth for email/password authentication and cookie sessions
- Cloudflare D1 for authentication records and property data

## Required configuration

1. Create a D1 database named `welkomy-db` in Cloudflare.
2. Replace the placeholder `database_id` in `wrangler.toml`.
3. Set a random Better Auth secret of at least 32 characters:

```cmd
npx wrangler secret put BETTER_AUTH_SECRET
```

4. Set `BETTER_AUTH_URL` to the API's public origin and `APP_ORIGIN` to the exact frontend origin. Do not leave localhost in production.
5. Generate and apply the Better Auth core schema for the D1/Kysely adapter before enabling sign-up. Follow the current Better Auth CLI instructions: https://better-auth.com/docs/concepts/cli
6. Apply the versioned property migration:

```cmd
npx wrangler d1 migrations apply welkomy-db --local
```

Use `--remote` only after confirming the target Cloudflare account and database.

## API routes

- `GET /api/health` — public health check
- `/api/auth/*` — Better Auth email/password endpoints
- `GET /api/properties` — list the signed-in user's properties
- `POST /api/properties` — create a draft property
- `PUT /api/properties/:id` — update an owned property
- `DELETE /api/properties/:id` — delete an owned property

Every property query includes the authenticated user's ID. A client-supplied owner ID is never accepted.

## Important

This API is not deployed or connected to the current React dashboard yet. The dashboard still uses browser local storage until the frontend auth flow and API data adapter are implemented and tested. Do not treat the current app as a live multi-user SaaS.
