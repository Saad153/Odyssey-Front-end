const { test, expect } = require('@playwright/test');
const { loginAs } = require('./helpers/login');

// Covers the most recently-built, security-sensitive feature: the Parties
// (Clients / Vendors / Non-GL Parties) screens are restricted to CEO/CFO/
// admin designations only, mirroring the pre-existing Employees pattern -
// gated at the sidebar (hidden), the page (SSR redirect), and the backend
// (403), for both privileged and non-privileged users.

test.describe('Party access control - non-privileged employee', () => {
  test('the "Parties" sidebar item is not shown', async ({ page }) => {
    await loginAs(page, 'employee');
    await page.getByRole('menuitem', { name: /Setup/i }).click();
    await expect(page.getByRole('menuitem', { name: /^Parties/i })).toHaveCount(0);
  });

  test('direct navigation to /setup/clientList redirects to the dashboard', async ({ page }) => {
    await loginAs(page, 'employee');
    await page.goto('/setup/clientList');
    await expect(page).toHaveURL(/\/dashboard\/home$/);
  });

  test('direct navigation to an existing client edit page also redirects (not just "new")', async ({ page }) => {
    await loginAs(page, 'employee');
    await page.goto('/setup/client/1');
    await expect(page).toHaveURL(/\/dashboard\/home$/);
  });

  test('direct navigation to /setup/nonGlPartiesList redirects to the dashboard', async ({ page }) => {
    await loginAs(page, 'employee');
    await page.goto('/setup/nonGlPartiesList');
    await expect(page).toHaveURL(/\/dashboard\/home$/);
  });
});

test.describe('Party access control - privileged admin', () => {
  test('the "Parties" sidebar item is visible and clicking it opens the Parties view', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.getByRole('menuitem', { name: /Setup/i }).click();
    const partiesMenuItem = page.getByRole('menuitem', { name: /^Parties/i });
    await expect(partiesMenuItem).toBeVisible();
    await partiesMenuItem.click();
    // Sidebar clicks open an in-app tab rather than always changing the
    // browser URL, so assert the Parties view actually rendered rather than
    // an exact URL - the direct-navigation tests below cover the real
    // page-level (SSR redirect) access control precisely.
    await expect(page.getByRole('main')).toContainText(/parties/i);
  });

  test('can load /setup/clientList directly without being redirected away', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/setup/clientList');
    await expect(page).toHaveURL(/\/setup\/clientList$/);
  });
});
