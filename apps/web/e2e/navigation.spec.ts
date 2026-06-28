import { expect, test } from "@playwright/test";

const PAGES = [
  { link: "Projects", path: "/projects", heading: "Projects" },
  { link: "Experiments", path: "/experiments", heading: "Experiments" },
  { link: "Samples", path: "/samples", heading: "Samples" },
  { link: "Measurements", path: "/measurements", heading: "Measurements" },
  { link: "Researchers", path: "/researchers", heading: "Researchers" },
] as const;

// Sidebar nav link, scoped to the sidebar menu so it never collides with
// in-page links of the same text.
function navLink(page: import("@playwright/test").Page, name: string) {
  return page.locator('[data-slot="sidebar-menu"]').getByRole("link", { name, exact: true });
}

test.describe("main navigation (desktop)", () => {
  test("should load the dashboard on the home route", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Dashboard", level: 1 })).toBeVisible();
  });

  test("should navigate to each main screen from the sidebar", async ({ page }) => {
    await page.goto("/");

    for (const { link, path, heading } of PAGES) {
      await navLink(page, link).click();
      await expect(page).toHaveURL(new RegExp(`${path}$`));
      await expect(page.getByRole("heading", { name: heading, level: 1 })).toBeVisible();
    }

    await navLink(page, "Dashboard").click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { name: "Dashboard", level: 1 })).toBeVisible();
  });
});
