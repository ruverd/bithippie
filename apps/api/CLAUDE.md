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
  container.ts         DI wiring (Prisma repos → feature services)
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
bun run test                # vitest unit tests (src/**) — in-memory, no DB
bun run test:db             # prisma migrate reset + vitest prisma/__tests__ (needs DATABASE_URL)
bun run test:e2e            # Playwright API e2e — REPO=memory, no DB, boots server, hits HTTP
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
HTTP route → controller → application service → domain port ← repository (prisma | memory)
```

- **Domain** — no Elysia/Prisma imports
- **Application** — one service class per use case in `<verb-noun>.service.ts`; throw `NotFoundError` (404) or `ValidationError` (422)
- **Infrastructure** — routes (declarative wiring), controllers (HTTP adapters), Prisma/memory repos, e2e tests

### Service classes

Each use case is a class with a constructor taking its repository and a **single public `execute(...)`** method; any helpers are `private`.

```ts
export class CreateSampleService {
  constructor(private readonly repo: SamplesRepository) {}
  async execute(input: CreateSampleInput): Promise<Sample> { ... }
}
```

Each feature exposes `application/services.ts` with a `<Feature>Services` interface and a `build<Feature>Services(repo)` factory (object keys = camelCase use-case names). `container.ts` builds repos → services; routers receive the `<Feature>Services` object and call `services.<key>.execute(...)`.

New feature checklist:

1. Add `features/<name>/` with domain, application (service classes + `services.ts`), infrastructure
2. Wire `build<Name>Services(new Prisma<Name>Repository(prisma))` in `container.ts`
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
| GET | `/projects`, `/projects/:id`, `/projects/:id/researchers`, `/projects/:id/experiments`, `/projects/:id/samples`, `/projects/:id/measurements` |
| POST | `/projects` → 201 · PATCH `/projects/:id` |
| GET | `/experiments`, `/experiments/:id`, `/experiments/:id/measurements`, `/experiments/:id/samples` |
| POST | `/experiments` → 201 |
| GET | `/samples`, `/samples/:id` · POST `/samples` → 201 |
| GET | `/measurement-definitions` |
| GET | `/measurements` · POST `/measurements` → 201 |
| GET | `/researchers` · POST `/researchers` → 201 |

Each route delegates to a service: `services.<key>.execute(...)`.

## Testing

- **Unit (Vitest):** one file per service in `application/__tests__/<verb-noun>.service.test.ts`, driving the service class with an `InMemory*Repository`. One file per service — do not group multiple services in one file.
- **E2E (Playwright):** one file per endpoint in `infrastructure/__tests__/<verb-noun>.e2e.ts`, hitting the real server over HTTP via the `request` fixture (relative URLs; `baseURL` from `playwright.config.ts`).

Vitest matches only `*.test.ts`; Playwright matches only `*.e2e.ts` — the suites never overlap.

E2E run **DB-less**: `playwright.config.ts` `webServer` boots the API on `E2E_PORT` (default 3100) with **`REPO=memory`**, so `buildContainer` wires in-memory repositories instead of Prisma. The fixture in `src/infrastructure/memory/fixture.ts` mirrors the anchored `seed-*` rows (IDs `seed-exp-1`, `seed-def-lead`, `seed-sample-blood`, …) as pre-shaped read models. No Postgres, no migrate/seed. POST/PATCH payloads use `E2E-` prefixes so they don't collide with the fixture. The memory `samples`/`researchers` repos enforce unique `code`/`email` so the 422 cases pass.

`REPO=memory` is read in `container.ts`; unset = Prisma (production/dev).

Test scripts: `test` (vitest `src/**`) and `test:e2e` (Playwright) are both **DB-less** — service/controller unit tests and e2e all use in-memory repos. Only `test:db` needs Postgres: it runs `prisma migrate reset` + the `prisma/__tests__` schema/seed tests.

Agent safety: `test:db` resets the DB; set `PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION=1` in automated runs.

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
