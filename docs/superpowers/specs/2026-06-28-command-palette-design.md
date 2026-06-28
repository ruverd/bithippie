# Command Palette — Design

Date: 2026-06-28
Scope: `apps/web`

## Goal

Add a command palette (shadcn `command` / `cmdk`) to the React SPA, opened from the
top-bar search field or via `⌘K` / `Ctrl+K`. The palette offers:

- **Create** a project, experiment, sample, measurement, or researcher — opening the
  existing create form in place.
- **Go to** any of the six menu pages.
- **Search projects** — typing filters projects; selecting one navigates to its detail page.

## Decisions

- Create actions **open the real create dialog in place** (chosen over navigate-to-page).
- In-palette search covers **projects only** (client-side filter over the cached projects list).

## Current state (relevant)

- Top-bar search is a static `<Input>` with no behaviour — `apps/web/src/components/layout/app-top-bar.tsx:57`.
- Menu pages defined in `NAV_ITEMS` — `apps/web/src/components/layout/lab-sidebar.tsx:26`:
  Dashboard `/`, Projects `/projects`, Experiments `/experiments`, Samples `/samples`,
  Measurements `/measurements`, Researchers `/researchers`.
- No `command` component installed; `cmdk` is not a dependency.
- UI primitives use `@base-ui/react` (not radix). Dialog: `apps/web/src/components/ui/dialog.tsx`.
- Create dialogs split into two shapes:
  - **Already controlled** (`{ open, onOpenChange, ... }`, no trigger — usable by the palette
    as-is): `experiment-form-dialog.tsx` (`ExperimentFormDialog`), `sample-form-dialog.tsx`
    (`SampleFormDialog`), `researcher-form-dialog.tsx` (`ResearcherFormDialog`).
  - **Trigger-based** (need a controlled mode added):
    - `features/projects/project-form-dialog.tsx` — `ProjectFormDialog({ trigger, projectId?, initial? })`,
      opens via its own `trigger` + internal `useState`.
    - `features/measurements/create-measurement-dialog.tsx` — `CreateMeasurementDialog()`,
      self-contained, renders its own button, has an experiment picker inside.
- Projects list is fetched (and react-query cached) via `useGetProjects()`; the projects page
  already filters client-side — `apps/web/src/app/routes/projects.tsx:87`.

## Architecture

### 1. `command` UI component — `src/components/ui/command.tsx` (new)

- Add dependency: `cmdk`.
- Adapt shadcn's `command` to this project's base-ui Dialog. The default shadcn `command`
  wraps `CommandDialog` with a radix Dialog; here `CommandDialog` wraps the existing
  `@/components/ui/dialog` (`Dialog` + `DialogContent`) so focus management and styling stay
  consistent with the rest of the app and no radix dependency is introduced.
- Exports: `Command`, `CommandDialog`, `CommandInput`, `CommandList`, `CommandEmpty`,
  `CommandGroup`, `CommandItem`, `CommandSeparator`, `CommandShortcut`.
- Styling uses semantic Tailwind tokens (`bg-popover`, `text-muted-foreground`, etc.).

### 2. Palette state + shortcut — `src/components/command-palette/command-palette-context.tsx` (new)

- `CommandPaletteProvider`: holds `open: boolean` and `setOpen`. Registers a global `keydown`
  listener for `(e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k"`, calls
  `e.preventDefault()` and toggles `open`.
- `useCommandPalette()` hook returns `{ open, setOpen }`. Throws if used outside the provider.

### 3. Palette UI — `src/components/command-palette/command-palette.tsx` (new)

Consumes `useCommandPalette()`. Renders `<CommandDialog open onOpenChange>` with `CommandInput`
and three groups:

- **Create** — five `CommandItem`s (Project, Experiment, Sample, Measurement, Researcher).
  On select: close palette, set local `createTarget`.
- **Go to** — six `CommandItem`s from the same nav list as the sidebar. On select:
  `navigate(to)` then close. (Nav list extracted to a shared module — see §6.)
- **Projects** — `useGetProjects()`; render each project as a `CommandItem` with `value` set to
  its title (so cmdk's built-in filter matches as the user types). On select:
  `navigate(\`/projects/${id}\`)` then close.
- `CommandEmpty` renders "No results."

Local state: `createTarget: null | "project" | "experiment" | "sample" | "measurement" | "researcher"`.
Renders the five create dialogs in controlled mode (see §4), each open when it is the
`createTarget`, `onOpenChange(false)` clears it.

Create select sequence (avoid stacked base-ui Dialog focus-trap clash): set `open(false)` to
close the palette, then set `createTarget` on the next tick (`queueMicrotask` or
`setTimeout(…, 0)`).

### 4. Create-in-place: controlled mode (2 existing files, modified)

`ExperimentFormDialog`, `SampleFormDialog`, and `ResearcherFormDialog` are **already**
controlled (`{ open, onOpenChange }`, no trigger) — the palette renders them directly, no edit.

Only the two trigger-based dialogs gain an **optional controlled mode**, staying backward
compatible:

- `ProjectFormDialog`: add optional `open?: boolean` and `onOpenChange?: (open: boolean) => void`.
  Make `trigger` optional; render `<DialogTrigger>` only when a `trigger` is given. Open resolves
  to controlled when `open !== undefined`, else the existing internal `useState`. Existing call
  sites (pass `trigger`, no `open`) are unchanged.
- `CreateMeasurementDialog`: add the same optional `open`/`onOpenChange`; when controlled it omits
  its built-in button. Its existing usage (own button) is preserved when uncontrolled.

### 5. Top-bar search → palette trigger — `app-top-bar.tsx` (modified)

Replace the static `<Input>` (lines 57–63) with a `<button>` styled to match the field:
Search icon, "Search…" text, and a `⌘K` `<kbd>` on the right. `onClick` calls `setOpen(true)`
from `useCommandPalette()`. The kbd label is platform-aware (⌘ on Mac, Ctrl elsewhere) via a
simple `navigator.platform`/`userAgent` check. Same `w-[280px]` footprint, semantic tokens.

### 6. Wiring — `layout.tsx` (modified)

- Wrap the layout content with `<CommandPaletteProvider>`.
- Render `<CommandPalette/>` once inside the provider.
- Extract the six nav entries to a shared module (e.g. `src/components/layout/nav-items.ts`)
  consumed by both `lab-sidebar.tsx` and the palette, so the "Go to" group never drifts from
  the sidebar. (Icons + label + `to` + `end`.)

## Data flow

```
⌘K / click search ──▶ CommandPaletteProvider.setOpen(true)
        │
        ▼
   CommandPalette (CommandDialog)
        ├─ Create item ─▶ setOpen(false) ─▶ next tick ─▶ createTarget = X ─▶ <XFormDialog open/>
        ├─ Go to item  ─▶ navigate(to) ─▶ setOpen(false)
        └─ Project item ▶ navigate(/projects/:id) ─▶ setOpen(false)
```

## Error / edge handling

- Empty or non-matching query → `CommandEmpty` ("No results.").
- Projects still loading → no project items (palette still usable for create/navigate).
- `Esc` closes (cmdk/Dialog default). `⌘K` toggles; `preventDefault` stops browser default.
- Two stacked dialogs avoided by close-then-open-next-tick on create.

## Testing — `command-palette.test.tsx` (new), using `src/test/render.tsx`

- `⌘K` opens the palette; pressing again / `Esc` closes.
- Clicking the top-bar search button opens the palette.
- Selecting a **Create** item closes the palette and opens the matching create dialog.
- Selecting a **Go to** item navigates to the right route.
- Typing a project title filters the Projects group; selecting navigates to `/projects/:id`.

Mock `useGetProjects()` for deterministic project results.

## Files

New:
- `apps/web/src/components/ui/command.tsx`
- `apps/web/src/components/command-palette/command-palette-context.tsx`
- `apps/web/src/components/command-palette/command-palette.tsx`
- `apps/web/src/components/layout/nav-items.ts`
- `apps/web/src/components/command-palette/command-palette.test.tsx`

Modified:
- `apps/web/src/components/layout/app-top-bar.tsx`
- `apps/web/src/app/layout.tsx`
- `apps/web/src/components/layout/lab-sidebar.tsx` (consume shared nav list)
- `apps/web/src/features/projects/project-form-dialog.tsx` (add controlled mode)
- `apps/web/src/features/measurements/create-measurement-dialog.tsx` (add controlled mode)

Dependency: add `cmdk` to `apps/web`.

## Out of scope (YAGNI)

- Server-side search; searching entities other than projects.
- Recent/frequent items, fuzzy ranking beyond cmdk defaults.
- Persisted palette history.
