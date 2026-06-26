### Task 5 Report: measurements write flow — POST /experiments/:experimentId/measurements

## What was implemented

All files specified by the brief were created and wired up:

**New files:**
- `apps/api/src/features/measurements/domain/measurement.ts` — `CreateMeasurementInput`, `CreatedMeasurement`, `DefinitionRuleRow` interfaces (no Elysia/Prisma/HTTP imports)
- `apps/api/src/features/measurements/domain/measurements.repository.ts` — `MeasurementsRepository` port interface
- `apps/api/src/features/measurements/application/create-measurement.ts` — `createMeasurement` use case; validates in order: experiment exists → definition exists → value-type rule → sample membership → researcher exists
- `apps/api/src/features/measurements/infrastructure/repositories/memory.ts` — `InMemoryMeasurementsRepository` for unit tests
- `apps/api/src/features/measurements/infrastructure/repositories/prisma.ts` — `PrismaMeasurementsRepository` with nested `samples.create` (single Prisma call, implicit transaction)
- `apps/api/src/features/measurements/infrastructure/http/routes.ts` — Elysia route with Zod `body: measurementValueInputSchema`
- `apps/api/src/features/measurements/application/__tests__/create-measurement.test.ts` — 8 unit tests
- `apps/api/src/features/measurements/infrastructure/__tests__/measurements.integration.test.ts` — 5 integration tests

**Modified files:**
- `apps/api/src/container.ts` — added `measurements: MeasurementsRepository` port-typed slot, assigned `new PrismaMeasurementsRepository(prisma)` in `buildContainer`
- `apps/api/src/app.ts` — added `.use(measurementsRouter(container.measurements))`

## Elysia + Zod body validation resolution

**How it was wired:** `body: measurementValueInputSchema` directly in the Elysia route options. `measurementValueInputSchema` is a Zod `z.object(...)` schema from `@lab/shared`. No adapter or wrapper was needed.

**Why it works:** Elysia 1.4.29 supports Standard Schema via `"~standard" in schema` detection. Zod 3.24+ (installed: 3.25.76) implements the `~standard` interface. Elysia's schema compiler detects this and routes body validation through the Standard Schema path, yielding HTTP **422** on validation failure — the same status code Elysia always emits for its own body validation errors.

**Malformed body status observed:** HTTP **422**. Verified empirically by the integration test `"rejects a malformed body (422 from Zod)"` which sends `{ numericValue: 1 }` (missing required `measurementDefinitionId`). The test passes.

**Error handler interaction:** `errorHandler.onError` catches `DomainError` instances (our domain errors) and maps them to the correct HTTP status. For all other errors it does `throw error`. When Elysia's body validation fails (a Standard Schema/Zod mismatch), Elysia throws its own `ValidationError` (status 422). Our `onError` handler rethrows it; Elysia's internal machinery then handles its own rethrown `ValidationError` and returns a 422 response. Empirically confirmed: test passes.

**Non-fatal warning:** `@elysiajs/openapi` logs a stderr warning that Zod doesn't provide a JSON Schema method (suggests `zod-to-json-schema`). This does not affect runtime behavior or tests — all 56 tests pass including the health integration test that checks the OpenAPI endpoint.

## TDD evidence

**RED (Step 3):** Before implementing use case or memory repo, unit test run returned:
```
Error: Failed to load url ../create-measurement
Test Files: 1 failed (1), Tests: no tests
```

**GREEN (Step 6):** After implementing `create-measurement.ts` + `memory.ts`:
```
✓ src/features/measurements/application/__tests__/create-measurement.test.ts (8 tests) 2ms
Test Files: 1 passed (1), Tests: 8 passed (8)
```

**Full suite GREEN (Step 10):**
```
Test Files  13 passed (13)
Tests       56 passed (56)
```

## Correctness fix applied

`numericValue` in the Prisma repo uses the null-safe form per the task instructions:
```ts
numericValue: created.numericValue == null ? null : Number(created.numericValue),
```
This preserves `0` as `0` (the brief's original `? :` truthy check would convert `0` to `null`). The same null-safe form was applied in the memory repo for symmetry.

## Status-code contract verification

All 5 cases confirmed by integration tests:
- experiment missing → 404 (`NotFoundError`) — PASS
- categorical value outside allowed list → 422 (`ValidationError`) — PASS
- sample not on experiment → 422 (`ValidationError`) — PASS
- malformed body (missing `measurementDefinitionId`) → 422 (Zod/Elysia Standard Schema) — PASS
- success → 201 — PASS

## Self-review findings

**Completeness:** All 5 use-case rules enforced in correct order. Route returns 201. All 8 unit cases + 5 integration cases pass.

**Quality:** Port-typed container slot; clean layer boundaries (domain imports nothing from Elysia/Prisma/HTTP; use case imports only `@lab/shared` + domain interfaces); null-safe `numericValue` in both repos.

**Testing:** Unit tests exercise real validation behavior via in-memory repo (no mocks). Integration tests hit real Elysia routes against a real seeded PostgreSQL database. TDD sequence captured above.

**Malformed-body 422:** Confirmed — integration test passes.

## Concerns

One non-blocking concern: the `@elysiajs/openapi` warning about Zod not providing JSON Schema. The measurements route body shape will not appear in the generated OpenAPI spec until `zod-to-json-schema` is configured. This is a documentation concern, not a runtime concern. It is out of scope for Task 5 and should be tracked separately (likely alongside Task 6).
