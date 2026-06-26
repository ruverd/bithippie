# CLAUDE.md — Laboratory Experiment Tracking

Project-specific guidance for AI assistants working in this repo.

## What this is

A PostgreSQL data model and REST API for tracking lab researchers, projects, experiments, samples, and measurements. The **database model and README reasoning are the primary deliverables**; the API demonstrates the schema. See `README.md` for assumptions, tradeoffs, and open questions.

Design specs live under `docs/superpowers/specs/` and implementation plans under `docs/superpowers/plans/`.

## Stack

- **Runtime:** Bun (workspaces monorepo)
- **API:** Elysia + `@elysiajs/openapi`, Zod/Elysia `t` for HTTP validation
- **ORM:** Prisma 6 + PostgreSQL 16
- **Tests:** Vitest
- **Shared:** `@lab/shared` — pure measurement validation rules used by API (and future frontend)

## Repository layout

```
apps/api/          Bun API — see apps/api/CLAUDE.md
apps/web/          React SPA — see apps/web/CLAUDE.md
packages/shared/   cross-cutting pure logic
docker-compose.yml Postgres + migrate + api
```

Design specs: `docs/superpowers/specs/`. Implementation plans: `docs/superpowers/plans/`.

## Commands

```bash
docker compose up --build          # Postgres (host :5433) + migrate + seed + API (:3000)
bun install                        # from repo root
cd apps/api && bun run dev         # local API with hot reload
bun run test                       # from root → runs apps/api tests
cd apps/api && bun run db:migrate:dev   # create/apply migrations locally
cd apps/api && bun run db:seed
cd apps/api && bun run db:reset    # destructive — wipes DB
```

**DATABASE_URL**

| Context | URL |
|---------|-----|
| Docker services (`migrate`, `api`) | `postgresql://lab:lab@db:5432/lab?schema=public` (injected by compose) |
| Host → Docker Postgres | `postgresql://lab:lab@localhost:5433/lab?schema=public` (see `apps/api/.env`) |

Host port **5433** avoids conflict with a local Postgres on 5432.

OpenAPI: `http://localhost:3000/openapi`

For API architecture, endpoints, testing, and schema rules → **`apps/api/CLAUDE.md`**.

For frontend stack, routing, shadcn, Kubb, and test commands → **`apps/web/CLAUDE.md`**.

## Architecture (summary)

Clean architecture per feature. Dependency direction:

```
HTTP route → application use case → domain port ← repository (prisma | memory)
```

- **Domain** (`features/*/domain/`): entities, repository interfaces — no framework imports
- **Application** (`features/*/application/`): use cases; throw `NotFoundError` (404) or `ValidationError` (422)
- **Infrastructure** (`features/*/infrastructure/`): Elysia routes, Prisma/memory repos, integration tests
- **Wiring:** `container.ts` builds the DI container; `app.ts` mounts feature routers

Register new features in both `container.ts` and `app.ts`. Details in `apps/api/CLAUDE.md`.

## Validation layers (summary)

1. **HTTP** — Elysia `t` / Zod request shape → 400
2. **Use case** — business rules needing DB lookups → domain errors → 404/422
3. **Persistence** — Prisma transactions (e.g. Measurement + MeasurementSample)
4. **DB** — `measurements_exactly_one_value` CHECK (`num_nonnulls(...) = 1`)

Cross-row rules (type match, categorical allowed values, sample subset, follow-up project) live in **use cases**, not DB constraints. Shared value-type logic: `validateMeasurementValue` in `@lab/shared`.

Hand-edited SQL in migrations is intentional. See `apps/api/CLAUDE.md`.

## Data model (summary)

- PKs: `cuid()`; Postgres columns: `snake_case` via `@map` / `@@map`
- Single `Measurement` table with nullable typed value columns
- No auth; no sample inventory — see README tradeoffs

## Coding conventions

- TypeScript strict mode; `noUncheckedIndexedAccess` enabled
- Prefer minimal, focused diffs; match existing naming and file layout
- Do not add code comments unless strictly necessary
- Use exhaustive `switch` with `never` in default for discriminated unions
- Imports at top of file — no inline imports
- Do not commit secrets (`.env` is local only)
- Only create git commits when explicitly asked

## Testing

API: `cd apps/api && bun run test` or `bun run test` from root. Web: see `apps/web/CLAUDE.md`.

## Extending safely

Before changing the schema, read `README.md` assumptions — many invariants are application-layer by design. When adding endpoints, follow existing route + use case + repo patterns and add both unit and integration tests for write paths.

When running `prisma migrate reset` in automated/agent contexts against a shared dev DB, set `PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION=1`.
