# Local development

## Requirements
- Node.js 20 or newer
- npm 10 or newer
- Cloudflare account only for API deployment and remote D1

## Install and run the web dashboard
Run `npm install` from the repository root, then `npm run dev`.

The current dashboard is a frontend prototype. Property additions are stored in browser memory only and are not persisted.

## API
Run `npm run dev --workspace @welkomy/api` to start the Worker locally. The API currently exposes `GET /api/health`.

## Database
Create a D1 database, replace the placeholder `database_id` in `apps/api/wrangler.toml`, then apply migrations locally with `npx wrangler d1 migrations apply welkomy-db --local`.

## Not implemented yet
Authentication, session management, tenant-scoped API routes, guide publishing, QR generation and analytics are not implemented. Do not use real guest or property data until these controls are built and reviewed.