# Laboratory Experiment Tracking System — Design

- **Date:** 2026-06-25
- **Status:** Approved (brainstorming) → ready for implementation plan
- **Author:** ruver

---

## 1. Context & what is actually being graded

A research lab wants to replace spreadsheets + an aging tool. The engagement is to
**design the data model** underneath the new system.

The assignment deliverable is narrow and explicit:

1. **Data model as Postgres migrations** (any migration tooling).
2. Runs via **Docker**: clone → **single documented command** → running Postgres with schema + seed.
3. **Seed data** that exercises the interesting parts of the model.
4. **README** with: start command, assumptions, key tradeoffs (incl. **one thing considered and not done**), open questions.

Evaluation criteria (verbatim from the brief, paraphrased):
- *"We care more about your reasoning than about hitting a specific right answer."*
- *"A decisive model built on explicit assumptions"* beats a hedging one.
- *"Walk us through your submission and **extend it live**... own every decision in it."*

**Implication for this design:** the database model + the README's reasoning are the
scored artifacts. Everything else is a demonstration that must not dilute the DB story
and must remain defensible/extensible live.

## 2. Scope decision (decided, informed)

The brief asks for DB-only. We deliberately go **beyond** it and build the **full-stack
monorepo** described in the candidate's reference README (API + frontend), with **Prisma**
as the migration tool.

- **Rationale:** chosen as a differentiator; the candidate is comfortable owning the
  full stack live.
- **Risk acknowledged:** more surface to defend live; the DB must remain the headline.
  Walkthrough order is **DB model → README reasoning → app as demo**.
- **Migration tool:** Prisma (`prisma migrate`). Single readable `schema.prisma`,
  SQL is generated and committed under `prisma/migrations/`, trivial to extend live.

## 3. Architecture overview

Bun-workspaces monorepo:

```txt
lab-experiment-tracking/
  apps/
    api/    Bun + Elysia + Prisma + Zod + OpenAPI + Vitest  (clean architecture)
    web/    React + Vite + Tailwind + shadcn + RHF + Zod + TanStack + Kubb + Storybook + Playwright
  packages/
    shared/ enums + pure measurement-validation rules + base Zod (single source of truth)
  docker-compose.yml
  README.md
```

Backend dependency direction (domain depends on nothing external):

```txt
HTTP route -> use case -> domain port <- repository implementation (prisma | memory)
```

## 4. Data model (PRIMARY DELIVERABLE)

Conventions: `cuid()` PKs; `snake_case` Postgres names via `@@map`/`@map`;
`timestamptz` timestamps; `created_at`/`updated_at` on every table (omitted below).

### 4.1 Enums

```prisma
enum ValueType        { NUMERIC CATEGORICAL TEXT }
enum ProjectStatus    { PLANNING ACTIVE COMPLETED CANCELLED }
enum ExperimentStatus { PLANNING ACTIVE COMPLETED CANCELLED }
enum ResearcherRole   { PRINCIPAL_INVESTIGATOR POSTDOC GRADUATE_STUDENT LAB_TECHNICIAN }
enum ProjectRole      { LEAD COLLABORATOR CONTRIBUTOR }
```

`ProjectStatus` / `ExperimentStatus` are **nullable** (lifecycle without enforcing a
workflow). `specimenType` on Sample is a **free string** (the brief says "blood, tissue,
chemical compound, soil, **and so on**" → open set, not an enum).

### 4.2 Entities

| Entity | Key fields | Relations / notes |
|---|---|---|
| `Researcher` | `name`, `email @unique`, `phone?`, `globalRole: ResearcherRole` | n:n Project via `ProjectResearcher` |
| `Project` | `title`, `description?`, `status: ProjectStatus?` | n:n Researcher; 1:n Experiment |
| `ProjectResearcher` (join) | `projectRole: ProjectRole`, `joinedAt` | `@@id([projectId, researcherId])` |
| `Experiment` | `title`, `hypothesis?`, `status: ExperimentStatus?`, `startDate?`, `endDate?`, `projectId`, `previousExperimentId?` (self-FK) | n:1 Project; n:n Sample; 1:n Measurement |
| `Sample` | `code @unique` (lab-assigned id), `specimenType` (string), `collectedAt?`, `storageLocation?` | n:n Experiment via `ExperimentSample` |
| `ExperimentSample` (join) | `addedAt` | `@@id([experimentId, sampleId])` |
| `MeasurementDefinition` | `name @unique`, `description?`, `valueType: ValueType`, `defaultUnit?`, `allowedCategories: String[]` | 1:n Measurement |
| `Measurement` | `numericValue: Decimal? @db.Decimal(20,6)`, `unit?`, `categoricalValue?`, `textValue?`, `notes?`, `recordedAt`, `experimentId`, `measurementDefinitionId`, `recordedById?` | n:1 Experiment / Definition / Researcher |
| `MeasurementSample` (join, future-proof) | — | `@@id([measurementId, sampleId])` |

### 4.3 Referential integrity (`onDelete`)

- **Cascade** on join rows + Measurement→Experiment: `ProjectResearcher`,
  `ExperimentSample`, `MeasurementSample`, `Measurement`(when its Experiment is deleted).
- **Restrict** on `Experiment→Project` and `Measurement→MeasurementDefinition`
  (cannot delete a project with experiments, or a definition that is in use).
- **SetNull** on `Experiment.previousExperimentId` and `Measurement.recordedById`.

### 4.4 Indexes & uniqueness

- `@@unique`: `researcher.email`, `sample.code`, `measurementDefinition.name`.
- `@@index` on every FK: `experiment.projectId`, `experiment.previousExperimentId`,
  `measurement.experimentId`, `measurement.measurementDefinitionId`,
  `measurement.recordedById`, and the second column of each join
  (`experimentSample.sampleId`, `measurementSample.sampleId`,
  `projectResearcher.researcherId`) for reverse lookups.

### 4.5 The central modeling decision — Measurement vs MeasurementDefinition

Measurements take multiple forms (numeric+unit, categorical, free text) and new kinds
are added over time. We separate the **definition** (what is measured: type, default
unit, allowed categories) from the **value** (the recorded datum). New measurement kinds
become **rows in `measurement_definitions`**, never schema changes.

A single `Measurement` table holds all value forms with nullable typed columns
(`numeric_value`, `categorical_value`, `text_value`). Chosen over separate per-type
tables for query simplicity. (See tradeoffs §11.)

### 4.6 Where validation lives (key DB reasoning)

| Rule | Enforced where | Why |
|---|---|---|
| Exactly one value column populated | **DB CHECK**: `num_nonnulls(numeric_value, categorical_value, text_value) = 1` | In-row, no lookup needed → static constraint. |
| Populated column matches `definition.valueType` | **App (use case)** | `value_type` lives on the definition row; a CHECK cannot reference another table's column without denormalizing. |
| `categorical_value ∈ definition.allowedCategories` | **App (use case)** | Needs a lookup against the definition's array. |
| Measurement's sample(s) ⊆ experiment's samples | **App (use case)** | Cross-row invariant. |
| Follow-up shares the same project | **App (use case)** | Locked assumption; cross-row. |

We deliberately **do not denormalize `value_type` onto `measurements`** to get a stronger
CHECK — it would create a sync hazard. The `num_nonnulls = 1` CHECK + app-layer type
match is the defensible split. Tables/columns get SQL `COMMENT`s for documentation.

The DB-level CHECK and other raw SQL are added by editing the Prisma-generated migration
SQL before commit (Prisma supports hand-edited migration files).

## 5. Validation strategy (4 layers)

1. **Zod (HTTP)** — request shape/types → 400.
2. **Use case (application)** — business rules needing DB state (the table in §4.6) →
   typed domain errors → 404 / 422.
3. **Persistence** — Prisma writes inside a transaction (Measurement + MeasurementSample).
4. **DB CHECK constraint** — last line of defense.

Frontend mirrors layer 1+2 rules via `packages/shared` for UX only; backend stays the
source of truth.

## 6. API contract

Read endpoints (thin):

```txt
GET /health
GET /projects | /projects/:id | /projects/:id/researchers | /projects/:id/experiments
GET /experiments/:id | /experiments/:id/measurements | /experiments/:id/samples
GET /samples | /samples/:id
GET /measurement-definitions
POST /experiments/:experimentId/measurements      ← main write flow
```

### Write flow — `POST /experiments/:experimentId/measurements`

```txt
Body: { measurementDefinitionId, numericValue?, unit?, categoricalValue?,
        textValue?, notes?, recordedAt?, sampleIds?: string[], recordedById? }

1. Zod HTTP schema validates shape                              (400)
2. CreateMeasurement use case:
     load experiment                                           (404)
     load definition                                           (422)
     by valueType: require matching value field, reject others (422)
     CATEGORICAL → categoricalValue ∈ allowedCategories        (422)
     sampleIds ⊆ experiment.samples                            (422)
     recordedById exists if provided                           (422)
3. Repository persists Measurement + MeasurementSample in a tx
4. DB CHECK = final guard
→ 201 + Measurement DTO
```

Domain errors are typed in `domain/errors` and mapped to HTTP status in
`infrastructure/http`. Each feature ships `repositories/prisma/` (prod + integration tests)
and `repositories/memory/` (unit tests).

OpenAPI is exposed by Elysia; the frontend client is generated from it (no manual type
duplication).

## 7. Codegen (Kubb)

Kubb consumes the OpenAPI contract and generates, into `apps/web/src/generated/`:
client, TypeScript types, React Query hooks, Zod schemas, and mocks.

## 8. Frontend (`apps/web`)

- `app/`: `router.tsx` (React Router), `providers.tsx` (QueryClient), `layout.tsx`, `routes/`.
- `features/`: projects, experiments, samples, measurements. `shared/`: ui/lib/api.
- Pages (thin, compose features; TanStack Table for lists):
  - `/projects` → `/projects/:id` (researchers + experiments) →
    `/experiments/:id` (measurements table + samples + create-measurement form).
  - `/samples`, `/samples/:id`.
- Showcase component **`MeasurementValueField`** — dynamic by `valueType`:
  NUMERIC → number input + unit; CATEGORICAL → select(allowedCategories);
  TEXT → textarea. Built with RHF + Zod (from `packages/shared`).
- Storybook for domain components; Vitest unit tests (3 field cases); Playwright E2E
  (projects → project → experiment → create measurement → assert it appears).

## 9. Infrastructure / Docker

`docker compose up --build` brings up the whole system:

- `db`: `postgres:16` + healthcheck + named volume.
- `api`: Bun; entrypoint runs `prisma migrate deploy` → `prisma db seed` (idempotent) →
  serve; `depends_on: db (service_healthy)`.
- `web`: Bun + Vite; `depends_on: api`.
- `.env.example` documented; `DATABASE_URL` injected via compose.

**Brief's single-command requirement is satisfied by `docker compose up --build`**, which
yields a running Postgres with schema + seed (the graded core) regardless of the app.

## 10. Seed data

Exercises every interesting branch (mapped to brief requirements):

- ≥1 project with **multiple researchers** (with project roles).
- A researcher collaborating on **>1 project**.
- Experiments belonging to projects; **a follow-up** referencing a previous experiment.
- A **sample reused across multiple experiments**.
- Measurements of **all three kinds** (numeric / categorical / text).
- Measurements **with** a sample and **without** a sample.
- Definitions: Lead concentration (numeric, mg/L), Temperature (numeric, °C),
  Screening result (categorical: positive/negative/inconclusive), Researcher observation (text).

Seed is **idempotent** (upsert by natural keys: emails, sample codes, definition names)
so re-running the API container does not duplicate rows.

## 11. README plan (the scored reasoning)

- **Start command:** `docker compose up --build`.
- **Assumptions** (the locked set — §13).
- **Tradeoffs**, including:
  - Single `Measurement` table + `MeasurementDefinition` vs separate per-type tables
    (chose single for query simplicity; would split if per-type indexing/validation grows).
  - Prisma schema vs DB constraints — which rules live where and why (§4.6).
  - **One thing considered and not done:** sample inventory / quantity / chain-of-custody /
    storage conditions / audit history. Explicitly out; rationale documented.
- **Open questions** (§14).

## 12. Testing strategy

- **API unit:** use cases against in-memory repos — valid numeric; reject numeric w/o
  value; valid categorical; reject categorical outside allowed list; valid text.
- **API integration:** Prisma + real Postgres for the persistence layer + CHECK constraint.
- **Frontend unit:** `MeasurementValueField` renders number/select/textarea by type.
- **E2E:** the Playwright flow above.

## 13. Locked assumptions

1. An experiment belongs to **exactly one** project.
2. Follow-up experiments share the **same project** (enforced in app layer).
3. A measurement belongs to **exactly one** experiment.
4. A measurement references **0..1 sample today** (stored via `MeasurementSample` join so
   multi-sample needs no migration later).
5. Researcher roles exist **both globally** (`ResearcherRole`) **and per-project**
   (`ProjectRole`).
6. Sample storage is a **free-text location** string; `specimenType` is a free string.
7. **No auth/permissions** — out of scope per the brief.
8. **No sample inventory** (quantity, depletion, chain of custody, storage temp, audit).

## 14. Open questions for the lab

1. Can a follow-up experiment belong to a **different** project?
2. Can a measurement reference **more than one** sample? (join table already allows it.)
3. Should sample usage track **quantity consumed**?
4. Do samples need **chain-of-custody**?
5. Should storage location be **structured** instead of free text?
6. Do project/experiment statuses need **approval workflows**?
7. Are researcher roles global, project-specific, or both? (assumed both.)
8. Should measurements support **file attachments**?
9. Should categorical options be **reusable** across definitions (a `Category` table)?
10. Do measurements need **audit history / versioning**?
11. Should experiments support **multiple hypotheses**?
12. Should samples have **expiration / storage-condition** requirements?

## 15. Build decomposition (vertical slices)

0. Repo + infra skeleton (Bun workspaces, docker-compose, tsconfig, env).
1. **Data model** — `schema.prisma`, migration (+ hand-added CHECK & COMMENTs), `seed.ts`, modeling docs. *(primary)*
2. **API** — Elysia bootstrap + container + `/health` + OpenAPI; `projects` feature as the
   clean-arch template; then experiments/samples/measurement-definitions; the write flow;
   Vitest unit + integration.
3. **Codegen** — Kubb client + mocks from OpenAPI.
4. **Frontend** — Vite/React/Tailwind/shadcn shell; feature pages; `MeasurementValueField`;
   Storybook; Vitest; Playwright.
5. **Polish** — README, docs, end-to-end `docker compose up --build` verification.

## 16. Verification & git workflow

Per-package gates (`tsc`, `bun test`, build) for each slice. Attempt full
`docker compose up --build` if Docker is available in the environment; otherwise document
and rely on per-package verification.

**Git:** initialize the repo at slice 0. Commit at the end of **each slice** (and the
design doc now), with descriptive messages, so history reads as a clean progression.
Push to a public GitHub repo at the polish slice (the brief asks for a repo link).

## 17. Out of scope

Authentication/authorization, sample inventory & chain-of-custody, file attachments,
audit/versioning, advanced search, dashboards, CSV/PDF export, configurable workflows.
```
