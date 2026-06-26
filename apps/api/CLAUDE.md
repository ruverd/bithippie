# CLAUDE.md — @lab/api

API-specific guidance. Monorepo context: see `/CLAUDE.md`. Domain assumptions and tradeoffs: `/README.md`.

## Purpose

Bun + Elysia REST API backed by Prisma/PostgreSQL. Exposes lab data (projects, experiments, samples, measurements) and enforces business rules the DB cannot express alone. OpenAPI at `/openapi` feeds Kubb codegen for `apps/web`.

## Stack

- Bun, Elysia, `@elysiajs/openapi`
- Prisma 6, PostgreSQL 16
- Vitest
- `@lab/shared` — `validateMeasurementValue`, `measurementValueInputSchema`

## Layout

```
prisma/
  schema.prisma
  migrations/
  seed.ts
src/
  main.ts              entrypoint (PORT default 3000)
  app.ts               Elysia app + route mounting
  container.ts         DI wiring (Prisma repos)
  infrastructure/      prisma client, error handler
  shared/domain/       NotFoundError, ValidationError
  features/<name>/
    domain/
    application/
    infrastructure/    http/, repositories/, __tests__/
```

Features: `projects`, `experiments`, `samples`, `measurement-definitions`, `measurements`.

## Commands

Run from `apps/api/` unless noted.

```bash
bun run dev                 # hot reload
bun run start               # no watch
bun run test                # migrate reset + vitest (needs DATABASE_URL)
bun run db:migrate:dev      # prisma migrate dev
bun run db:migrate          # prisma migrate deploy
bun run db:seed
bun run db:reset            # destructive
bun run generate            # prisma generate
```

Full stack via Docker (from repo root): `docker compose up --build` → API on `:3000`, Postgres on host `:5433`.

**DATABASE_URL** in `.env`:

```
postgresql://lab:lab@localhost:5433/lab?schema=public
```

Docker injects `db:5432` internally; do not change compose URLs to `5433`.

## Architecture

```
HTTP route → application use case → domain port ← repository (prisma | memory)
```

- **Domain** — no Elysia/Prisma imports
- **Application** — use cases; throw `NotFoundError` (404) or `ValidationError` (422)
- **Infrastructure** — routes, Prisma/memory repos, integration tests

New feature checklist:

1. Add `features/<name>/` with domain, application, infrastructure
2. Register repo in `container.ts`
3. Mount router in `app.ts`

## Validation

| Layer | Responsibility |
|-------|----------------|
| HTTP (`t`, `@lab/shared` Zod) | Request shape → 400 |
| Use case | Cross-row / lookup rules → 404/422 |
| Prisma | Transactions (Measurement + MeasurementSample) |
| DB CHECK | Exactly one value column on `measurements` |

Cross-row rules stay in use cases: value type match, allowed categories, sample ⊆ experiment samples, follow-up project. Do not denormalize `value_type` onto measurements.

Hand-edited migration SQL (CHECK, comments) is intentional — edit before commit, do not regenerate away.

## Endpoints

| Method | Path |
|--------|------|
| GET | `/health` |
| GET | `/projects`, `/projects/:id`, `/projects/:id/researchers`, `/projects/:id/experiments` |
| GET | `/experiments/:id`, `/experiments/:id/measurements`, `/experiments/:id/samples` |
| GET | `/samples`, `/samples/:id` |
| GET | `/measurement-definitions` |
| POST | `/experiments/:experimentId/measurements` → 201 |

Only write endpoint today. Route delegates to `createMeasurement` use case.

## Testing

- **Unit:** `application/__tests__/` with `InMemory*Repository`
- **Integration:** `infrastructure/__tests__/` with real Prisma; seed in `beforeAll` via `prisma/seed.ts`

Test script resets DB (`--skip-seed`); integration tests re-seed. Seed IDs for assertions: `seed-exp-1`, `seed-def-lead`, `seed-sample-blood`, etc.

Integration tests call `app.handle(new Request(...))` — no HTTP server needed.

Agent safety: set `PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION=1` before `db:reset` or `test` in automated runs.

## Conventions

- TypeScript strict; extend `/tsconfig.base.json`
- Minimal diffs; match existing feature layout
- No code comments unless strictly necessary
- Exhaustive `switch` with `never` default for unions
- Imports at top of file
- No auth — out of scope
- Only commit when explicitly asked

## Schema changes

Read `/README.md` assumptions first. After editing `schema.prisma`:

1. `bun run db:migrate:dev`
2. Hand-edit generated SQL if adding CHECK/comments
3. Update seed if new scenarios needed
4. Update use cases, repos, routes, tests
