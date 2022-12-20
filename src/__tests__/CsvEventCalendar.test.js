import $ from 'jquery'
import CsvEventCalendar from '../js/CsvEventCalendar'
import CalendarEvent from '../js/CalendarEvent'
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

  const controls = CsvEventCalendar.prototype.controls
  const resize = CsvEventCalendar.prototype.resize
  const loadCsv = CsvEventCalendar.prototype.loadCsv
  beforeEach(() => {
    CsvEventCalendar.prototype.controls = jest.fn()
    CsvEventCalendar.prototype.resize = jest.fn()
    CsvEventCalendar.prototype.loadCsv = jest.fn()
  })

  afterEach(() => {
    CsvEventCalendar.prototype.controls = controls
    CsvEventCalendar.prototype.resize = resize
    CsvEventCalendar.prototype.loadCsv = loadCsv
  })

  test('constructor - standard csv', () => {
    expect.assertions(10)

    const calendar = new CsvEventCalendar({
      target: $('#test-cal'),
      url: 'mock-url',
      ready: 'mock-ready',
      dateChanged: 'mock-date-changed',
      viewChanged: 'mock-view-changed'
    })

    expect(calendar instanceof CsvEventCalendar).toBe(true)
    expect(calendar.firstView).toBe(true)
    expect(calendar.ready).toBe('mock-ready')
    expect(calendar.dateChanged).toBe('mock-date-changed')
    expect(calendar.viewChanged).toBe('mock-view-changed')
    expect(calendar.csvColumns).toEqual(CalendarEvent.DEFAULT_PROPERTIES)
    expect(calendar.controls).toHaveBeenCalledTimes(1)
    expect(calendar.resize).toHaveBeenCalledTimes(1)
    expect(calendar.loadCsv).toHaveBeenCalledTimes(1)
    expect(calendar.loadCsv.mock.calls[0][0]).toBe('mock-url')
  })

  test('constructor - different csv', () => {
    expect.assertions(10)

    const csvColumns = {
        date: 'Date',
        name: 'Event Name',
        about: 'Description',
        start: 'Start Time',
        end: 'End Time',
        location: 'Address',
        sponsor: 'Sponsor'
      }
    const calendar = new CsvEventCalendar({
      target: $('#test-cal'),
      url: 'mock-url',
      ready: 'mock-ready',
      dateChanged: 'mock-date-changed',
      viewChanged: 'mock-view-changed',
      csvColumns
    })

    expect(calendar instanceof CsvEventCalendar).toBe(true)
    expect(calendar.firstView).toBe(true)
    expect(calendar.ready).toBe('mock-ready')
    expect(calendar.dateChanged).toBe('mock-date-changed')
    expect(calendar.viewChanged).toBe('mock-view-changed')
    expect(calendar.csvColumns).toEqual(csvColumns)
    expect(calendar.controls).toHaveBeenCalledTimes(1)
    expect(calendar.resize).toHaveBeenCalledTimes(1)
    expect(calendar.loadCsv).toHaveBeenCalledTimes(1)
    expect(calendar.loadCsv.mock.calls[0][0]).toBe('mock-url')
  })
})

describe('loadCsv', () => {

  const indexData = CsvEventCalendar.prototype.indexData
  beforeEach(() => {
    CsvEventCalendar.prototype.indexData = jest.fn()
  })

  afterEach(() => {
    CsvEventCalendar.prototype.indexData = indexData
  })

  test('loadCsv', () => {
    expect.assertions(5)

    const calendar = new CsvEventCalendar({
      target: $('#test-cal'),
      url: 'mock-url'
    })

    expect(calendar.indexData).toHaveBeenCalledTimes(1)
    expect(calendar.indexData.mock.calls[0][0]).toEqual(MOCK_CSV_RESPONSE)
  })
})

/*
describe('indexData', () => {

  const controls = CsvEventCalendar.prototype.controls
  const resize = CsvEventCalendar.prototype.resize
  const loadCsv = CsvEventCalendar.prototype.loadCsv
  const autoComplete = CsvEventCalendar.prototype.autoComplete
  const hashChanged = CsvEventCalendar.prototype.hashChanged
  const minMax = CsvEventCalendar.prototype.minMax
  beforeEach(() => {
    CsvEventCalendar.prototype.controls = jest.fn()
    CsvEventCalendar.prototype.resize = jest.fn()
    CsvEventCalendar.prototype.loadCsv = jest.fn()
    CsvEventCalendar.prototype.autoComplete = jest.fn()
    CsvEventCalendar.prototype.hashChanged = jest.fn()
    CsvEventCalendar.prototype.minMax = jest.fn()
 })

  afterEach(() => {
    CsvEventCalendar.prototype.controls = controls
    CsvEventCalendar.prototype.resize = resize
    CsvEventCalendar.prototype.loadCsv = loadCsv
    CsvEventCalendar.prototype.autoComplete = autoComplete
    CsvEventCalendar.prototype.hashChanged = hashChanged
    CsvEventCalendar.prototype.minMax = minMax
  })

  test('indexData - standard csv', () => {
    expect.assertions(9)

    const ready = jest.fn()

    const calendar = new CsvEventCalendar({
      target: $('#test-cal'),
      url: 'mock-url',
      ready
    })

    expect(calendar.firstView).toBe(true)
    expect(calendar.minMax).toHaveBeenCalledTimes(0)
    expect(calendar.controls).toHaveBeenCalledTimes(1)
    expect(calendar.resize).toHaveBeenCalledTimes(1)
    expect(calendar.loadCsv).toHaveBeenCalledTimes(1)
    expect(calendar.loadCsv.mock.calls[0][0]).toBe('mock-url')
    expect(calendar.eventsIndex).toEqual({ready: false, noData: false, events: {}})

    calendar.indexData(MOCK_CSV_RESPONSE)

    expect(calendar.minMax).toHaveBeenCalledTimes(1)
    expect(calendar.eventsIndex).toEqual({
      ready: true,
      noData: false,
      events: {}
    })

  })
})
*/