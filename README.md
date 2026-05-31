# Kinetic Academy

Kinetic Academy is an AI-native admission prep platform for Bangladeshi students. This repository starts the production codebase with a Next.js app, PostgreSQL/Prisma data layer, mobile OTP authentication, Google OAuth readiness, and a student dashboard shell.

## Quick Start

```bash
pnpm install
cp .env.example .env
docker compose up -d
pnpm prisma:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

## Verification

```bash
pnpm lint
pnpm typecheck
pnpm prisma:validate
pnpm test:run
pnpm build
```

## Architecture

- `src/app` contains App Router routes and route handlers.
- `src/features` contains product-domain UI and business logic.
- `src/lib` contains shared infrastructure such as config, database, auth, SMS, validation, and rate limiting.
- `src/server` is reserved for route-safe server services as larger product modules are added.
- `prisma/schema.prisma` is the source of truth for users, curriculum, attempts, gamification, prompts, AI interactions, and audit logging.
