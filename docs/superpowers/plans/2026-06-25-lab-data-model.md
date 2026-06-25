# Lab Experiment Tracking — Data Model (Plan 1 of 3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the Postgres data model — Prisma schema, migrations (with a hand-added CHECK constraint + column comments), idempotent seed data, and a Docker setup where `docker compose up --build` yields a running Postgres containing the schema and seed.

**Architecture:** Bun-workspaces monorepo; the data model lives in `apps/api/prisma`. Prisma is the migration tool. A one-shot `migrate` Docker service applies migrations and seeds against the `db` service. Integration tests (Vitest + Prisma client) verify the CHECK constraint and the seed scenarios against a live Postgres.

**Tech Stack:** Bun, Prisma 6, PostgreSQL 16, Vitest, TypeScript, Docker Compose.

## Global Constraints

- Runtime & package manager: **Bun**. Package manager file is `bun.lockb`.
- Database: **PostgreSQL 16**. Migration tool: **Prisma** (`^6.0.0`).
- DB naming: **snake_case** tables/columns via `@@map`/`@map`. Timestamps are `timestamptz`. PKs are `cuid()`.
- Single command requirement: `docker compose up --build` must produce a running Postgres with schema + seed.
- Seed must be **idempotent** (upsert by explicit `seed-*` ids), safe to run repeatedly.
- Git: repo already initialized on `main`. **Commit at the end of every task.** Every commit message ends with the trailer:
  `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`
- This plan does NOT build the API server or frontend — only the data model + Docker + seed + tests. (Those are Plans 2 and 3.)

---

### Task 1: Monorepo skeleton + Bun workspaces

**Files:**
- Create: `package.json` (root)
- Create: `tsconfig.base.json`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`

**Interfaces:**
- Consumes: nothing.
- Produces: Bun workspace rooted at repo root with member `apps/api` (package name `@lab/api`); `DATABASE_URL` env contract.

- [ ] **Step 1: Create root `package.json`**

```json
{
  "name": "lab-experiment-tracking",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "db:migrate": "cd apps/api && bun run db:migrate:dev",
    "db:seed": "cd apps/api && bun run db:seed",
    "db:reset": "cd apps/api && bun run db:reset",
    "test": "cd apps/api && bun run test"
  }
}
```

- [ ] **Step 2: Create `tsconfig.base.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "types": ["bun-types"]
  }
}
```

- [ ] **Step 3: Create `.gitignore`**

```gitignore
node_modules/
dist/
*.log
.env
apps/*/.env
!.env.example
.DS_Store
apps/api/prisma/.prisma
```

- [ ] **Step 4: Create `.env.example`**

```dotenv
# Local development (Postgres reachable on localhost). In Docker, DATABASE_URL is injected by compose with host "db".
DATABASE_URL="postgresql://lab:lab@localhost:5432/lab?schema=public"
```

- [ ] **Step 5: Create `apps/api/package.json`**

```json
{
  "name": "@lab/api",
  "private": true,
  "type": "module",
  "scripts": {
    "db:migrate:dev": "prisma migrate dev",
    "db:migrate": "prisma migrate deploy",
    "db:seed": "prisma db seed",
    "db:reset": "prisma migrate reset --force",
    "generate": "prisma generate",
    "postinstall": "prisma generate || true",
    "test": "prisma migrate reset --force --skip-seed && vitest run"
  },
  "prisma": {
    "seed": "bun run prisma/seed.ts"
  },
  "dependencies": {
    "@prisma/client": "^6.0.0"
  },
  "devDependencies": {
    "prisma": "^6.0.0",
    "vitest": "^2.1.0",
    "typescript": "^5.6.0",
    "bun-types": "^1.1.0"
  }
}
```

- [ ] **Step 6: Create `apps/api/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": ".",
    "noEmit": true
  },
  "include": ["prisma/**/*.ts"]
}
```

- [ ] **Step 7: Install and verify the workspace**

Run: `bun install`
Expected: completes without error; creates `bun.lockb` and `node_modules/`. (The `postinstall` prisma generate prints "no schema found" and is tolerated by `|| true`; the real generate happens in Task 2.)

Run: `bun pm ls 2>/dev/null | head` (or `cat package.json`)
Expected: confirms `@lab/api` is part of the workspace.

- [ ] **Step 8: Commit**

```bash
# Stage the bun lockfile under whichever name your Bun version produced (bun.lock or bun.lockb).
git add package.json tsconfig.base.json .gitignore .env.example apps/api/package.json apps/api/tsconfig.json
git add bun.lock bun.lockb 2>/dev/null || true
git commit -m "chore: scaffold bun-workspaces monorepo with apps/api

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Prisma schema + initial migration

**Files:**
- Create: `apps/api/prisma/schema.prisma`
- Create: `apps/api/.env` (gitignored — local connection string)
- Create: `apps/api/prisma/migrations/` (generated by Prisma)

**Interfaces:**
- Consumes: `@lab/api` workspace and `DATABASE_URL` from Task 1.
- Produces: tables `researchers`, `projects`, `project_researchers`, `experiments`, `samples`, `experiment_samples`, `measurement_definitions`, `measurements`, `measurement_samples`; the generated Prisma Client (models `Researcher`, `Project`, `ProjectResearcher`, `Experiment`, `Sample`, `ExperimentSample`, `MeasurementDefinition`, `Measurement`, `MeasurementSample`); enums `ValueType`, `ProjectStatus`, `ExperimentStatus`, `ResearcherRole`, `ProjectRole`.

- [ ] **Step 1: Create local `apps/api/.env`**

```dotenv
DATABASE_URL="postgresql://lab:lab@localhost:5432/lab?schema=public"
```

- [ ] **Step 2: Start a local Postgres for development**

Run: `docker run --rm -d --name lab-db -e POSTGRES_USER=lab -e POSTGRES_PASSWORD=lab -e POSTGRES_DB=lab -p 5432:5432 postgres:16-alpine`
Expected: prints a container id. (If Docker is unavailable, use any local Postgres reachable at the `DATABASE_URL` above.)

- [ ] **Step 3: Write `apps/api/prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum ValueType {
  NUMERIC
  CATEGORICAL
  TEXT
}

enum ProjectStatus {
  PLANNING
  ACTIVE
  COMPLETED
  CANCELLED
}

enum ExperimentStatus {
  PLANNING
  ACTIVE
  COMPLETED
  CANCELLED
}

enum ResearcherRole {
  PRINCIPAL_INVESTIGATOR
  POSTDOC
  GRADUATE_STUDENT
  LAB_TECHNICIAN
}

enum ProjectRole {
  LEAD
  COLLABORATOR
  CONTRIBUTOR
}

model Researcher {
  id         String         @id @default(cuid())
  name       String
  email      String         @unique
  phone      String?
  globalRole ResearcherRole @map("global_role")
  createdAt  DateTime       @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt  DateTime       @updatedAt @map("updated_at") @db.Timestamptz(6)

  projects     ProjectResearcher[]
  measurements Measurement[]

  @@map("researchers")
}

model Project {
  id          String         @id @default(cuid())
  title       String
  description String?
  status      ProjectStatus?
  createdAt   DateTime       @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt   DateTime       @updatedAt @map("updated_at") @db.Timestamptz(6)

  researchers ProjectResearcher[]
  experiments Experiment[]

  @@map("projects")
}

model ProjectResearcher {
  projectId    String      @map("project_id")
  researcherId String      @map("researcher_id")
  projectRole  ProjectRole @map("project_role")
  joinedAt     DateTime    @default(now()) @map("joined_at") @db.Timestamptz(6)

  project    Project    @relation(fields: [projectId], references: [id], onDelete: Cascade)
  researcher Researcher @relation(fields: [researcherId], references: [id], onDelete: Cascade)

  @@id([projectId, researcherId])
  @@index([researcherId])
  @@map("project_researchers")
}

model Experiment {
  id                   String            @id @default(cuid())
  title                String
  hypothesis           String?
  status               ExperimentStatus?
  startDate            DateTime?         @map("start_date") @db.Timestamptz(6)
  endDate              DateTime?         @map("end_date") @db.Timestamptz(6)
  projectId            String            @map("project_id")
  previousExperimentId String?           @map("previous_experiment_id")
  createdAt            DateTime          @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt            DateTime          @updatedAt @map("updated_at") @db.Timestamptz(6)

  project            Project            @relation(fields: [projectId], references: [id], onDelete: Restrict)
  previousExperiment Experiment?        @relation("ExperimentFollowUp", fields: [previousExperimentId], references: [id], onDelete: SetNull)
  followUps          Experiment[]       @relation("ExperimentFollowUp")
  samples            ExperimentSample[]
  measurements       Measurement[]

  @@index([projectId])
  @@index([previousExperimentId])
  @@map("experiments")
}

model Sample {
  id              String    @id @default(cuid())
  code            String    @unique
  specimenType    String    @map("specimen_type")
  collectedAt     DateTime? @map("collected_at") @db.Timestamptz(6)
  storageLocation String?   @map("storage_location")
  createdAt       DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt       DateTime  @updatedAt @map("updated_at") @db.Timestamptz(6)

  experiments  ExperimentSample[]
  measurements MeasurementSample[]

  @@map("samples")
}

model ExperimentSample {
  experimentId String   @map("experiment_id")
  sampleId     String   @map("sample_id")
  addedAt      DateTime @default(now()) @map("added_at") @db.Timestamptz(6)

  experiment Experiment @relation(fields: [experimentId], references: [id], onDelete: Cascade)
  sample     Sample     @relation(fields: [sampleId], references: [id], onDelete: Cascade)

  @@id([experimentId, sampleId])
  @@index([sampleId])
  @@map("experiment_samples")
}

model MeasurementDefinition {
  id                String    @id @default(cuid())
  name              String    @unique
  description       String?
  valueType         ValueType @map("value_type")
  defaultUnit       String?   @map("default_unit")
  allowedCategories String[]  @map("allowed_categories")
  createdAt         DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt         DateTime  @updatedAt @map("updated_at") @db.Timestamptz(6)

  measurements Measurement[]

  @@map("measurement_definitions")
}

model Measurement {
  id                      String   @id @default(cuid())
  experimentId            String   @map("experiment_id")
  measurementDefinitionId String   @map("measurement_definition_id")
  recordedById            String?  @map("recorded_by_id")
  numericValue            Decimal? @map("numeric_value") @db.Decimal(20, 6)
  unit                    String?
  categoricalValue        String?  @map("categorical_value")
  textValue               String?  @map("text_value")
  notes                   String?
  recordedAt              DateTime @default(now()) @map("recorded_at") @db.Timestamptz(6)
  createdAt               DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt               DateTime @updatedAt @map("updated_at") @db.Timestamptz(6)

  experiment Experiment            @relation(fields: [experimentId], references: [id], onDelete: Cascade)
  definition MeasurementDefinition @relation(fields: [measurementDefinitionId], references: [id], onDelete: Restrict)
  recordedBy Researcher?           @relation(fields: [recordedById], references: [id], onDelete: SetNull)
  samples    MeasurementSample[]

  @@index([experimentId])
  @@index([measurementDefinitionId])
  @@index([recordedById])
  @@map("measurements")
}

model MeasurementSample {
  measurementId String @map("measurement_id")
  sampleId      String @map("sample_id")

  measurement Measurement @relation(fields: [measurementId], references: [id], onDelete: Cascade)
  sample      Sample      @relation(fields: [sampleId], references: [id], onDelete: Cascade)

  @@id([measurementId, sampleId])
  @@index([sampleId])
  @@map("measurement_samples")
}
```

- [ ] **Step 4: Create the initial migration**

Run: `cd apps/api && bunx prisma migrate dev --name init`
Expected: creates `prisma/migrations/<timestamp>_init/migration.sql`, applies it, and generates the client. Output ends with "Your database is now in sync with your schema."

- [ ] **Step 5: Verify migration status**

Run: `cd apps/api && bunx prisma migrate status`
Expected: "Database schema is up to date!" — no pending migrations.

- [ ] **Step 6: Commit**

```bash
git add apps/api/prisma/schema.prisma apps/api/prisma/migrations
git commit -m "feat(db): add prisma schema and initial migration

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Harden the model — CHECK constraint + column comments (TDD)

**Files:**
- Create: `apps/api/vitest.config.ts`
- Create: `apps/api/prisma/__tests__/constraints.test.ts`
- Create: `apps/api/prisma/migrations/<timestamp>_add_measurement_value_check/migration.sql` (created via Prisma, then hand-edited)

**Interfaces:**
- Consumes: the Prisma Client and tables from Task 2.
- Produces: DB constraint `measurements_exactly_one_value` enforcing `num_nonnulls(numeric_value, categorical_value, text_value) = 1`; documentation comments on `measurements` and `measurement_definitions`.

- [ ] **Step 1: Create `apps/api/vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["prisma/__tests__/**/*.test.ts"],
    fileParallelism: false, // tests share one Postgres; run serially
    hookTimeout: 30000,
    testTimeout: 30000,
  },
});
```

- [ ] **Step 2: Write the failing test**

Create `apps/api/prisma/__tests__/constraints.test.ts`:

```ts
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient, ResearcherRole, ValueType } from "@prisma/client";

const prisma = new PrismaClient();

const EXPERIMENT_ID = "test-exp-constraints";
const DEFINITION_ID = "test-def-constraints";
const PROJECT_ID = "test-project-constraints";

beforeAll(async () => {
  await prisma.project.create({
    data: { id: PROJECT_ID, title: "Constraints fixture", status: "ACTIVE" },
  });
  await prisma.experiment.create({
    data: { id: EXPERIMENT_ID, title: "Constraints fixture exp", projectId: PROJECT_ID },
  });
  await prisma.measurementDefinition.create({
    data: { id: DEFINITION_ID, name: "Constraints fixture def", valueType: ValueType.NUMERIC },
  });
});

afterAll(async () => {
  await prisma.measurement.deleteMany({ where: { experimentId: EXPERIMENT_ID } });
  await prisma.experiment.delete({ where: { id: EXPERIMENT_ID } });
  await prisma.measurementDefinition.delete({ where: { id: DEFINITION_ID } });
  await prisma.project.delete({ where: { id: PROJECT_ID } });
  await prisma.$disconnect();
});

describe("measurements_exactly_one_value CHECK", () => {
  it("accepts exactly one value column", async () => {
    const m = await prisma.measurement.create({
      data: { experimentId: EXPERIMENT_ID, measurementDefinitionId: DEFINITION_ID, numericValue: 12.4, unit: "mg/L" },
    });
    expect(m.id).toBeTruthy();
    await prisma.measurement.delete({ where: { id: m.id } });
  });

  it("rejects two value columns", async () => {
    await expect(
      prisma.measurement.create({
        data: { experimentId: EXPERIMENT_ID, measurementDefinitionId: DEFINITION_ID, numericValue: 1, textValue: "x" },
      }),
    ).rejects.toThrow();
  });

  it("rejects zero value columns", async () => {
    await expect(
      prisma.measurement.create({
        data: { experimentId: EXPERIMENT_ID, measurementDefinitionId: DEFINITION_ID },
      }),
    ).rejects.toThrow();
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `cd apps/api && bunx prisma migrate reset --force --skip-seed && bunx vitest run prisma/__tests__/constraints.test.ts`
Expected: the "rejects two value columns" and "rejects zero value columns" cases FAIL (no constraint yet, so the inserts succeed instead of throwing).

- [ ] **Step 4: Create an empty migration to hold the raw SQL**

Run: `cd apps/api && bunx prisma migrate dev --create-only --name add_measurement_value_check`
Expected: creates a new migration folder with an empty/near-empty `migration.sql`. It is NOT applied yet.

- [ ] **Step 5: Write the raw SQL into the new migration**

Open the new `apps/api/prisma/migrations/<timestamp>_add_measurement_value_check/migration.sql` and set its contents to:

```sql
-- Enforce that exactly one typed value column is populated per measurement.
-- The "matches the definition's valueType" rule needs a cross-table lookup and
-- lives in the application layer; this static, in-row guard is the DB backstop.
ALTER TABLE "measurements"
  ADD CONSTRAINT "measurements_exactly_one_value"
  CHECK (num_nonnulls("numeric_value", "categorical_value", "text_value") = 1);

COMMENT ON TABLE "measurements" IS 'Recorded data points. Exactly one of numeric_value/categorical_value/text_value is populated (CHECK + app layer).';
COMMENT ON COLUMN "measurements"."numeric_value" IS 'Populated when the definition valueType = NUMERIC.';
COMMENT ON COLUMN "measurements"."categorical_value" IS 'Populated when valueType = CATEGORICAL; must be in definition.allowed_categories (enforced in app layer).';
COMMENT ON COLUMN "measurements"."text_value" IS 'Populated when valueType = TEXT.';
COMMENT ON TABLE "measurement_definitions" IS 'Describes a kind of measurement; new kinds are rows here, not schema changes.';
```

- [ ] **Step 6: Apply the migration**

Run: `cd apps/api && bunx prisma migrate dev`
Expected: applies `add_measurement_value_check`; "Your database is now in sync with your schema."

- [ ] **Step 7: Run the test to verify it passes**

Run: `cd apps/api && bunx vitest run prisma/__tests__/constraints.test.ts`
Expected: all three cases PASS.

- [ ] **Step 8: Commit**

```bash
git add apps/api/vitest.config.ts apps/api/prisma/__tests__/constraints.test.ts apps/api/prisma/migrations
git commit -m "feat(db): enforce exactly-one-value CHECK on measurements + add comments

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Idempotent seed data (TDD)

**Files:**
- Create: `apps/api/prisma/seed.ts`
- Create: `apps/api/prisma/__tests__/seed.test.ts`

**Interfaces:**
- Consumes: the Prisma Client + constraint from Tasks 2–3.
- Produces: `seed.ts` exporting `async function seed(): Promise<void>` (also auto-runs when executed directly via Bun). Seed rows use stable ids: projects `seed-project-water`/`seed-project-soil`; researchers `seed-researcher-alice`/`-bob`/`-carol`; experiments `seed-exp-1`/`-2`/`-3`; samples `seed-sample-blood`/`-soil`; definitions `seed-def-lead`/`-temp`/`-screen`/`-obs`; measurements `seed-meas-lead-1`/`-screen-1`/`-obs-1`/`-lead-2`/`-temp-1`.

- [ ] **Step 1: Write `apps/api/prisma/seed.ts`**

```ts
import { PrismaClient, ProjectRole, ProjectStatus, ResearcherRole, ValueType } from "@prisma/client";

const prisma = new PrismaClient();

export async function seed(): Promise<void> {
  // --- Researchers ---
  const alice = await prisma.researcher.upsert({
    where: { id: "seed-researcher-alice" },
    update: {},
    create: { id: "seed-researcher-alice", name: "Alice Nguyen", email: "alice@lab.test", globalRole: ResearcherRole.PRINCIPAL_INVESTIGATOR },
  });
  const bob = await prisma.researcher.upsert({
    where: { id: "seed-researcher-bob" },
    update: {},
    create: { id: "seed-researcher-bob", name: "Bob Silva", email: "bob@lab.test", globalRole: ResearcherRole.GRADUATE_STUDENT },
  });
  const carol = await prisma.researcher.upsert({
    where: { id: "seed-researcher-carol" },
    update: {},
    create: { id: "seed-researcher-carol", name: "Carol Tan", email: "carol@lab.test", globalRole: ResearcherRole.LAB_TECHNICIAN },
  });

  // --- Projects ---
  const water = await prisma.project.upsert({
    where: { id: "seed-project-water" },
    update: {},
    create: { id: "seed-project-water", title: "Municipal Water Quality", description: "Lead and contaminant screening of municipal water.", status: ProjectStatus.ACTIVE },
  });
  const soil = await prisma.project.upsert({
    where: { id: "seed-project-soil" },
    update: {},
    create: { id: "seed-project-soil", title: "Urban Soil Survey", description: "Soil composition study across city districts.", status: ProjectStatus.PLANNING },
  });

  // --- Project membership (multiple researchers; bob + alice on >1 project) ---
  const memberships: Array<{ projectId: string; researcherId: string; projectRole: ProjectRole }> = [
    { projectId: water.id, researcherId: alice.id, projectRole: ProjectRole.LEAD },
    { projectId: water.id, researcherId: bob.id, projectRole: ProjectRole.COLLABORATOR },
    { projectId: water.id, researcherId: carol.id, projectRole: ProjectRole.CONTRIBUTOR },
    { projectId: soil.id, researcherId: alice.id, projectRole: ProjectRole.LEAD },
    { projectId: soil.id, researcherId: bob.id, projectRole: ProjectRole.COLLABORATOR },
  ];
  for (const m of memberships) {
    await prisma.projectResearcher.upsert({
      where: { projectId_researcherId: { projectId: m.projectId, researcherId: m.researcherId } },
      update: {},
      create: m,
    });
  }

  // --- Experiments (exp2 is a follow-up of exp1) ---
  const exp1 = await prisma.experiment.upsert({
    where: { id: "seed-exp-1" },
    update: {},
    create: { id: "seed-exp-1", title: "Baseline lead screening", hypothesis: "Lead levels exceed the safe threshold.", status: "COMPLETED", projectId: water.id },
  });
  const exp2 = await prisma.experiment.upsert({
    where: { id: "seed-exp-2" },
    update: {},
    create: { id: "seed-exp-2", title: "Lead screening replication", hypothesis: "Baseline lead levels reproduce.", status: "ACTIVE", projectId: water.id, previousExperimentId: exp1.id },
  });
  const exp3 = await prisma.experiment.upsert({
    where: { id: "seed-exp-3" },
    update: {},
    create: { id: "seed-exp-3", title: "Soil pH survey", hypothesis: "District A soil is more acidic.", status: "ACTIVE", projectId: soil.id },
  });

  // --- Samples ---
  const blood = await prisma.sample.upsert({
    where: { id: "seed-sample-blood" },
    update: {},
    create: { id: "seed-sample-blood", code: "BLD-001", specimenType: "blood", storageLocation: "Freezer A / Shelf 2" },
  });
  const soilSample = await prisma.sample.upsert({
    where: { id: "seed-sample-soil" },
    update: {},
    create: { id: "seed-sample-soil", code: "SOIL-001", specimenType: "soil", storageLocation: "Cabinet 3" },
  });

  // --- Sample usage (blood reused across exp1 AND exp2) ---
  const expSamples: Array<{ experimentId: string; sampleId: string }> = [
    { experimentId: exp1.id, sampleId: blood.id },
    { experimentId: exp2.id, sampleId: blood.id },
    { experimentId: exp3.id, sampleId: soilSample.id },
  ];
  for (const es of expSamples) {
    await prisma.experimentSample.upsert({
      where: { experimentId_sampleId: { experimentId: es.experimentId, sampleId: es.sampleId } },
      update: {},
      create: es,
    });
  }

  // --- Measurement definitions (numeric, numeric, categorical, text) ---
  const lead = await prisma.measurementDefinition.upsert({
    where: { id: "seed-def-lead" },
    update: {},
    create: { id: "seed-def-lead", name: "Lead concentration", valueType: ValueType.NUMERIC, defaultUnit: "mg/L", allowedCategories: [] },
  });
  const temp = await prisma.measurementDefinition.upsert({
    where: { id: "seed-def-temp" },
    update: {},
    create: { id: "seed-def-temp", name: "Temperature", valueType: ValueType.NUMERIC, defaultUnit: "°C", allowedCategories: [] },
  });
  const screen = await prisma.measurementDefinition.upsert({
    where: { id: "seed-def-screen" },
    update: {},
    create: { id: "seed-def-screen", name: "Screening result", valueType: ValueType.CATEGORICAL, allowedCategories: ["positive", "negative", "inconclusive"] },
  });
  const obs = await prisma.measurementDefinition.upsert({
    where: { id: "seed-def-obs" },
    update: {},
    create: { id: "seed-def-obs", name: "Researcher observation", valueType: ValueType.TEXT, allowedCategories: [] },
  });

  // --- Measurements: numeric/categorical/text; with and without a sample ---
  await prisma.measurement.upsert({
    where: { id: "seed-meas-lead-1" },
    update: {},
    create: { id: "seed-meas-lead-1", experimentId: exp1.id, measurementDefinitionId: lead.id, recordedById: alice.id, numericValue: 12.4, unit: "mg/L", samples: { create: [{ sampleId: blood.id }] } },
  });
  await prisma.measurement.upsert({
    where: { id: "seed-meas-screen-1" },
    update: {},
    create: { id: "seed-meas-screen-1", experimentId: exp1.id, measurementDefinitionId: screen.id, recordedById: bob.id, categoricalValue: "positive", samples: { create: [{ sampleId: blood.id }] } },
  });
  // Text measurement WITHOUT a sample (applies to the experiment as a whole).
  await prisma.measurement.upsert({
    where: { id: "seed-meas-obs-1" },
    update: {},
    create: { id: "seed-meas-obs-1", experimentId: exp1.id, measurementDefinitionId: obs.id, recordedById: alice.id, textValue: "Sample appeared slightly turbid before testing.", notes: "Logged during intake." },
  });
  await prisma.measurement.upsert({
    where: { id: "seed-meas-lead-2" },
    update: {},
    create: { id: "seed-meas-lead-2", experimentId: exp2.id, measurementDefinitionId: lead.id, recordedById: bob.id, numericValue: 9.8, unit: "mg/L", samples: { create: [{ sampleId: blood.id }] } },
  });
  await prisma.measurement.upsert({
    where: { id: "seed-meas-temp-1" },
    update: {},
    create: { id: "seed-meas-temp-1", experimentId: exp3.id, measurementDefinitionId: temp.id, recordedById: carol.id, numericValue: 22.5, unit: "°C", samples: { create: [{ sampleId: soilSample.id }] } },
  });
}

if (import.meta.main) {
  seed()
    .then(async () => {
      await prisma.$disconnect();
      // eslint-disable-next-line no-console
      console.log("Seed complete.");
    })
    .catch(async (e) => {
      // eslint-disable-next-line no-console
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
```

- [ ] **Step 2: Write the seed verification test**

Create `apps/api/prisma/__tests__/seed.test.ts`:

```ts
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { seed } from "../seed";

const prisma = new PrismaClient();

beforeAll(async () => {
  await seed();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("seed data", () => {
  it("water project has multiple researchers", async () => {
    const count = await prisma.projectResearcher.count({ where: { projectId: "seed-project-water" } });
    expect(count).toBeGreaterThanOrEqual(3);
  });

  it("a researcher collaborates on more than one project", async () => {
    const count = await prisma.projectResearcher.count({ where: { researcherId: "seed-researcher-bob" } });
    expect(count).toBeGreaterThanOrEqual(2);
  });

  it("exp2 is a follow-up of exp1", async () => {
    const exp2 = await prisma.experiment.findUniqueOrThrow({ where: { id: "seed-exp-2" } });
    expect(exp2.previousExperimentId).toBe("seed-exp-1");
  });

  it("the blood sample is reused across multiple experiments", async () => {
    const count = await prisma.experimentSample.count({ where: { sampleId: "seed-sample-blood" } });
    expect(count).toBeGreaterThanOrEqual(2);
  });

  it("has numeric, categorical and text measurements", async () => {
    const numeric = await prisma.measurement.findFirst({ where: { numericValue: { not: null } } });
    const categorical = await prisma.measurement.findFirst({ where: { categoricalValue: { not: null } } });
    const text = await prisma.measurement.findFirst({ where: { textValue: { not: null } } });
    expect(numeric).not.toBeNull();
    expect(categorical).not.toBeNull();
    expect(text).not.toBeNull();
  });

  it("has a measurement with a sample and one without", async () => {
    const withSample = await prisma.measurementSample.count({ where: { measurementId: "seed-meas-lead-1" } });
    const withoutSample = await prisma.measurementSample.count({ where: { measurementId: "seed-meas-obs-1" } });
    expect(withSample).toBeGreaterThanOrEqual(1);
    expect(withoutSample).toBe(0);
  });

  it("is idempotent (second run does not duplicate)", async () => {
    await seed();
    const measurements = await prisma.measurement.count();
    expect(measurements).toBe(5);
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail, then pass**

Run: `cd apps/api && bunx prisma migrate reset --force --skip-seed && bunx vitest run prisma/__tests__/seed.test.ts`
Expected: PASS (seed runs in `beforeAll`, assertions hold). If you ran this before writing `seed.ts`, the import would fail — confirming the test depends on the deliverable.

- [ ] **Step 4: Run the seed via the Prisma CLI path (the Docker entrypoint uses this)**

Run: `cd apps/api && bunx prisma migrate reset --force --skip-seed && bunx prisma db seed`
Expected: prints "Seed complete." and exits 0.

- [ ] **Step 5: Run the full api test suite**

Run: `cd apps/api && bun run test`
Expected: resets the DB, runs both `constraints.test.ts` and `seed.test.ts`; all tests PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/api/prisma/seed.ts apps/api/prisma/__tests__/seed.test.ts
git commit -m "feat(db): add idempotent seed data exercising every scenario

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Docker single-command + README start section

**Files:**
- Create: `apps/api/Dockerfile`
- Create: `apps/api/.dockerignore`
- Create: `docker-compose.yml`
- Create: `README.md`

**Interfaces:**
- Consumes: schema, migrations, and seed from Tasks 2–4.
- Produces: `docker compose up --build` brings up Postgres (`db`) and runs a one-shot `migrate` service that applies migrations and seeds. End state: a running Postgres with schema + seed.

- [ ] **Step 1: Create `apps/api/Dockerfile`** (build context is the repo root)

```dockerfile
FROM oven/bun:1
WORKDIR /app

# Install workspace deps (root + apps/api) using the lockfile.
# bun.lock* matches whichever lockfile name your Bun version produced.
COPY package.json bun.lock* ./
COPY apps/api/package.json apps/api/package.json
RUN bun install --frozen-lockfile

# Copy the source needed for migrations + seed.
COPY tsconfig.base.json tsconfig.base.json
COPY apps/api apps/api

# Generate the Prisma Client against the schema.
RUN cd apps/api && bunx prisma generate

# Apply migrations, then seed. Postgres stays up; this one-shot service exits 0.
CMD ["sh", "-c", "cd apps/api && bunx prisma migrate deploy && bunx prisma db seed"]
```

- [ ] **Step 2: Create `apps/api/.dockerignore`**

```dockerignore
node_modules
**/node_modules
.env
**/.env
dist
.git
```

- [ ] **Step 3: Create `docker-compose.yml`**

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: lab
      POSTGRES_PASSWORD: lab
      POSTGRES_DB: lab
    ports:
      - "5432:5432"
    volumes:
      - db_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U lab -d lab"]
      interval: 5s
      timeout: 5s
      retries: 10

  migrate:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    environment:
      DATABASE_URL: "postgresql://lab:lab@db:5432/lab?schema=public"
    depends_on:
      db:
        condition: service_healthy

volumes:
  db_data:
```

- [ ] **Step 4: Create `README.md`** (start section; assumptions/tradeoffs/open-questions are expanded in the polish slice)

```markdown
# Laboratory Experiment Tracking System — Data Model

A PostgreSQL data model for tracking lab researchers, projects, experiments,
samples, and measurements. Schema and migrations are managed with Prisma; seed
data demonstrates the modeled scenarios.

## Getting started

Requirements: Docker.

```bash
docker compose up --build
```

This starts PostgreSQL, applies all migrations, and loads the seed data. After
the `migrate` service prints `Seed complete.` and exits, the database is ready.

Connect with: `postgresql://lab:lab@localhost:5432/lab`

## Project layout

- `apps/api/prisma/schema.prisma` — the data model
- `apps/api/prisma/migrations/` — versioned SQL migrations (incl. the
  `measurements_exactly_one_value` CHECK constraint)
- `apps/api/prisma/seed.ts` — idempotent seed data

## Running the tests

With a Postgres reachable at `DATABASE_URL` (e.g. `docker compose up db`):

```bash
bun install
cd apps/api && bun run test
```
```

- [ ] **Step 5: Verify the single command (if Docker is available)**

Run: `docker compose down -v && docker compose up --build`
Expected: `db` becomes healthy; `migrate` applies migrations, prints `Seed complete.`, and exits 0.

Run (in another shell): `docker compose exec db psql -U lab -d lab -c "select count(*) from measurements;"`
Expected: `5`.

Run: `docker compose exec db psql -U lab -d lab -c "\d+ measurements" | grep measurements_exactly_one_value`
Expected: shows the CHECK constraint.

If Docker is NOT available in the environment, note that in the task output and rely on the per-package verification from Tasks 2–4 (`bun run test` green against a local Postgres).

- [ ] **Step 6: Commit**

```bash
git add apps/api/Dockerfile apps/api/.dockerignore docker-compose.yml README.md
git commit -m "feat: one-command docker setup (migrate + seed) and README start guide

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review

**1. Spec coverage (spec §4, §9, §10, §11, §16):**
- §4 data model (all 9 tables, enums, onDelete, indexes, CHECK, snake_case, timestamptz, Decimal, String[]) → Task 2 + Task 3. ✔
- §4.6 validation-in-DB (`num_nonnulls = 1`) → Task 3. ✔ (type-match + category-membership are app-layer → Plan 2, intentionally out of scope here.)
- §9 Docker single command → Task 5. ✔ (api/web *serving* is Plans 2/3; the brief's "running Postgres with schema + seed" is fully met here.)
- §10 seed scenarios (multi-researcher, >1-project researcher, follow-up, reused sample, 3 measurement kinds, with/without sample, the 4 definitions) → Task 4 + its tests. ✔
- §11 README start command → Task 5. (assumptions/tradeoffs/open-questions text → polish slice / Plan 3 README expansion.) ✔ partial-by-design
- §16 git per slice → every task commits. ✔

**2. Placeholder scan:** No TBD/TODO; every code/SQL/test block is complete. ✔

**3. Type consistency:** Prisma model/enum names (`Measurement`, `MeasurementSample`, `MeasurementDefinition`, `ValueType`, `ResearcherRole`, `ProjectRole`, `ProjectStatus`) are identical across schema, seed, and tests. Composite-key accessors (`projectId_researcherId`, `experimentId_sampleId`) match the `@@id` definitions. `seed()` export name matches the test import. Seed measurement count (5) matches the idempotency assertion. ✔

## What this plan deliberately leaves to later plans
- **Plan 2 (API):** Elysia clean-architecture features, the `POST /experiments/:id/measurements` write flow with app-layer validation (valueType match, category membership, sample-subset), OpenAPI, unit + integration tests, `packages/shared`.
- **Plan 3 (Frontend):** Kubb codegen, React/Vite/Tailwind/shadcn app, `MeasurementValueField`, Storybook, Vitest, Playwright, and the full README (assumptions, tradeoffs, open questions).
