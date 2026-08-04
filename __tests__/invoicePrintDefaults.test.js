const { calculateTotal, computeRoundOff } = require('Components/Shared/invoicePrintDefaults')

// calculateTotal and computeRoundOff drive the Charges/Invoice Summary tab's
// displayed and printed totals - real money, and previously the source of a
// crash + incorrect-total bug, so cover them thoroughly.

describe('calculateTotal', () => {
  test('returns 0.00 for no charges', () => {
    expect(calculateTotal([])).toBe('0.00')
  })

  test('returns 0.00 when data is undefined/null (optional chaining guard)', () => {
    expect(calculateTotal(undefined)).toBe('0.00')
    expect(calculateTotal(null)).toBe('0.00')
  })

  test('single receivable charge (non client/vendor partyType uses "amount")', () => {
    const records = [{ type: 'Recievable', partyType: 'agent', amount: '100.00', local_amount: '999.00' }]
    expect(calculateTotal(records)).toBe('100.00')
  })

  test('single payable charge is subtracted, result is absolute', () => {
    const records = [{ type: 'Payble', partyType: 'agent', amount: '100.00' }]
    expect(calculateTotal(records)).toBe('100.00')
  })

  test('client/vendor partyType uses local_amount instead of amount', () => {
    const records = [{ type: 'Recievable', partyType: 'client', amount: '1.00', local_amount: '250.00' }]
    expect(calculateTotal(records)).toBe('250.00')
    const vendorRecords = [{ type: 'Recievable', partyType: 'vendor', amount: '1.00', local_amount: '75.50' }]
    expect(calculateTotal(vendorRecords)).toBe('75.50')
  })

  test('multiple charges with mixed Recievable/Payble net out correctly', () => {
    const records = [
      { type: 'Recievable', partyType: 'agent', amount: '500.00' },
      { type: 'Payble', partyType: 'agent', amount: '150.00' },
      { type: 'Recievable', partyType: 'agent', amount: '50.00' },
    ]
    // 500 - 150 + 50 = 400
    expect(calculateTotal(records)).toBe('400.00')
  })

  test('result is always non-negative even when payable charges dominate', () => {
    const records = [
      { type: 'Recievable', partyType: 'agent', amount: '50.00' },
      { type: 'Payble', partyType: 'agent', amount: '500.00' },
    ]
    // 50 - 500 = -450 -> abs -> 450.00
    expect(calculateTotal(records)).toBe('450.00')
  })

  test('rounding edge case: values ending in .005 round the same way toFixed(2) does', () => {
    const records = [{ type: 'Recievable', partyType: 'agent', amount: '10.005' }]
    // JS floating point: (10.005).toFixed(2) === '10.01' or '10.00' depending on
    // binary representation - assert against the real platform behavior rather
    // than assuming, so this test documents (and would catch a change in) the
    // actual rounding, not an ideal one.
    expect(calculateTotal(records)).toBe((10.005).toFixed(2))
  })

  test('string numeric amounts are parsed correctly', () => {
    const records = [{ type: 'Recievable', partyType: 'agent', amount: '33.33' }]
    expect(calculateTotal(records)).toBe('33.33')
  })
})

describe('computeRoundOff', () => {
  test('whole-number total leaves currentRoundOff untouched', () => {
    const records = [{ type: 'Recievable', partyType: 'agent', amount: '100.00' }]
    expect(computeRoundOff(records, '0')).toBe('0')
    expect(computeRoundOff(records, '+0.50')).toBe('+0.50')
  })

  test('fractional remainder <= 0.5 toggles on with a negative adjustment', () => {
    // total 100.30 -> before=100.30, after=100, remaining=0.3 (<=0.5)
    const records = [{ type: 'Recievable', partyType: 'agent', amount: '100.30' }]
    expect(computeRoundOff(records, '0')).toBe('-0.30')
  })

  test('fractional remainder > 0.5 toggles on with a positive adjustment to the next whole number', () => {
    // total 100.75 -> remaining=0.75 (>0.5) -> +(1-0.75) = +0.25
    const records = [{ type: 'Recievable', partyType: 'agent', amount: '100.75' }]
    expect(computeRoundOff(records, '0')).toBe('+0.25')
  })

  test('toggling again (currentRoundOff already set) turns it back off', () => {
    const records = [{ type: 'Recievable', partyType: 'agent', amount: '100.30' }]
    expect(computeRoundOff(records, '-0.30')).toBe('0')
    expect(computeRoundOff(records, '+0.25')).toBe('0')
  })

  test('exact half (0.5) takes the <=0.5 negative-adjustment branch', () => {
    const records = [{ type: 'Recievable', partyType: 'agent', amount: '100.50' }]
    expect(computeRoundOff(records, '0')).toBe('-0.50')
  })

  test('no charges (empty records) leaves roundOff untouched', () => {
    expect(computeRoundOff([], '0')).toBe('0')
  })

  test('is idempotent to call twice with the value it just returned as input the other way (toggle round-trip)', () => {
    const records = [{ type: 'Recievable', partyType: 'agent', amount: '42.42' }]
    const on = computeRoundOff(records, '0')
    expect(on).not.toBe('0')
    const off = computeRoundOff(records, on)
    expect(off).toBe('0')
  })
})
