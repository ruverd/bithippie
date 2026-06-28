import { expect, test } from "@playwright/test";

// Phone viewport — below the 768px sidebar breakpoint, so the sidebar collapses
// into an off-canvas sheet toggled from the top bar.
test.use({ viewport: { width: 390, height: 844 } });

test.describe("mobile sidebar", () => {
  test("should hide the sidebar and show the menu toggle by default", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Toggle menu" })).toBeVisible();
    await expect(page.locator('[data-slot="sidebar-menu"]')).toBeHidden();
  });

  test("should open the sidebar from the toggle and navigate", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Toggle menu" }).click();

    const menu = page.locator('[data-slot="sidebar-menu"]');
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("link", { name: "Experiments", exact: true })).toBeVisible();

    await menu.getByRole("link", { name: "Experiments", exact: true }).click();
    await expect(page).toHaveURL(/\/experiments$/);
    await expect(page.getByRole("heading", { name: "Experiments", level: 1 })).toBeVisible();
  });
});
