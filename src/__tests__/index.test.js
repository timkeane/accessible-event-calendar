test('index', () => {
  expect.assertions(2)
  expect(window.CsvEventCalendar).toBeUndefined()
  require('../js/index')
  expect(typeof window.CsvEventCalendar).toBe('function')
})