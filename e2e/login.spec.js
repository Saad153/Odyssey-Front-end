const { test, expect } = require('@playwright/test');
const { loginAs, E2E_PASSWORD } = require('./helpers/login');

test.describe('Login', () => {
  test('valid credentials log the user in and land on the dashboard', async ({ page }) => {
    await loginAs(page, 'employee');
    await expect(page).toHaveURL((url) => url.pathname === '/');
    expect(await page.evaluate(() => document.cookie)).toContain('token=');
  });

  test('wrong password shows an error and does not navigate away from /login', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('Enter your username...').fill('__e2e__employee');
    await page.getByPlaceholder('Enter your password...').fill('definitely-wrong-password');
    await page.getByRole('button', { name: /login/i }).click();

    await expect(page.getByText(/wrong username or password/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('unknown username shows an error', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('Enter your username...').fill('__e2e__does_not_exist');
    await page.getByPlaceholder('Enter your password...').fill(E2E_PASSWORD);
    await page.getByRole('button', { name: /login/i }).click();

    await expect(page.getByText(/wrong username or password/i)).toBeVisible();
  });
});
