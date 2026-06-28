# Command Palette Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `⌘K` / click-to-open command palette to the web app for creating entities, navigating menu pages, and searching projects.

**Architecture:** A `cmdk`-based `command` UI primitive wraps the existing base-ui `Dialog`. A small React context owns palette open-state and the global `⌘K` listener. A `CommandPalette` component renders Create / Go-to / Projects groups; create items open the existing form dialogs in controlled mode. The top-bar search field becomes the palette trigger.

**Tech Stack:** React 19, TypeScript (strict, `noUncheckedIndexedAccess`), `@base-ui/react`, `cmdk`, React Router v7, TanStack Query, Vitest + Testing Library, Tailwind v4.

## Global Constraints

- UI primitives use `@base-ui/react` — **not** radix. `CommandDialog` must wrap `@/components/ui/dialog`.
- Use semantic Tailwind tokens (`bg-popover`, `text-muted-foreground`, `border-input`) — not raw colors.
- TypeScript strict + `noUncheckedIndexedAccess`. Imports at top of file. No code comments unless strictly necessary.
- Use shadcn components before custom markup. Path alias `@/` → `apps/web/src/`.
- All commands run from `apps/web/`.
- Single-file test runner: `bunx vitest run --project unit <path>`. Full unit suite: `bun run test:unit`.
- **Commits:** project rule is "commit only when explicitly asked". Treat each `git commit` step as a checkpoint — run it when the user approves committing.

---

### Task 1: `command` UI primitive (cmdk + base-ui Dialog)

**Files:**
- Modify: `apps/web/package.json` (add `cmdk` dependency)
- Create: `apps/web/src/components/ui/command.tsx`
- Test: `apps/web/src/components/ui/command.test.tsx`

**Interfaces:**
- Consumes: `@/components/ui/dialog` (`Dialog`, `DialogContent`, `DialogDescription`, `DialogHeader`, `DialogTitle`), `@/lib/utils` (`cn`).
- Produces: `Command`, `CommandDialog`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem`, `CommandSeparator`, `CommandShortcut`. `CommandDialog` props = `React.ComponentProps<typeof Dialog> & { title?: string; description?: string; className?: string; showCloseButton?: boolean }`.

- [ ] **Step 1: Add the dependency**

Run: `cd apps/web && bun add cmdk`
Expected: `cmdk` appears under `dependencies` in `apps/web/package.json`; lockfile updated.

- [ ] **Step 2: Write the failing test**

Create `apps/web/src/components/ui/command.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Command,
  CommandDialog,
  CommandItem,
  CommandList,
} from "./command";

describe("Command", () => {
  it("renders items in a list", () => {
    render(
      <Command>
        <CommandList>
          <CommandItem>Ping</CommandItem>
        </CommandList>
      </Command>,
    );
    expect(screen.getByText("Ping")).toBeInTheDocument();
  });

  it("renders children when the dialog is open", () => {
    render(
      <CommandDialog open onOpenChange={() => {}}>
        <CommandList>
          <CommandItem>Pong</CommandItem>
        </CommandList>
      </CommandDialog>,
    );
    expect(screen.getByText("Pong")).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd apps/web && bunx vitest run --project unit src/components/ui/command.test.tsx`
Expected: FAIL — cannot resolve `./command`.

- [ ] **Step 4: Implement `command.tsx`**

Create `apps/web/src/components/ui/command.tsx`:

```tsx
import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        "bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md",
        className,
      )}
      {...props}
    />
  )
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  className,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string
  description?: string
  className?: string
  showCloseButton?: boolean
}) {
  return (
    <Dialog {...props}>
      <DialogContent
        className={cn("overflow-hidden p-0", className)}
        showCloseButton={showCloseButton}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Command className="[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      data-slot="command-input-wrapper"
      cmdk-input-wrapper=""
      className="flex h-9 items-center gap-2 border-b px-3"
    >
      <SearchIcon className="size-4 shrink-0 opacity-50" />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          "placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </div>
  )
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        "max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto",
        className,
      )}
      {...props}
    />
  )
}

function CommandEmpty({
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className="py-6 text-center text-sm"
      {...props}
    />
  )
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
        className,
      )}
      {...props}
    />
  )
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("bg-border -mx-1 h-px", className)}
      {...props}
    />
  )
}

function CommandItem({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  )
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className,
      )}
      {...props}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd apps/web && bunx vitest run --project unit src/components/ui/command.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add apps/web/package.json apps/web/bun.lock apps/web/src/components/ui/command.tsx apps/web/src/components/ui/command.test.tsx
git commit -m "feat(web): add cmdk-based command UI primitive"
```

---

### Task 2: Shared nav-items module

**Files:**
- Create: `apps/web/src/components/layout/nav-items.ts`
- Modify: `apps/web/src/components/layout/lab-sidebar.tsx:1-33` (import shared list, drop local const + icon imports)
- Test: `apps/web/src/components/layout/nav-items.test.ts`

**Interfaces:**
- Produces: `interface NavItem { label: string; icon: LucideIcon; to: string; end: boolean }` and `NAV_ITEMS: NavItem[]` (6 entries: Dashboard `/`, Projects `/projects`, Experiments `/experiments`, Samples `/samples`, Measurements `/measurements`, Researchers `/researchers`).

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/components/layout/nav-items.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { NAV_ITEMS } from "./nav-items";

describe("NAV_ITEMS", () => {
  it("lists the six menu pages in order", () => {
    expect(NAV_ITEMS.map((i) => i.label)).toEqual([
      "Dashboard",
      "Projects",
      "Experiments",
      "Samples",
      "Measurements",
      "Researchers",
    ]);
  });

  it("maps labels to routes", () => {
    expect(NAV_ITEMS.map((i) => i.to)).toEqual([
      "/",
      "/projects",
      "/experiments",
      "/samples",
      "/measurements",
      "/researchers",
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/web && bunx vitest run --project unit src/components/layout/nav-items.test.ts`
Expected: FAIL — cannot resolve `./nav-items`.

- [ ] **Step 3: Create `nav-items.ts`**

Create `apps/web/src/components/layout/nav-items.ts`:

```ts
import {
  LayoutDashboard,
  FolderKanban,
  FlaskConical,
  TestTube,
  Activity,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  icon: LucideIcon;
  to: string;
  end: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/", end: true },
  { label: "Projects", icon: FolderKanban, to: "/projects", end: false },
  { label: "Experiments", icon: FlaskConical, to: "/experiments", end: false },
  { label: "Samples", icon: TestTube, to: "/samples", end: false },
  { label: "Measurements", icon: Activity, to: "/measurements", end: false },
  { label: "Researchers", icon: Users, to: "/researchers", end: false },
];
```

- [ ] **Step 4: Refactor `lab-sidebar.tsx` to consume it**

In `apps/web/src/components/layout/lab-sidebar.tsx`, replace the icon import block and local `NAV_ITEMS` const. Change the top of the file (lines 1-33) so it reads:

```tsx
import { NavLink, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import logo from "@/assets/logo.jpeg";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { NAV_ITEMS } from "@/components/layout/nav-items";

function isActivePath(pathname: string, to: string, end: boolean): boolean {
  if (end) return pathname === to;
  return pathname === to || pathname.startsWith(`${to}/`);
}
```

Leave the rest of the file (the `LabSidebar` component body) unchanged — it already maps over `NAV_ITEMS`.

- [ ] **Step 5: Run tests + typecheck**

Run: `cd apps/web && bunx vitest run --project unit src/components/layout/nav-items.test.ts && bunx tsc -b`
Expected: tests PASS (2); `tsc` exits 0 (no unused-import errors in `lab-sidebar.tsx`).

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/components/layout/nav-items.ts apps/web/src/components/layout/nav-items.test.ts apps/web/src/components/layout/lab-sidebar.tsx
git commit -m "refactor(web): extract shared NAV_ITEMS for sidebar + palette"
```

---

### Task 3: Command palette context + `⌘K` shortcut

**Files:**
- Create: `apps/web/src/components/command-palette/command-palette-context.tsx`
- Test: `apps/web/src/components/command-palette/command-palette-context.test.tsx`

**Interfaces:**
- Produces: `CommandPaletteProvider` (component, prop `{ children: ReactNode }`), `useCommandPalette(): { open: boolean; setOpen: (open: boolean) => void }`. Registers a document `keydown` listener toggling `open` on `(metaKey || ctrlKey) + "k"`.

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/components/command-palette/command-palette-context.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { CommandPaletteProvider, useCommandPalette } from "./command-palette-context";

function Probe() {
  const { open, setOpen } = useCommandPalette();
  return (
    <div>
      <span data-testid="state">{open ? "open" : "closed"}</span>
      <button onClick={() => setOpen(true)}>force-open</button>
    </div>
  );
}

describe("CommandPaletteProvider", () => {
  it("starts closed and toggles on Cmd+K", () => {
    render(
      <CommandPaletteProvider>
        <Probe />
      </CommandPaletteProvider>,
    );
    expect(screen.getByTestId("state")).toHaveTextContent("closed");

    fireEvent.keyDown(document, { key: "k", metaKey: true });
    expect(screen.getByTestId("state")).toHaveTextContent("open");

    fireEvent.keyDown(document, { key: "k", metaKey: true });
    expect(screen.getByTestId("state")).toHaveTextContent("closed");
  });

  it("opens via setOpen and on Ctrl+K", () => {
    render(
      <CommandPaletteProvider>
        <Probe />
      </CommandPaletteProvider>,
    );
    fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    expect(screen.getByTestId("state")).toHaveTextContent("open");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/web && bunx vitest run --project unit src/components/command-palette/command-palette-context.test.tsx`
Expected: FAIL — cannot resolve `./command-palette-context`.

- [ ] **Step 3: Implement the context**

Create `apps/web/src/components/command-palette/command-palette-context.tsx`:

```tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface CommandPaletteContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null);

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <CommandPaletteContext.Provider value={{ open, setOpen }}>
      {children}
    </CommandPaletteContext.Provider>
  );
}

export function useCommandPalette(): CommandPaletteContextValue {
  const ctx = useContext(CommandPaletteContext);
  if (!ctx) {
    throw new Error("useCommandPalette must be used within CommandPaletteProvider");
  }
  return ctx;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/web && bunx vitest run --project unit src/components/command-palette/command-palette-context.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/command-palette/command-palette-context.tsx apps/web/src/components/command-palette/command-palette-context.test.tsx
git commit -m "feat(web): add command palette context with Cmd+K shortcut"
```

---

### Task 4: Controlled mode for Project + Measurement create dialogs

**Files:**
- Modify: `apps/web/src/features/projects/project-form-dialog.tsx:53-119`
- Modify: `apps/web/src/features/measurements/create-measurement-dialog.tsx:43-96`
- Test: `apps/web/src/features/projects/project-form-dialog.controlled.test.tsx`

**Interfaces:**
- Produces:
  - `ProjectFormDialog` props become `{ trigger?: ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void; projectId?: string; initial?: Partial<Values> }`. When `open` is provided it is controlled and `trigger` is omitted.
  - `CreateMeasurementDialog` props become `{ open?: boolean; onOpenChange?: (open: boolean) => void }` (still callable with no args). When `open` is provided the built-in trigger button is omitted.
- Note: `ExperimentFormDialog`, `SampleFormDialog`, `ResearcherFormDialog` are already controlled (`{ open, onOpenChange, ... }`) — no changes.

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/features/projects/project-form-dialog.controlled.test.tsx`:

```tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProjectFormDialog } from "./project-form-dialog";

vi.mock("@/generated/hooks/researchers/useGetResearchers", () => ({
  useGetResearchers: () => ({ data: [] }),
}));

function wrap(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe("ProjectFormDialog (controlled)", () => {
  it("shows the create form when open is true and no trigger is given", () => {
    wrap(<ProjectFormDialog open onOpenChange={() => {}} />);
    expect(
      screen.getByText("Create a new research project and assign a lead."),
    ).toBeInTheDocument();
  });

  it("stays closed when open is false", () => {
    wrap(<ProjectFormDialog open={false} onOpenChange={() => {}} />);
    expect(
      screen.queryByText("Create a new research project and assign a lead."),
    ).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/web && bunx vitest run --project unit src/features/projects/project-form-dialog.controlled.test.tsx`
Expected: FAIL — `open`/`onOpenChange` not accepted, or `trigger` required (type error / runtime error rendering missing trigger).

- [ ] **Step 3: Add controlled mode to `ProjectFormDialog`**

In `apps/web/src/features/projects/project-form-dialog.tsx`, change the props interface and the open-state setup. Replace:

```tsx
export interface ProjectFormDialogProps {
  trigger: ReactNode;
  projectId?: string;
  initial?: Partial<Values>;
}

export function ProjectFormDialog({ trigger, projectId, initial }: ProjectFormDialogProps) {
  const isEdit = Boolean(projectId);
  const [open, setOpen] = useState(false);
```

with:

```tsx
export interface ProjectFormDialogProps {
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  projectId?: string;
  initial?: Partial<Values>;
}

export function ProjectFormDialog({
  trigger,
  open: openProp,
  onOpenChange,
  projectId,
  initial,
}: ProjectFormDialogProps) {
  const isEdit = Boolean(projectId);
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = (next: boolean) => {
    if (openProp === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };
```

Then make the trigger conditional. Replace:

```tsx
      <DialogTrigger render={trigger as React.ReactElement} />
```

with:

```tsx
      {trigger && <DialogTrigger render={trigger as React.ReactElement} />}
```

- [ ] **Step 4: Add controlled mode to `CreateMeasurementDialog`**

In `apps/web/src/features/measurements/create-measurement-dialog.tsx`, replace:

```tsx
export function CreateMeasurementDialog() {
  const [open, setOpen] = useState(false);
```

with:

```tsx
export interface CreateMeasurementDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateMeasurementDialog({
  open: openProp,
  onOpenChange,
}: CreateMeasurementDialogProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = (next: boolean) => {
    if (openProp === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };
```

Then make the built-in trigger conditional. Replace:

```tsx
      <DialogTrigger
        render={
          <Button>
            <Plus size={16} />
            New Measurement
          </Button>
        }
      />
```

with:

```tsx
      {openProp === undefined && (
        <DialogTrigger
          render={
            <Button>
              <Plus size={16} />
              New Measurement
            </Button>
          }
        />
      )}
```

- [ ] **Step 5: Run test + typecheck to verify they pass**

Run: `cd apps/web && bunx vitest run --project unit src/features/projects/project-form-dialog.controlled.test.tsx && bunx tsc -b`
Expected: tests PASS (2); `tsc` exits 0. Existing call sites in `projects.tsx`, `project-detail.tsx`, and `measurements.tsx` (which pass `trigger` / no props) still typecheck because `trigger` and `open` are optional.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/features/projects/project-form-dialog.tsx apps/web/src/features/measurements/create-measurement-dialog.tsx apps/web/src/features/projects/project-form-dialog.controlled.test.tsx
git commit -m "feat(web): add controlled mode to project + measurement create dialogs"
```

---

### Task 5: `CommandPalette` component (Create / Go-to / Projects)

**Files:**
- Create: `apps/web/src/components/command-palette/command-palette.tsx`
- Test: `apps/web/src/components/command-palette/command-palette.test.tsx`

**Interfaces:**
- Consumes: `command.tsx` exports (Task 1), `NAV_ITEMS` (Task 2), `useCommandPalette` (Task 3), controlled `ProjectFormDialog` + `CreateMeasurementDialog` (Task 4), already-controlled `ExperimentFormDialog`/`SampleFormDialog`/`ResearcherFormDialog`, `useGetProjects`.
- Produces: `CommandPalette` (component, no props). Must be rendered inside `CommandPaletteProvider` and a Router.

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/components/command-palette/command-palette.test.tsx`:

```tsx
import { describe, expect, it, vi, beforeEach, type Mock } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, useLocation } from "react-router-dom";
import { CommandPaletteProvider } from "./command-palette-context";
import { CommandPalette } from "./command-palette";
import { useGetProjects } from "@/generated/hooks/projects/useGetProjects";

vi.mock("@/generated/hooks/projects/useGetProjects", () => ({
  useGetProjects: vi.fn(),
}));
vi.mock("@/generated/hooks/researchers/useGetResearchers", () => ({
  useGetResearchers: () => ({ data: [] }),
}));

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="loc">{location.pathname}</div>;
}

function renderPalette() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={["/"]}>
        <CommandPaletteProvider>
          <CommandPalette />
          <LocationDisplay />
        </CommandPaletteProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  (useGetProjects as Mock).mockReturnValue({
    data: [
      { id: "p1", title: "Alpha Study" },
      { id: "p2", title: "Beta Trial" },
    ],
  });
});

function openPalette() {
  fireEvent.keyDown(document, { key: "k", metaKey: true });
}

describe("CommandPalette", () => {
  it("opens on Cmd+K and shows the group items", () => {
    renderPalette();
    openPalette();
    expect(screen.getByRole("option", { name: "New Project" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Projects" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Alpha Study" })).toBeInTheDocument();
  });

  it("navigates to a menu page from the Go to group", () => {
    renderPalette();
    openPalette();
    fireEvent.click(screen.getByRole("option", { name: "Experiments" }));
    expect(screen.getByTestId("loc")).toHaveTextContent("/experiments");
  });

  it("opens the project create dialog from the Create group", async () => {
    renderPalette();
    openPalette();
    fireEvent.click(screen.getByRole("option", { name: "New Project" }));
    await waitFor(() =>
      expect(
        screen.getByText("Create a new research project and assign a lead."),
      ).toBeInTheDocument(),
    );
  });

  it("navigates to project detail when a project result is selected", () => {
    renderPalette();
    openPalette();
    fireEvent.change(screen.getByPlaceholderText("Search or jump to…"), {
      target: { value: "Alpha" },
    });
    fireEvent.click(screen.getByRole("option", { name: "Alpha Study" }));
    expect(screen.getByTestId("loc")).toHaveTextContent("/projects/p1");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/web && bunx vitest run --project unit src/components/command-palette/command-palette.test.tsx`
Expected: FAIL — cannot resolve `./command-palette`.

- [ ] **Step 3: Implement `command-palette.tsx`**

Create `apps/web/src/components/command-palette/command-palette.tsx`:

```tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FolderKanban,
  FlaskConical,
  TestTube,
  Activity,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { useCommandPalette } from "./command-palette-context";
import { useGetProjects } from "@/generated/hooks/projects/useGetProjects";
import { ProjectFormDialog } from "@/features/projects/project-form-dialog";
import { ExperimentFormDialog } from "@/features/experiments/experiment-form-dialog";
import { SampleFormDialog } from "@/features/samples/sample-form-dialog";
import { ResearcherFormDialog } from "@/features/researchers/researcher-form-dialog";
import { CreateMeasurementDialog } from "@/features/measurements/create-measurement-dialog";

type CreateTarget =
  | "project"
  | "experiment"
  | "sample"
  | "measurement"
  | "researcher";

const CREATE_ITEMS: { target: CreateTarget; label: string; icon: LucideIcon }[] = [
  { target: "project", label: "New Project", icon: FolderKanban },
  { target: "experiment", label: "New Experiment", icon: FlaskConical },
  { target: "sample", label: "New Sample", icon: TestTube },
  { target: "measurement", label: "New Measurement", icon: Activity },
  { target: "researcher", label: "New Researcher", icon: Users },
];

export function CommandPalette() {
  const { open, setOpen } = useCommandPalette();
  const navigate = useNavigate();
  const [createTarget, setCreateTarget] = useState<CreateTarget | null>(null);
  const { data: projects } = useGetProjects();

  const closeCreate = (next: boolean) => {
    if (!next) setCreateTarget(null);
  };

  const runCreate = (target: CreateTarget) => {
    setOpen(false);
    queueMicrotask(() => setCreateTarget(target));
  };

  const go = (to: string) => {
    setOpen(false);
    navigate(to);
  };

  const openProject = (id: string) => {
    setOpen(false);
    navigate(`/projects/${id}`);
  };

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen} showCloseButton={false}>
        <CommandInput placeholder="Search or jump to…" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>

          <CommandGroup heading="Create">
            {CREATE_ITEMS.map(({ target, label, icon: Icon }) => (
              <CommandItem key={target} onSelect={() => runCreate(target)}>
                <Icon />
                {label}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandGroup heading="Go to">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <CommandItem key={to} onSelect={() => go(to)}>
                <Icon />
                {label}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandGroup heading="Projects">
            {(projects ?? []).map((project) => (
              <CommandItem
                key={project.id}
                value={`${project.title} ${project.id}`}
                onSelect={() => openProject(project.id)}
              >
                <FolderKanban />
                {project.title}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {createTarget === "project" && (
        <ProjectFormDialog open onOpenChange={closeCreate} />
      )}
      {createTarget === "experiment" && (
        <ExperimentFormDialog open onOpenChange={closeCreate} />
      )}
      {createTarget === "sample" && (
        <SampleFormDialog open onOpenChange={closeCreate} />
      )}
      {createTarget === "researcher" && (
        <ResearcherFormDialog open onOpenChange={closeCreate} />
      )}
      {createTarget === "measurement" && (
        <CreateMeasurementDialog open onOpenChange={closeCreate} />
      )}
    </>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/web && bunx vitest run --project unit src/components/command-palette/command-palette.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/command-palette/command-palette.tsx apps/web/src/components/command-palette/command-palette.test.tsx
git commit -m "feat(web): add command palette with create, navigate, and project search"
```

---

### Task 6: Wire palette into the app (top-bar trigger + layout)

**Files:**
- Modify: `apps/web/src/components/layout/app-top-bar.tsx:1-66` (search field → palette trigger button)
- Modify: `apps/web/src/app/layout.tsx` (wrap in provider, render palette)
- Test: `apps/web/src/components/layout/app-top-bar.test.tsx`

**Interfaces:**
- Consumes: `useCommandPalette` (Task 3), `CommandPalette` + `CommandPaletteProvider` (Tasks 3/5).
- Produces: top-bar renders a button (accessible name contains "Search") that calls `setOpen(true)`; `Layout` mounts the provider + palette.

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/components/layout/app-top-bar.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
  CommandPaletteProvider,
  useCommandPalette,
} from "@/components/command-palette/command-palette-context";
import { AppTopBar } from "./app-top-bar";

function StateProbe() {
  const { open } = useCommandPalette();
  return <span data-testid="state">{open ? "open" : "closed"}</span>;
}

function renderTopBar() {
  return render(
    <MemoryRouter initialEntries={["/projects"]}>
      <SidebarProvider>
        <CommandPaletteProvider>
          <AppTopBar />
          <StateProbe />
        </CommandPaletteProvider>
      </SidebarProvider>
    </MemoryRouter>,
  );
}

describe("AppTopBar", () => {
  it("opens the command palette when the search button is clicked", () => {
    renderTopBar();
    expect(screen.getByTestId("state")).toHaveTextContent("closed");
    fireEvent.click(screen.getByRole("button", { name: /search/i }));
    expect(screen.getByTestId("state")).toHaveTextContent("open");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/web && bunx vitest run --project unit src/components/layout/app-top-bar.test.tsx`
Expected: FAIL — no button with an accessible name matching `/search/i` (current top bar renders an `<input>`).

- [ ] **Step 3: Replace the search field with a palette-trigger button**

Rewrite `apps/web/src/components/layout/app-top-bar.tsx` in full:

```tsx
import { useLocation } from "react-router-dom";
import { Menu, Search } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useCommandPalette } from "@/components/command-palette/command-palette-context";

function derivePageTitle(pathname: string): string {
  if (pathname === "/") return "Dashboard";
  const first = pathname.split("/").filter(Boolean)[0];
  if (!first) return "Dashboard";
  return first
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

export function AppTopBar() {
  const { pathname } = useLocation();
  const pageTitle = derivePageTitle(pathname);
  const { toggleSidebar } = useSidebar();
  const { setOpen } = useCommandPalette();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 sm:px-7">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          className="md:hidden"
          aria-label="Toggle menu"
          onClick={toggleSidebar}
        >
          <Menu />
        </Button>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="text-muted-foreground">
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search"
        className="flex h-9 w-[280px] items-center gap-2 rounded-md border border-input bg-background px-3 text-sm text-muted-foreground transition-colors hover:bg-accent/50"
      >
        <Search className="size-4 shrink-0" />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium">
          {isMac ? "⌘" : "Ctrl"} K
        </kbd>
      </button>
    </header>
  );
}
```

- [ ] **Step 4: Wire the provider + palette into `layout.tsx`**

Rewrite `apps/web/src/app/layout.tsx` in full:

```tsx
import { Outlet } from "react-router-dom";
import { LabSidebar } from "@/components/layout/lab-sidebar";
import { AppTopBar } from "@/components/layout/app-top-bar";
import { CommandPaletteProvider } from "@/components/command-palette/command-palette-context";
import { CommandPalette } from "@/components/command-palette/command-palette";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function Layout() {
  return (
    <CommandPaletteProvider>
      <SidebarProvider className="h-svh overflow-hidden bg-background text-foreground">
        <LabSidebar />
        <SidebarInset className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <AppTopBar />
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
      <CommandPalette />
    </CommandPaletteProvider>
  );
}
```

- [ ] **Step 5: Run test + full unit suite + typecheck**

Run: `cd apps/web && bunx vitest run --project unit src/components/layout/app-top-bar.test.tsx && bun run test:unit && bunx tsc -b`
Expected: top-bar test PASS (1); full unit suite green; `tsc` exits 0.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/components/layout/app-top-bar.tsx apps/web/src/app/layout.tsx apps/web/src/components/layout/app-top-bar.test.tsx
git commit -m "feat(web): wire command palette into top bar and layout"
```

---

## Manual verification (after Task 6)

Run `cd apps/web && bun run dev`, then in the browser:

1. Press `⌘K` (mac) / `Ctrl+K` — palette opens; `Esc` closes.
2. Click the top-bar "Search…" field — palette opens.
3. "Create" group → "New Project" — palette closes, project dialog opens; create works.
4. Repeat for Experiment, Sample, Measurement, Researcher.
5. "Go to" group → each entry navigates to the matching page.
6. Type a project title — Projects group filters; selecting one lands on `/projects/:id`.
7. Type gibberish — "No results." shows.

## Self-Review

- **Spec coverage:** command component (T1), context+⌘K (T3), palette groups Create/Go-to/Projects (T5), controlled dialogs (T4), already-controlled experiment/sample/researcher used directly (T5), top-bar trigger + platform kbd (T6), layout wiring + shared nav (T2/T6), tests for shortcut/create/navigate/search (T3/T5/T6). All spec sections mapped.
- **Placeholder scan:** none — every step has full code or exact commands.
- **Type consistency:** `CreateTarget` union consistent across `CREATE_ITEMS` and the create-dialog render block; `closeCreate: (next: boolean) => void` matches each dialog's `onOpenChange`; controlled-mode `setOpen: (next: boolean) => void` matches base-ui `Dialog onOpenChange`; `NavItem`/`NAV_ITEMS` names match Task 2 and consumers in Tasks 5/6.
```
