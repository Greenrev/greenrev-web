import { test, expect } from "@playwright/test";

test("email/password login redirects after mocked API success", async ({ page }) => {
  await page.route("**/api/v1/auth/login", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          user: {
            id: "u1",
            email: "test@example.com",
            role: "customer",
            name: "Test",
            isEmailVerified: true,
          },
          csrfToken: "csrf",
        },
      }),
    });
  });

  await page.goto("/login");
  await page.getByPlaceholder("Email Address").fill("test@example.com");
  await page.getByPlaceholder("Password").fill("StrongPassw0rd!");
  await page.getByRole("button", { name: "Enter Portal" }).click();

  await expect(page).toHaveURL(/\/shop/);
});

test("google sign-in link is present", async ({ page }) => {
  await page.goto("/login");
  const link = page.getByRole("link", { name: "Continue with Google" });
  await expect(link).toHaveAttribute("href", /\/api\/v1\/auth\/google/);
});

test("oauth callback redirects to returnTo after mocked /me", async ({ page }) => {
  await page.route("**/api/v1/auth/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          user: {
            id: "u1",
            email: "test@example.com",
            role: "customer",
            name: "Test",
            isEmailVerified: true,
          },
        },
      }),
    });
  });

  await page.goto("/oauth/callback?returnTo=%2Fshop");
  await expect(page).toHaveURL(/\/shop/);
});

