# Lab Experiment Tracking — Frontend (`apps/web`) Design

- **Date:** 2026-06-26
- **Status:** Approved (brainstorming) → ready for implementation plan
- **Author:** ruver
- **Scope:** Plan 3 of 3 — the React frontend and its OpenAPI→Kubb codegen pipeline.
- **Parent design:** [`2026-06-25-lab-experiment-tracking-design.md`](./2026-06-25-lab-experiment-tracking-design.md) (§6 API contract, §7 codegen, §8 frontend). This doc refines §7–§8 into a concrete, decided structure and reconciles it with the existing scaffold.

---

## 1. Goal & deliberate scope

Build the **structure** of the frontend: the typed API layer (generated from the API's OpenAPI), the route skeleton, the data/forms plumbing, and the test harness — so feature pages can be filled in one at a time.

**Owner split (explicit):**
- **This plan builds:** the codegen pipeline, the typed client + query layer, the route structure with data-wired placeholder pages, the reusable `MeasurementValueField` form primitive + the record-measurement form wiring, env/dev-connectivity, and the test harness pattern.
- **The user builds afterward, page by page:** the actual page **layouts and visual design**. Each placeholder page already proves its data path; the user replaces the body with real UI.

Backend is the source of truth for all rules (parent §5). The frontend mirrors validation only for UX, via `@lab/shared` and generated Zod schemas.

## 2. Current scaffold (reconciliation — what already exists)

`apps/web` is scaffolded and must be **extended, not recreated**:

- Stack: React 19, Vite, TypeScript, Tailwind v4, shadcn (`base-nova` / Base UI), `react-router-dom` v7, `@tanstack/react-query` v5, `react-hook-form` + `@hookform/resolvers` + `zod`, `@lab/shared` (workspace), `lucide-react`. Tooling: Kubb v4 (all plugins installed), Storybook 10, Playwright, Vitest (unit + storybook browser projects), oxlint.
- Already wired: `src/main.tsx` → `app/providers.tsx` (`QueryClientProvider`) → `RouterProvider`; `app/router.tsx` (`createBrowserRouter`, only the `/` home route); `app/layout.tsx` (shell with `<Outlet/>`); `app/routes/home.tsx` (placeholder); `components/ui/button.tsx` (+ story); `lib/utils.ts`; `src/test/setup.ts`; Vite alias `@ → src`.
- **Not yet done (this plan):** `kubb.config.ts` has `plugins: []` and points `input.path` at `../api/openapi.json`, **which does not exist**. `src/generated/` is empty (`.gitkeep`). No API client config, no env, no dev proxy, no feature routes/pages, no forms.

The API (Plan 2) serves on **port 3000**; its OpenAPI doc at `/openapi/json` now includes the `POST` request body (Plan 2 commit `f0321d7`).

## 3. Key decisions

| # | Decision | Choice | Rationale |
|---|---|---|---|
| 1 | OpenAPI source for codegen | **File export.** An `apps/api` script writes `apps/api/openapi.json`; Kubb reads that file (the path it already targets). | Kubb's canonical example uses a local file; deterministic and committable; codegen needs no running server. Boot-and-dump needs no DB (the `/openapi/json` handler touches no repository). |
| 2 | Kubb outputs | **Full stack:** `pluginOas` + `pluginTs` + `pluginClient` + `pluginReactQuery` + `pluginZod`, **grouped by tag** → `src/generated/<tag>/`. React Query hooks use the generated Zod schema as a response **parser**. | Kubb's documented "typed fetching + runtime validation" combination. `pluginTs` is the required base; the Zod schemas also feed the write-flow form (`@hookform/resolvers`). |
| 3 | Client transport | **fetch** (Kubb's default client; no new dependency). | Native, zero-dep; sufficient for this app. axios is opt-in and unnecessary. |
| 4 | Page stub depth | **Data-wired stub** per route: calls its generated query hook, handles loading / error / empty, dumps raw data. | Proves the full data path end-to-end so the user only swaps in layout. Keeps plumbing out of the layout work. |
| 5 | Dev connectivity | **Vite dev proxy.** Proxy a `/api` prefix → `http://localhost:3000`; client baseURL is same-origin. | No change to the Plan 2 API, no CORS needed in dev. |

## 4. Codegen pipeline

```txt
apps/api/src/<openapi export script>      # boots buildApp, GET /openapi/json, writes apps/api/openapi.json
        │  (apps/api script: "export:openapi")
        ▼
apps/api/openapi.json                      # committed contract artifact
        │  (apps/web: kubb generate, reads ../api/openapi.json)
        ▼
apps/web/src/generated/<tag>/              # types + fetch client + RQ hooks + zod, grouped by tag
```

- **Export script** (`apps/api`): builds the app via the existing `buildApp(buildContainer(getPrisma()))`, calls `app.handle(new Request("http://localhost/openapi/json"))`, writes the JSON body to `apps/api/openapi.json`. No DB connection occurs. Added as `apps/api` script `export:openapi`.
- **`kubb.config.ts`:** populate `plugins` with `pluginOas()`, `pluginTs()`, `pluginClient({ client: 'fetch', baseURL from env })`, `pluginReactQuery({ parser: 'zod' })`, `pluginZod()`; enable grouping by tag; keep `output.path: ./src/generated`, `clean: true`. Exact option names verified against the installed `@kubb/*@4.x` during implementation.
- **Script wiring:** commit `apps/api/openapi.json`; `bun run export:openapi` (in `apps/api`) regenerates it; `apps/web`'s existing `codegen` (`kubb generate`) consumes it. A convenience root `codegen` script chains both (export → generate).
- **`src/generated/` is generated, not hand-edited.** It stays git-tracked so the app type-checks without a codegen step, but is always reproducible.

## 5. API client, env, dev proxy

- **Base URL:** the generated client reads `import.meta.env.VITE_API_URL`, defaulting to `/api` (same-origin, proxied in dev). Set to a full origin (`http://localhost:3000`) only when not proxying.
- **Vite proxy:** `vite.config.ts` `server.proxy` maps `/api` → `http://localhost:3000` with a rewrite stripping the `/api` prefix (API routes live at root).
- **Env:** `apps/web/.env.example` documents `VITE_API_URL` (commented; default `/api` works in dev). No secrets.
- The transport mechanism (plugin-client `baseURL`/custom client module) is decided at implementation time against the installed plugin API; the contract here is "baseURL comes from `VITE_API_URL`, defaults to the proxied `/api`."

## 6. Data layer

- `QueryClientProvider` already exists in `providers.tsx` — reused as-is.
- Pages consume the **generated React Query hooks directly** (no bespoke wrapper layer — YAGNI). Query keys and fetchers are generated.
- Errors surface through React Query state; placeholder pages render a minimal error branch (the user restyles).

## 7. Route structure & page stubs

`app/router.tsx` gains the routes below, each a **data-wired stub** under `app/routes/` (or `features/<x>/pages/`). The home route stays.

| Route | Generated hook it calls | Stub renders |
|---|---|---|
| `/projects` | list projects | loading / error / empty / raw list |
| `/projects/:projectId` | project + researchers + experiments | the three datasets raw |
| `/experiments/:experimentId` | experiment + measurements + samples | the three datasets raw + a link/region for the create-measurement form |
| `/samples` | list samples | raw list |
| `/samples/:sampleId` | sample detail | raw detail |
| `/measurement-definitions` | list definitions | raw list |

Each stub is intentionally layout-free: it confirms the hook, params, loading/error/empty states, and types resolve. The user replaces the body with real UI (TanStack Table for lists per parent §8, etc.).

## 8. Forms — record measurement (`POST /experiments/:id/measurements`)

The one write flow gets real structure (it's the showcase, parent §8):

- **`MeasurementValueField`** — a reusable controlled field that switches on `valueType` (`MeasurementValueType` from `@lab/shared`): `NUMERIC` → number input + unit; `CATEGORICAL` → select over `allowedCategories`; `TEXT` → textarea. Built with RHF. Functional but minimally styled — **visual treatment is user-owned**; the switching logic and validation wiring are structural.
- **Create-measurement form** — uses the **generated mutation hook** + a Zod resolver (generated body schema or `measurementValueInputSchema` from `@lab/shared`) via `@hookform/resolvers`. On success, invalidates the experiment's measurements query. Lives near `/experiments/:experimentId`.
- The form mirrors backend rules for UX only; the API remains authoritative.

## 9. Testing structure (harness only; keep existing tooling)

- **Render helper** — `src/test/render.tsx`: wraps a unit under test in a fresh `QueryClient` + `MemoryRouter`, so page/component tests have providers. (New; the existing `src/test/setup.ts` stays.)
- **Unit (Vitest):** `MeasurementValueField` — 3 cases (number / select / textarea by `valueType`), per parent §8/§12. Page stubs are not asserted on (they're placeholders the user replaces).
- **Storybook:** keep as-is; `MeasurementValueField` gets a story (matches the existing button-story pattern).
- **E2E (Playwright):** keep the existing `e2e/smoke.spec.ts`; the full projects→experiment→create-measurement flow (parent §8) is added by the user once pages have layouts. This plan only ensures the harness and a passing smoke test.

## 10. Target file structure (additions to the existing scaffold)

```txt
apps/api/
  openapi.json                         # generated, committed
  src/.../export-openapi script        # writes openapi.json
apps/web/
  .env.example                         # VITE_API_URL
  kubb.config.ts                       # plugins populated
  vite.config.ts                       # + server.proxy /api -> :3000
  src/
    generated/<tag>/...                # kubb output (types, client, RQ hooks, zod)
    app/
      router.tsx                       # + feature routes
      routes/ (or features/*/pages/)   # data-wired stub per route
    features/
      measurements/
        MeasurementValueField.tsx (+ .stories, + .test)
        create-measurement-form.tsx
    lib/
      api-client config (baseURL from env)   # if a custom client module is needed
    test/
      render.tsx                       # QueryClient + MemoryRouter helper
```

`features/` for domain code; `components/ui` stays shadcn primitives; `lib`/`hooks` per the existing aliases.

## 11. Explicitly user-owned (not in this plan)

- Page **layouts and visual design** (the user builds page by page).
- TanStack Table wiring and styling for list pages.
- Final styling of `MeasurementValueField` and the create-measurement form.
- The full Playwright happy-path E2E (added once pages have UI).

## 12. Out of scope

Auth, dashboards, search, export, pagination beyond what the API returns, and everything in parent §17. No new runtime dependencies beyond what the scaffold already declares (transport is native fetch).

## 13. Assumptions & open questions

- **Assumptions:** API reachable at `:3000` in dev; `apps/api/openapi.json` is the codegen contract and is regenerated whenever the API changes; generated code is committed; grouping the generated output by OpenAPI tag matches the API's per-route tags.
- **Open questions:** (1) Should `src/generated/` be git-ignored and produced in CI instead of committed? (committed for now, so the app builds without codegen). (2) Production serving/CORS strategy when the Vite proxy isn't present (deferred — dev proxy only for this plan).
