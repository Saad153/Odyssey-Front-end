const { expect } = require('@playwright/test');

// Fixture names seeded by Odyssey-Backend-Server/tests/e2e/seedE2eUsers.js.
// Matched by typing into antd Selects, which filter their (already fully
// loaded) options client-side - no async search round-trip to wait on.
const FIXTURES = {
  client: '__e2e__ Test Shipper Client',
  commodity: '__e2e__ Test Commodity',
  charge: '__e2e__ Test Freight Charge',
  // The in-row charge dropdown labels its options "(code) short" (see
  // routes/jobRoutes/sea.js getValues), NOT by charge name - so the charge
  // has to be picked by this, while the row's Particular cell then shows
  // the full `charge` name above.
  chargeOption: '(90001) E2EFRT',
};

// Job save/edit wraps its POST in a hard-coded 3s setTimeout
// (Components/Layouts/JobsLayout/Jobs/CreateOrEdit.js), and the charge
// save/approve/invoice flows each delay(500) before refetching - so every
// wait here is generous and keyed on an observable result rather than a
// fixed sleep.
const SLOW = { timeout: 30000 };

// antd Select isn't a native <select>: click to open, type to filter the
// client-side list, then click the option out of the portal-rendered
// dropdown (which is appended to <body>, not inside the form).
async function pickFromAntdSelect(page, selectLocator, searchText) {
  await selectLocator.click();
  await selectLocator.locator('input').fill(searchText);
  const option = page.locator('.ant-select-dropdown:visible .ant-select-item-option', { hasText: searchText }).first();
  await option.waitFor({ state: 'visible', timeout: 10000 });
  await option.click();
}

// The Booking Info party fields are plain labelled blocks, not <label for>
// associations - locate each Select by the label text sitting above it.
// Not always an immediate sibling: SelectSearchComp renders its own (here
// empty) label div before the Select, so party fields labelled by the
// separate PartyLabel component have a blank div in between. Walk forward
// to the first ant-select sibling instead of assuming position 1.
function selectUnderLabel(page, labelText) {
  return page
    .getByText(labelText, { exact: true })
    .first()
    .locator('xpath=following-sibling::div[contains(@class,"ant-select")][1]');
}

async function expectNotification(page, text) {
  await expect(
    page.locator('.ant-notification-notice').filter({ hasText: text }).first()
  ).toBeVisible(SLOW);
}

// Notifications stack and persist for a few seconds; dismissing them keeps
// later assertions from matching a stale toast from an earlier step.
async function dismissNotifications(page) {
  const closers = page.locator('.ant-notification-notice-close');
  for (let i = await closers.count(); i > 0; i -= 1) {
    await closers.first().click().catch(() => {});
  }
}

module.exports = { FIXTURES, SLOW, pickFromAntdSelect, selectUnderLabel, expectNotification, dismissNotifications };
