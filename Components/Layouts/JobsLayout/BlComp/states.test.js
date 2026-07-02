// states.test.js
import { calculateContainerInfos } from './states';

test('calculateContainerInfos sums gross weight across containers', () => {
  // Arrange: fake inputs, no UI, no database, no browser
  const state = {
    Container_Infos: [
      { gross: '100', net: '80', tare: '20', cbm: '5', pkgs: '2', unit: 'PKG', wtUnit: 'KG' },
      { gross: '50',  net: '40', tare: '10', cbm: '3', pkgs: '1', unit: 'PKG', wtUnit: 'KG' },
    ]
  };
  const set = () => {};      // fake/mock function, since we don't care about it here
  const reset = jest.fn();   // a spy — records how it was called, doesn't actually reset a form
  const allValues = {};

  // Act: call the real function directly
  calculateContainerInfos(state, set, reset, allValues);

  // Assert: check what reset() was called with
  expect(reset).toHaveBeenCalledWith(
    expect.objectContaining({ gross: '150' }) // 100 + 50
  );
});