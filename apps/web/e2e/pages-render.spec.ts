import { expect, test } from "@playwright/test";

// Smoke test: every route mounts its page component without white-screening.
// No API backend runs during e2e, so data-driven pages render their loading
// state (then an error). Asserting a stable, route-specific marker proves the
// page rendered rather than 404-ing or throwing on mount.

const HEADING_ROUTES = [
  { path: "/", heading: "Dashboard" },
  { path: "/projects", heading: "Projects" },
  { path: "/experiments", heading: "Experiments" },
  { path: "/samples", heading: "Samples" },
  { path: "/measurements", heading: "Measurements" },
  { path: "/researchers", heading: "Researchers" },
] as const;

// Detail and definition pages have no static h1 until data arrives — assert the
// loading-or-error text instead.
const CONTENT_ROUTES = [
  { path: "/projects/p1", content: /loading|failed to load project/i },
  { path: "/experiments/e1", content: /loading|failed to load experiment/i },
  { path: "/samples/s1", content: /loading|failed to load sample/i },
] as const;

test.describe("every page renders", () => {
  for (const { path, heading } of HEADING_ROUTES) {
    test(`should render the ${heading} heading at ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole("heading", { name: heading, level: 1 })).toBeVisible();
    });
  }

  for (const { path, content } of CONTENT_ROUTES) {
    test(`should render the page at ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByText(content).first()).toBeVisible();
    });
  }
});
