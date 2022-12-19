import $ from 'jquery'
import CsvEventCalendar from '../js/CsvEventCalendar'
import Papa from 'papaparse'
import { MOCK_CSV_RESPONSE } from './mockCsv'

jest.mock('papaparse', () => {
  const papa = jest.requireActual('papaparse')
  return {
    ...papa,
    parse: (url, options) => {
      expect(url).toBe('mock-url')
      expect(options.download).toBe(true)
      expect(options.header).toBe(true)
      options.complete(MOCK_CSV_RESPONSE)
    }
  }
})

beforeEach(() => {
  $('body').append($('<div id="test-cal"></div>'))
})

afterEach(() => {
  $('#test-cal').remove()
})

describe('constructor', () => {

  test('constructor', () => {
    expect.assertions(9)

    const ready = jest.fn()
    const dateChanged = jest.fn()
    const viewChanged = jest.fn()

    const calendar = new CsvEventCalendar({
      target: $('#test-cal'),
      url: 'mock-url',
      ready,
      dateChanged,
      viewChanged
    })

    expect(calendar instanceof CsvEventCalendar).toBe(true)
    expect(ready).toHaveBeenCalledTimes(1)
    expect(dateChanged).toHaveBeenCalledTimes(0)
    expect(viewChanged).toHaveBeenCalledTimes(0)
  
    const date = Object.keys(calendar.eventsIndex.events)[0]
    
    calendar.dateInput.val(date).trigger('change')
    $(window).trigger('hashchange') //jsdom not dispatching this?

    expect(dateChanged).toHaveBeenCalledTimes(1)
    expect(viewChanged).toHaveBeenCalledTimes(1)
  })
})
