const { expect } = require('@playwright/test');

// Shared helper: logs in through the real login form (not by injecting
// cookies) so every e2e test exercises the actual auth flow end-to-end.
// Credentials come from tests/e2e/seedE2eUsers.js in the backend repo -
// run that script once against the odyssey-test DB before running these.
const E2E_PASSWORD = 'E2ePass123!';

async function loginAs(page, designation) {
  const username = designation === 'admin' ? '__e2e__admin' : '__e2e__employee';
  await page.goto('/login');

  const usernameInput = page.getByPlaceholder('Enter your username...');
  const passwordInput = page.getByPlaceholder('Enter your password...');

  // These are controlled React inputs and the page hydrates after first
  // paint - a fill() that lands before hydration gets wiped by the initial
  // render, leaving the field blank. Re-fill until the value actually
  // sticks rather than racing hydration with a fixed wait.
  await expect(async () => {
    await usernameInput.fill(username);
    await passwordInput.fill(E2E_PASSWORD);
    await expect(usernameInput).toHaveValue(username, { timeout: 1000 });
    await expect(passwordInput).toHaveValue(E2E_PASSWORD, { timeout: 1000 });
  }).toPass({ timeout: 20000 });

  // The backend allows only one active session per user (functions/
  // sessionManager.js), and these tests never log out - so every login
  // after the first one for a given seeded user comes back 409 and the app
  // shows its "User Already Logged In" modal instead of navigating.
  //
  // Branch on the login response itself rather than on whether the modal
  // happens to become visible within some timeout: the modal is only ever
  // shown *because* of the 409, so the response is the authoritative signal
  // and there's no race to lose. (Matching /^login$/ keeps this from also
  // matching the modal's own "Force Login" button.)
  const loginResponsePromise = page.waitForResponse((r) => r.url().includes('/authRoutes/login'));
  await page.getByRole('button', { name: /^login$/i }).click();
  const loginResponse = await loginResponsePromise;

  if (loginResponse.status() === 409) {
    const forcedPromise = page.waitForResponse((r) => r.url().includes('/authRoutes/login'));
    await page.getByRole('button', { name: /force login/i }).click();
    const forced = await forcedPromise;
    if (!forced.ok()) {
      throw new Error(`Force login for "${username}" failed with HTTP ${forced.status()}`);
    }
  } else if (!loginResponse.ok()) {
    throw new Error(`Login for "${username}" failed with HTTP ${loginResponse.status()}`);
  }

  await page.waitForURL((url) => url.pathname === '/', { timeout: 15000 });
}

module.exports = { loginAs, E2E_PASSWORD };
