const { test, expect } = require('@playwright/test');
const { loginAs } = require('./helpers/login');
const { FIXTURES, SLOW, pickFromAntdSelect, selectUnderLabel, expectNotification, dismissNotifications } = require('./helpers/job');

// The full operational money path, driven entirely through the real UI:
//   job -> charge -> invoice -> unapprove -> amend -> re-approve -> ledger
// It runs as one test rather than several because each step consumes the
// entity the previous one produced; splitting it would mean either
// re-driving the whole prefix per test or seeding state through the API,
// which would stop exercising the thing being tested.
//
// Requires the fixtures from Odyssey-Backend-Server/tests/e2e/seedE2eUsers.js
// (run it against odyssey-test first). Each run creates a new job/invoice
// rather than reusing one, so ledger balances accumulate across runs - every
// assertion below is scoped to THIS run's own invoice number for that reason.
test('job lifecycle: create, charge, invoice, unapprove, amend, re-approve, ledger', async ({ page }) => {
  test.setTimeout(240000);
  await loginAs(page, 'admin');

  // ---------- create the job ----------
  await page.goto('/seaJobs/export/new');
  await expect(page.getByRole('button', { name: 'Save Job' })).toBeVisible(SLOW);
  await pickFromAntdSelect(page, selectUnderLabel(page, 'Client *'), FIXTURES.client);
  await pickFromAntdSelect(page, selectUnderLabel(page, 'Shipper *'), FIXTURES.client);
  await pickFromAntdSelect(page, selectUnderLabel(page, 'Commodity *'), FIXTURES.commodity);
  await page.getByRole('button', { name: 'Save Job' }).click();
  await expectNotification(page, 'Job Created');
  await page.waitForURL((url) => /\/seaJobs\/export\/\d+$/.test(url.pathname), SLOW);
  await dismissNotifications(page);

  // ---------- edit the job ----------
  // Customer Ref# is a plain text field with no dependent side effects,
  // unlike the party/vessel/commodity selects.
  const customerRef = `E2E-REF-${Date.now()}`;
  const refInput = page.getByText('Customer Ref#', { exact: true }).locator('xpath=following-sibling::input[1]');
  await refInput.fill(customerRef);
  await page.getByRole('button', { name: 'Save Job' }).click();
  await expectNotification(page, 'Job Updated');
  await dismissNotifications(page);
  await page.reload();
  await expect(refInput).toHaveValue(customerRef, SLOW);

  // ---------- add a charge ----------
  await page.getByRole('tab', { name: 'Charges' }).click();
  await expect(page.getByText('Add +')).toBeVisible(SLOW);
  await page.getByText('Add +').click();

  const chargeRow = page.locator('table tbody tr').first();
  await pickFromAntdSelect(page, chargeRow.locator('td').nth(3).locator('.ant-select'), FIXTURES.chargeOption);
  // The seeded charge has defaultRecivableParty 'Client', so picking it
  // should auto-resolve the party to the job's own Client.
  await expect(chargeRow).toContainText(FIXTURES.client, SLOW);

  // Every response wait below is registered BEFORE the click that triggers
  // it - these handlers fire immediately and a wait registered afterwards
  // can miss the response entirely.
  const saved = page.waitForResponse((r) => r.url().includes('/invoice/saveHeadesNew'), SLOW);
  await page.getByText('Save Charges').click();
  await saved;

  // ---------- edit that charge ----------
  const amountInput = chargeRow.locator('td').nth(12).locator('input');
  await amountInput.fill('250');
  await amountInput.blur();
  await expect(chargeRow.locator('td').nth(16)).toContainText('250.00', SLOW);
  const savedEdit = page.waitForResponse((r) => r.url().includes('/invoice/saveHeadesNew'), SLOW);
  await page.getByText('Save Charges').click();
  await savedEdit;
  await page.reload();
  await page.getByRole('tab', { name: 'Charges' }).click();
  await expect(page.locator('table tbody tr').first().locator('td').nth(16)).toContainText('250.00', SLOW);

  // ---------- approve the job, then the charge ----------
  // The charge-level Approve/Unapprove control only renders once the job
  // itself is approved, and Auto Invoice stays inert until every checked
  // charge has status '1'.
  await page.getByRole('tab', { name: 'Booking Info' }).click();
  await page.getByRole('button', { name: 'Approve', exact: true }).click();
  await page.getByRole('button', { name: 'OK' }).click();
  await expectNotification(page, 'Job Updated');
  await dismissNotifications(page);

  await page.getByRole('tab', { name: 'Charges' }).click();
  // Two checkboxes per row (select-for-action and tax_apply) - target the
  // select one by its react-hook-form field name.
  const rowCheckbox = page.locator('input[name="chargeList.0.check"]');
  await rowCheckbox.check();
  const approvedHeads = page.waitForResponse((r) => r.url().includes('/invoice/approveHeads'), SLOW);
  await page.getByText('Approve/Unapprove').click();
  await approvedHeads;
  await expect(page.locator('table tbody tr').first()).toContainText('Approved', SLOW);

  // ---------- generate the invoice ----------
  await rowCheckbox.check();
  const invoiced = page.waitForResponse((r) => r.url().includes('/invoice/makeInvoiceNew'), SLOW);
  const autoApproved = page.waitForResponse((r) => /\/invoice\/approve(\?|$)/.test(r.url()), SLOW);
  await page.getByText('Auto Invoice').click();
  await invoiced;
  await autoApproved; // Auto Invoice approves on creation

  // makeInvoice() doesn't await that approve call and refetches on a fixed
  // delay, so the in-place table can still show pre-invoice state.
  await page.reload();
  await page.getByRole('tab', { name: 'Charges' }).click();
  // Scope to the "Bill/Invoice" column - the Party column renders a tag too.
  const invoiceTag = page.locator('table tbody tr').first().locator('td').nth(2).locator('.ant-tag');
  await expect(invoiceTag).toBeVisible(SLOW);
  const invoiceNo = (await invoiceTag.innerText()).trim();
  expect(invoiceNo).toMatch(/^\w+-JI-\d+\//);

  // ---------- unapprove the invoice ----------
  await invoiceTag.click();
  await expect(page.getByText('Invoice No#:')).toBeVisible(SLOW);
  const approvedCheckbox = page.locator('.inv-label', { hasText: 'Approved:' }).locator('xpath=following-sibling::span[1]//input');
  await expect(approvedCheckbox).toBeChecked();

  const unapproved = page.waitForResponse((r) => r.url().includes('/invoice/unApprove'), SLOW);
  await approvedCheckbox.click();
  await unapproved;

  // ---------- add a charge to the unapproved invoice ----------
  // "+Charge" reads `approved` from the cached react-query result while the
  // checkbox above only flips local state, so it stays disabled until the
  // query refetches - reload to pick up the unapproved invoice.
  await page.reload();
  await page.getByRole('tab', { name: 'Charges' }).click();
  await page.locator('table tbody tr').first().locator('td').nth(2).locator('.ant-tag').click();
  await expect(page.getByText('Invoice No#:')).toBeVisible(SLOW);

  await page.getByRole('button', { name: 'Charge' }).click();
  // Scope to the modal - the Charges tab behind it has its own Add +/Save.
  const invoiceEditor = page.getByRole('dialog');
  await invoiceEditor.getByText('Add +').click();
  const invSaved = page.waitForResponse((r) => r.url().includes('/invoice/saveHeadesNew'), SLOW);
  await invoiceEditor.getByText('Save', { exact: true }).click();
  await invSaved;
  await expectNotification(page, 'Sample Charge Added in Invoice');
  await dismissNotifications(page);

  // ---------- edit a charge within that invoice ----------
  // Charge cells are editable again now the invoice is unapproved; while it
  // was approved they were disabled.
  await page.reload();
  await page.getByRole('tab', { name: 'Charges' }).click();
  const editAmount = page.locator('table tbody tr').first().locator('td').nth(12).locator('input');
  await expect(editAmount).toBeEnabled(SLOW);
  await editAmount.fill('400');
  await editAmount.blur();
  const reSaved = page.waitForResponse((r) => r.url().includes('/invoice/saveHeadesNew'), SLOW);
  await page.getByText('Save Charges').click();
  await reSaved;

  // ---------- re-approve the invoice ----------
  // unApprove deleted the original voucher; approving rebuilds it, so this
  // is what the ledger assertion below is actually verifying.
  await page.reload();
  await page.getByRole('tab', { name: 'Charges' }).click();
  await page.locator('table tbody tr').first().locator('td').nth(2).locator('.ant-tag').click();
  await expect(page.getByText('Invoice No#:')).toBeVisible(SLOW);
  const reApproved = page.waitForResponse((r) => /\/invoice\/approve(\?|$)/.test(r.url()), SLOW);
  await page.locator('.inv-label', { hasText: 'Approved:' }).locator('xpath=following-sibling::span[1]//input').click();
  await reApproved;

  // Read back the invoice's own local-currency total and job number to
  // assert against, rather than hardcoding figures the app computed.
  await page.reload();
  await page.getByRole('tab', { name: 'Charges' }).click();
  await page.locator('table tbody tr').first().locator('td').nth(2).locator('.ant-tag').click();
  await expect(page.getByText('Invoice No#:')).toBeVisible(SLOW);
  const invoiceTotal = (
    await page.locator('.inv-label', { hasText: 'Total Amount (Local)' }).locator('xpath=following-sibling::span[1]').innerText()
  ).trim();
  const jobNo = (
    await page.locator('.inv-label', { hasText: 'Job#:' }).locator('xpath=following-sibling::span[1]').innerText()
  ).trim();
  expect(invoiceTotal).toMatch(/\d/);

  // ---------- verify the ledger ----------
  // Approving posts a double entry against the party's Child_Account with a
  // narration naming both the invoice and the job (routes/invoice /approve).
  // The filter page already defaults to company 1 / PKR / a range ending
  // today, so only the account needs choosing.
  await page.goto('/reports/ledger');
  // Scope to <main>: sidebar/header have their own Selects, and the date
  // fields are .ant-picker, so the first .ant-select here is Accounts.
  await pickFromAntdSelect(page, page.getByRole('main').locator('.ant-select').first(), FIXTURES.client);
  await page.getByRole('button', { name: 'Go' }).click();
  await page.waitForURL((url) => url.pathname.startsWith('/reports/ledgerReport/'), SLOW);

  const ledgerRow = page.locator('table tr', { hasText: invoiceNo }).first();
  await expect(ledgerRow).toBeVisible(SLOW);
  // A receivable invoice debits the party account for the invoice total,
  // and the narration ties the entry back to this job and invoice.
  await expect(ledgerRow).toContainText('Recievable Against Invoice');
  await expect(ledgerRow).toContainText(jobNo);
  await expect(ledgerRow).toContainText(FIXTURES.client);
  await expect(ledgerRow).toContainText(invoiceTotal);
});
