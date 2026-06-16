import { expect, test } from "@playwright/test";

test("dashboard loads study widgets", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Your English study desk" })).toBeVisible();
  await expect(page.getByText("Today's review")).toBeVisible();
});
