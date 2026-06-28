# Laboratory Experiment Tracking System — Data Model

A PostgreSQL data model for tracking lab researchers, projects, experiments,
samples, and measurements. Schema and migrations are managed with Prisma; seed
data demonstrates the modeled scenarios.

## Getting started

This repo has two apps that share one PostgreSQL database:

- **API** — `apps/api` (Bun + Elysia + Prisma), served at `http://localhost:3000`
- **Web** — `apps/web` (React + Vite), served at `http://localhost:5173`

### What you need

- **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** — runs the database for you (and, optionally, the whole API). See "About the container" if Docker is new to you.
- **[Bun](https://bun.sh)** — runs the apps locally. Install with `curl -fsSL https://bun.sh/install | bash`.

### About the container (read this if Docker is new to you)

The app needs a PostgreSQL database. Instead of installing Postgres on your
machine, we run it inside a **container** — a small, isolated, pre-configured box
that already has Postgres set up. You don't install or configure the database
yourself.

- `docker-compose.yml` (repo root) lists the services. The important one is `db` (PostgreSQL).
- `docker compose up -d db` starts the database in the background. `-d` = detached (keeps running, frees your terminal).
- `docker compose down` stops it. Your data survives restarts (it lives in a Docker volume); add `-v` to wipe it.
- The first run downloads the Postgres image (needs internet); after that it's cached.

You only strictly need the **database** container — the API and web run with Bun.

### Option A — quickest look (everything in Docker, API only)

Only needs Docker. From the repo root:

```bash
docker compose up --build
```

This starts PostgreSQL → applies migrations → seeds demo data → starts the API.
It's ready when you see `API listening on http://localhost:3000`. Stop with
Ctrl-C. This runs the API but **not** the web UI — for the full app use Option B.

### Option B — run the full app locally (API + Web)

```bash
docker compose up -d db                 # 1. start just the database container (background)
bun install                             # 2. install dependencies (once)
cp apps/api/.env.example apps/api/.env  # 3. point the API at the database (skip if .env exists)
bun run db:migrate                      # 4. create the tables (once, or after schema changes)
bun run db:seed                         # 5. load demo data (once)
bun run start                           # 6. start API (:3000) + Web (:5173) together
```

Then open the web app at **http://localhost:5173**. Stop the apps with Ctrl-C;
stop the database with `docker compose down`.

### Ports

| What | URL |
|------|-----|
| Web app | http://localhost:5173 |
| API | http://localhost:3000 |
| API docs (Swagger UI) | http://localhost:3000/openapi |
| Storybook | http://localhost:6006 |
| PostgreSQL (from your machine) | `postgresql://lab:lab@localhost:5433/lab` |

### Handy scripts (run from the repo root)

| Command | What it does |
|---------|--------------|
| `bun run start` | Run API + Web together |
| `bun run api` | Run only the API (hot reload) |
| `bun run web` | Run only the web app |
| `bun run web:storybook` | Run Storybook (component explorer) |
| `bun run api:test` | API unit tests — in-memory, no database |
| `bun run api:test:db` | API Postgres schema + seed tests (needs the database) |
| `bun run api:test:e2e` | API end-to-end tests (no database needed) |
| `bun run web:test` | Web unit tests |
| `bun run web:test:e2e` | Web end-to-end tests |
| `bun run db:migrate` | Apply database migrations |
| `bun run db:seed` | Load demo data |
| `bun run db:reset` | Wipe and recreate the database (destructive) |

## API

Base URL: `http://localhost:3000`

OpenAPI (Swagger UI): `http://localhost:3000/openapi`
OpenAPI JSON schema: `http://localhost:3000/openapi/json`

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check — returns `{"status":"ok"}` |
| `GET` | `/projects` | List all projects |
| `POST` | `/projects` | Create a project (201) |
| `GET` | `/projects/:projectId` | Get a single project |
| `PATCH` | `/projects/:projectId` | Update a project |
| `GET` | `/projects/:projectId/researchers` | List researchers on a project |
| `GET` | `/projects/:projectId/experiments` | List experiments in a project |
| `GET` | `/projects/:projectId/samples` | List samples used in a project |
| `GET` | `/projects/:projectId/measurements` | List measurements in a project |
| `GET` | `/experiments` | List all experiments |
| `POST` | `/experiments` | Create an experiment (201) |
| `GET` | `/experiments/:experimentId` | Get a single experiment |
| `GET` | `/experiments/:experimentId/measurements` | List measurements for an experiment |
| `GET` | `/experiments/:experimentId/samples` | List samples for an experiment |
| `POST` | `/experiments/:experimentId/measurements` | Create a measurement (201 on success, 404 unknown experiment, 422 validation failure) |
| `GET` | `/samples` | List all samples |
| `POST` | `/samples` | Register a sample (201) |
| `GET` | `/samples/:sampleId` | Get a single sample |
| `GET` | `/measurements` | List all measurements |
| `GET` | `/measurement-definitions` | List all measurement definitions |
| `GET` | `/researchers` | List all researchers |
| `POST` | `/researchers` | Create / invite a researcher (201) |

### POST /experiments/:experimentId/measurements

Body schema (JSON):

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `measurementDefinitionId` | string | yes | Must match an existing definition |
| `numericValue` | number | no\* | Required when definition valueType is `NUMERIC` |
| `categoricalValue` | string | no\* | Required when definition valueType is `CATEGORICAL` |
| `textValue` | string | no\* | Required when definition valueType is `TEXT` |
| `unit` | string | no | Optional unit label for numeric measurements |
| `sampleIds` | string[] | no | IDs of samples to associate (must belong to the experiment) |

\* Exactly one value field must be provided; the kind must match the definition's `valueType`.

Example write flow using the seeded data:

```bash
curl -X POST http://localhost:3000/experiments/seed-exp-1/measurements \
  -H 'content-type: application/json' \
  -d '{"measurementDefinitionId":"seed-def-lead","numericValue":7.7,"unit":"mg/L","sampleIds":["seed-sample-blood"]}'
```

## Project layout

- `apps/api/prisma/schema.prisma` — the data model
- `apps/api/prisma/migrations/` — versioned SQL migrations (incl. the
  `measurements_exactly_one_value` CHECK constraint)
- `apps/api/prisma/seed.ts` — idempotent seed data

## Running the tests

From the repo root:

```bash
bun run api:test        # API unit tests (in-memory, no database)
bun run api:test:e2e    # API end-to-end tests (in-memory, no database)
bun run api:test:db     # API Postgres schema + seed tests (needs the database)
bun run web:test        # Web unit tests
bun run web:test:e2e    # Web end-to-end tests
```

- **API unit + e2e tests** use in-memory repositories — **no database, no Docker, no running server**. Just `bun install` then run them.
- **API `test:db`** runs the schema-level tests (`prisma/__tests__` — the `measurements_exactly_one_value` CHECK and the seed) against a real Postgres. Start it first (`docker compose up -d db`) and make sure `apps/api/.env` exists (`cp apps/api/.env.example apps/api/.env`). It runs `prisma migrate reset` (destructive).

---

## Assumptions

These are the decisions locked before modeling. Each one is explicit and
defensible; different answers would shift the schema.

1. An experiment belongs to **exactly one** project.
2. Follow-up experiments share the **same project** (enforced in the application
   layer, not by a DB constraint, because it is a cross-row invariant).
3. A measurement belongs to **exactly one** experiment.
4. A measurement references **0 or 1 sample today**. The link is stored via a
   `MeasurementSample` join table so supporting multiple samples in the future
   requires no migration.
5. Researcher roles exist **both globally** (`ResearcherRole`: Principal
   Investigator, Postdoc, Graduate Student, Lab Technician) **and per-project**
   (`ProjectRole`: Lead, Collaborator, Contributor). Both are modeled.
6. Sample storage is a **free-text location** string; `specimenType` is also a
   free string. The brief enumerates "blood, tissue, chemical compound, soil,
   and so on" — an open set, so an enum would require migrations for each new
   type and was rejected.
7. **No authentication or authorization** — out of scope per the brief.
8. **No sample inventory** (quantity, depletion, chain of custody, storage
   temperature, audit history). See the tradeoffs section for rationale.
9. `Project.status` and `Experiment.status` are **nullable with no default**:
   a record may be created or imported before its lifecycle state is known, and
   we model the lifecycle without forcing an initial state or an approval
   workflow. A NOT NULL default (e.g. `PLANNING`) would be incorrect for
   records whose starting state is genuinely unknown.

---

## Key tradeoffs

### Single `Measurement` table vs. separate per-type tables

Measurements take three forms: numeric (a `Decimal` value with an optional
unit), categorical (one of a definition's allowed values), and free text. Two
designs were evaluated:

**Option A — separate tables** (`NumericMeasurement`, `CategoricalMeasurement`,
`TextMeasurement`): Each table holds only the columns relevant to its type.
Strong per-type indexes; easy to add a NOT NULL constraint on the value column.
Cost: every query that lists all measurements for an experiment must UNION three
tables; new types require DDL.

**Option B — single `Measurement` table** with nullable typed columns
(`numeric_value`, `categorical_value`, `text_value`): One table, one query,
trivial to add a fourth type as a new column. Cost: two of the three value
columns are always NULL; type-match validation cannot be a pure DB CHECK (it
requires a join to the definition row).

**Chosen: Option B.** The query-simplicity benefit dominates at this scale. The
storage overhead is negligible. The type-match rule is enforced in the
application use-case layer, which already has the definition loaded. The
tradeoff would reverse if per-type indexing or per-type DB constraints became
necessary.

### Where validation lives — Prisma schema vs. DB constraints

| Rule | Enforced where | Why |
|------|----------------|-----|
| Exactly one value column populated | **DB CHECK**: `num_nonnulls(numeric_value, categorical_value, text_value) = 1` | In-row, no lookup needed. Static — the DB can enforce it without referencing another table. |
| Populated column matches `definition.valueType` | **Application use case** | `value_type` lives on the definition row; a CHECK cannot reference another table's column without denormalizing. |
| `categorical_value` is in `definition.allowedCategories` | **Application use case** | Requires a lookup against the definition's array. |
| Measurement's sample(s) are a subset of the experiment's samples | **Application use case** | Cross-row invariant across two join tables. |
| Follow-up experiment shares the same project | **Application use case** | Cross-row invariant. |

The `num_nonnulls = 1` CHECK is added by hand-editing the Prisma-generated
migration SQL before commit. Prisma supports hand-edited migration files; the
edited SQL is version-controlled under `prisma/migrations/`.

Denormalizing `value_type` onto `measurements` would allow a stronger CHECK,
but it would create a sync hazard: if a definition's type were ever changed, the
denormalized column would silently drift. The CHECK + application-layer split is
the defensible boundary.

### One thing considered and not done: sample inventory

Chain-of-custody tracking (quantity consumed per measurement, remaining stock,
storage temperature requirements, expiration, who handled the sample and when)
was evaluated and explicitly excluded.

**Rationale:** the brief scopes the problem to experiment tracking, not
laboratory inventory management. Inventory is a distinct bounded context with
its own audit, regulatory, and workflow requirements. Adding even a partial
inventory model — a `quantity` column on `ExperimentSample`, a
`storage_conditions` table — would pull in cross-cutting concerns (transactions
that span depletion + measurement creation, audit triggers, regulatory
retention) that are out of proportion to the deliverable. The `Sample` model
retains `storageLocation` as a free-text pointer, which is sufficient for the
experiment-tracking context and can be linked to a future inventory system.

---

## Open questions for the lab

These questions would change the schema if answered differently. They are
surface-level now; the answers should drive the next design iteration.

1. Can a follow-up experiment belong to a **different** project?
2. Can a measurement reference **more than one** sample? (The `MeasurementSample` join table already allows it — it would only require relaxing the application-layer limit.)
3. Should sample usage track **quantity consumed**?
4. Do samples need **chain-of-custody** records?
5. Should storage location be **structured** (building, room, freezer, rack) instead of free text?
6. Do project or experiment statuses need **approval workflows** (e.g. a transition from PLANNING to ACTIVE requires a sign-off)?
7. Should a researcher's project role override or merely coexist with their global lab role when we later add permissions? (We currently model both independently.)
8. Should measurements support **file attachments** (images, instrument output files)?
9. Should categorical options be **reusable** across definitions, i.e. a shared `Category` table rather than per-definition `allowedCategories` arrays?
10. Do measurements need **audit history or versioning** (who changed a value, when, and from what)?
11. Should experiments support **multiple hypotheses**?
12. Should samples have **expiration dates or storage-condition requirements** that trigger alerts?
