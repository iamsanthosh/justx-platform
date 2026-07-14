import { test, expect } from "@playwright/test";

// Assumes the database has been seeded (npm run seed) with the default
// admin credentials, or SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD overrides.
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@justxsystems.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "ChangeMe!12345";

test.describe("Admin authentication", () => {
  test("unauthenticated visitors are redirected to login", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("shows an error for invalid credentials", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill("nobody@example.com");
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
  });

  test("logs in successfully and reaches the dashboard", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(ADMIN_EMAIL);
    await page.getByLabel("Password").fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/admin\/dashboard/);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("can navigate to Pages and see the seeded Home page", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(ADMIN_EMAIL);
    await page.getByLabel("Password").fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);

    await page.getByRole("link", { name: "Pages" }).click();
    await expect(page.getByText("Home")).toBeVisible();
  });

  test("logging out returns to the login page and blocks admin access", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(ADMIN_EMAIL);
    await page.getByLabel("Password").fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);

    await page.getByRole("button", { name: /sign out/i }).click();
    await expect(page).toHaveURL(/\/admin\/login/);

    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
