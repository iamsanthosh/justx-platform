import { test, expect } from "@playwright/test";

test.describe("Public site", () => {
  test("homepage renders the hero and primary nav", async ({ page }) => {
    await page.goto("/");

    // Hero headline from the seeded home page content.
    await expect(
      page.getByRole("heading", { level: 1 })
    ).toContainText(/intelligent digital business/i);

    // Primary nav (seeded via the "primary-nav" menu).
    await expect(page.getByRole("link", { name: "Services" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Contact" }).first()).toBeVisible();
  });

  test("contact form shows validation errors for empty required fields", async ({ page }) => {
    await page.goto("/#contact");
    await page.getByRole("button", { name: /send message/i }).click();

    // react-hook-form + zodResolver render inline error text on invalid submit.
    await expect(page.getByText(/name is required/i)).toBeVisible();
  });

  test("a non-existent page returns the custom 404", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByText("404")).toBeVisible();
  });

  test("robots.txt and sitemap.xml are served", async ({ page }) => {
    const robots = await page.request.get("/robots.txt");
    expect(robots.ok()).toBe(true);

    const sitemap = await page.request.get("/sitemap.xml");
    expect(sitemap.ok()).toBe(true);
  });
});
