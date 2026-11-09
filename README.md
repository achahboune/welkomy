# Welkomy

**Digital welcome guides for hotels, Airbnb hosts and vacation rentals.**

Welkomy helps property hosts create a mobile-friendly guest guide, share it with a QR code, and keep essential stay information in one place.

## Product scope

- Multi-property host dashboard
- Public, mobile-first guest guide for each property
- Wi-Fi details, check-in instructions, access information and emergency contacts
- Local recommendations and useful places
- French, English and Arabic content, including right-to-left layout
- QR code generation and downloadable SVG/PNG
- Multi-tenant authentication and role-based access
- Privacy-conscious guide analytics and CSV export
- AI assistant and retrieval features in a later phase, after the core product is stable

## Initial technical direction

- Frontend: React, Vite, TypeScript and Tailwind CSS
- Backend: Cloudflare Workers with Hono
- Database: Cloudflare D1 with versioned SQL migrations
- Object storage: Cloudflare R2 when needed
- Cache / lightweight state: Cloudflare KV when needed
- Maps: OpenStreetMap-compatible services
- Tests and CI: Vitest and GitHub Actions

The first milestone establishes the project structure, environment configuration, database schema, authentication boundaries, translations, tests and CI. Optional services must be checked against current free-tier quotas before use. Never commit secrets.

## Security principles

- Never commit API keys, passwords, tokens or production secrets.
- Enforce tenant isolation and authorization on the server for every private operation.
- Treat guest guide content as public only after the host publishes it.
- Validate all user input on the backend.

## Status

Project initialization in progress. The first release will prioritize a secure, working core over optional AI features.
