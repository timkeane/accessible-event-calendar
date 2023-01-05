import $ from 'jquery'
import CsvEventCalendar from '../js/CsvEventCalendar'
import CalendarEvent from '../js/CalendarEvent'
import Papa from 'papaparse'
import getMockData from './getMockData'

let testToday
let mockData
let testLocale
let mockResponse

const csvColumns = {
  date: 'Date',
  name: 'Event Name',
  about: 'Description',
  start: 'Start Time',
  end: 'End Time',
  location: 'Address',
  sponsor: 'Sponsor'
}

const getToday = CsvEventCalendar.getToday
const parse = Papa.parse

const mockParse = (url, options) => {
  expect(url).toBe('mock-url')
  expect(options.download).toBe(true)
  expect(options.header).toBe(true)
  const today = CsvEventCalendar.getToday()
  mockData = getMockData(today)
  options.complete(mockData[mockResponse])
}

const setTimeZone = CsvEventCalendar.prototype.setTimeZone

beforeEach(() => {
  const today = CsvEventCalendar.getToday()
  testToday = CsvEventCalendar.dateKey(today)
  testLocale = 'en-US'
  mockResponse = 'csvResponse'
  Papa.parse = mockParse
  CsvEventCalendar.prototype.setTimeZone = function() {
    this.clientTimeZone = this.timeZone
  }
  CsvEventCalendar.getToday = () => {
    const parts = testToday.split('-')
    const today = new Date(parts[0] * 1, parts[1] * 1 - 1, parts[2] * 1)
    today.setHours(12, 0, 0, 0)
    return today
  }
  CsvEventCalendar.getLocale = () => testLocale
  window.location.hash = ''
  $('body').append($('<div id="test-cal"></div>'))
})

afterEach(() => {
  Papa.parse = parse
  $('#test-cal').remove()
  CsvEventCalendar.getToday = getToday
  CsvEventCalendar.prototype.setTimeZone = setTimeZone
})

describe('constructor', () => {

  let controlsSpy
  const resize = CsvEventCalendar.prototype.resize
  const loadCsv = CsvEventCalendar.prototype.loadCsv
  beforeEach(() => {
    controlsSpy = jest.spyOn(CsvEventCalendar.prototype, 'controls')
    CsvEventCalendar.prototype.resize = jest.fn()
    CsvEventCalendar.prototype.loadCsv = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
    CsvEventCalendar.prototype.resize = resize
    CsvEventCalendar.prototype.loadCsv = loadCsv
  })

  test('constructor - standard csv', () => {
    expect.assertions(23)

    const today = CsvEventCalendar.getToday()

    const calendar = new CsvEventCalendar({
      target: $('#test-cal'),
      url: 'mock-url',
      ready: 'mock-ready',
      dateChanged: 'mock-date-changed',
      viewChanged: 'mock-view-changed'
    })

    expect(calendar instanceof CsvEventCalendar).toBe(true)
    expect(calendar.eventsIndex.noData).toBe(false)
    expect(calendar.today).toEqual(today)

    expect(calendar.container.length).toBe(1)
    expect(calendar.container[0]).toBe($('#test-cal>div.calendar')[0])
    expect(calendar.container[0].id).toBe(`calendar${CsvEventCalendar.ids.calendar}`)
    
    expect(calendar.firstView).toBe(true)
    expect(calendar.ready).toBe('mock-ready')
    expect(calendar.dateChanged).toBe('mock-date-changed')
    expect(calendar.viewChanged).toBe('mock-view-changed')
    expect(calendar.csvColumns).toEqual(CalendarEvent.DEFAULT_PROPERTIES)
    expect(calendar.controls).toHaveBeenCalledTimes(1)
    expect(calendar.resize).toHaveBeenCalledTimes(1)
    expect(calendar.loadCsv).toHaveBeenCalledTimes(1)
    expect(calendar.loadCsv.mock.calls[0][0]).toBe('mock-url')

    expect(calendar.state.today).toBe(CsvEventCalendar.dateKey(today))
    expect(calendar.state.year).toBe(today.getFullYear())
    expect(calendar.state.month).toBe(today.getMonth())
    expect(calendar.state.date).toBe(today.getDate())
    expect(calendar.state.view).toBe('month')
    expect(calendar.state.previousView).toBe('month')
    expect(calendar.state.foundEvent).toBeNull()
    expect(calendar.state.key()).toBe(CsvEventCalendar.dateKey(today))

  })

  test('constructor - different csv', () => {
    expect.assertions(23)

    const today = CsvEventCalendar.getToday()

    const calendar = new CsvEventCalendar({
      target: $('#test-cal'),
      url: 'mock-url',
      ready: 'mock-ready',
      dateChanged: 'mock-date-changed',
      viewChanged: 'mock-view-changed',
      csvColumns
    })

    expect(calendar instanceof CsvEventCalendar).toBe(true)
    expect(calendar.eventsIndex.noData).toBe(false)
    expect(calendar.today).toEqual(today)

    expect(calendar.container.length).toBe(1)
    expect(calendar.container[0]).toBe($('#test-cal>div.calendar')[0])
    expect(calendar.container[0].id).toBe(`calendar${CsvEventCalendar.ids.calendar}`)
    
    expect(calendar.firstView).toBe(true)
    expect(calendar.ready).toBe('mock-ready')
    expect(calendar.dateChanged).toBe('mock-date-changed')
    expect(calendar.viewChanged).toBe('mock-view-changed')
    expect(calendar.csvColumns).toEqual(csvColumns)
    expect(calendar.controls).toHaveBeenCalledTimes(1)
    expect(calendar.resize).toHaveBeenCalledTimes(1)
    expect(calendar.loadCsv).toHaveBeenCalledTimes(1)
    expect(calendar.loadCsv.mock.calls[0][0]).toBe('mock-url')

    expect(calendar.state.today).toBe(CsvEventCalendar.dateKey(today))
    expect(calendar.state.year).toBe(today.getFullYear())
    expect(calendar.state.month).toBe(today.getMonth())
    expect(calendar.state.date).toBe(today.getDate())
    expect(calendar.state.view).toBe('month')
    expect(calendar.state.previousView).toBe('month')
    expect(calendar.state.foundEvent).toBeNull()
    expect(calendar.state.key()).toBe(CsvEventCalendar.dateKey(today))

  })

  test('constructor - no url', () => {
    expect.assertions(22)

    const today = CsvEventCalendar.getToday()

    const calendar = new CsvEventCalendar({
      target: $('#test-cal'),
      ready: 'mock-ready',
      dateChanged: 'mock-date-changed',
      viewChanged: 'mock-view-changed'
    })

    expect(calendar instanceof CsvEventCalendar).toBe(true)
    expect(calendar.eventsIndex.noData).toBe(true)
    expect(calendar.today).toEqual(today)

    expect(calendar.container.length).toBe(1)
    expect(calendar.container[0]).toBe($('#test-cal>div.calendar')[0])
    expect(calendar.container[0].id).toBe(`calendar${CsvEventCalendar.ids.calendar}`)
    
    expect(calendar.firstView).toBe(true)
    expect(calendar.ready).toBe('mock-ready')
    expect(calendar.dateChanged).toBe('mock-date-changed')
    expect(calendar.viewChanged).toBe('mock-view-changed')
    expect(calendar.csvColumns).toEqual(CalendarEvent.DEFAULT_PROPERTIES)
    expect(calendar.controls).toHaveBeenCalledTimes(1)
    expect(calendar.resize).toHaveBeenCalledTimes(1)
    expect(calendar.loadCsv).toHaveBeenCalledTimes(0)

    expect(calendar.state.today).toBe(CsvEventCalendar.dateKey(today))
    expect(calendar.state.year).toBe(today.getFullYear())
    expect(calendar.state.month).toBe(today.getMonth())
    expect(calendar.state.date).toBe(today.getDate())
    expect(calendar.state.view).toBe('month')
    expect(calendar.state.previousView).toBe('month')
    expect(calendar.state.foundEvent).toBeNull()
    expect(calendar.state.key()).toBe(CsvEventCalendar.dateKey(today))
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

    const today = CsvEventCalendar.getToday()
    mockData = getMockData(today)

    const calendar = new CsvEventCalendar({
      target: $('#test-cal'),
      url: 'mock-url'
    })

    expect(calendar.indexData).toHaveBeenCalledTimes(1)
    expect(calendar.indexData.mock.calls[0][0]).toEqual(mockData.csvResponse)
  })
})

describe('indexData', () => {

  const controls = CsvEventCalendar.prototype.controls
  const resize = CsvEventCalendar.prototype.resize
  const loadCsv = CsvEventCalendar.prototype.loadCsv
  const autoCompleteOptions = CsvEventCalendar.prototype.autoCompleteOptions
  const hashChanged = CsvEventCalendar.prototype.hashChanged
  const minMax = CsvEventCalendar.prototype.minMax

  beforeEach(() => {
    CsvEventCalendar.prototype.controls = jest.fn()
    CsvEventCalendar.prototype.resize = jest.fn()
    CsvEventCalendar.prototype.loadCsv = jest.fn()
    CsvEventCalendar.prototype.autoCompleteOptions = jest.fn()
    CsvEventCalendar.prototype.hashChanged = jest.fn()
    CsvEventCalendar.prototype.minMax = jest.fn()
 })

  afterEach(() => {
    CsvEventCalendar.prototype.controls = controls
    CsvEventCalendar.prototype.resize = resize
    CsvEventCalendar.prototype.loadCsv = loadCsv
    CsvEventCalendar.prototype.autoCompleteOptions = autoCompleteOptions
    CsvEventCalendar.prototype.hashChanged = hashChanged
    CsvEventCalendar.prototype.minMax = minMax
  })

  test('indexData - standard csv', () => {
    expect.assertions(38)

    const today = CsvEventCalendar.getToday()
    mockData = getMockData(today)

    const ready = jest.fn()

    const calendar = new CsvEventCalendar({
      target: $('#test-cal'),
      url: 'mock-url',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      ready
    })

    expect(calendar.firstView).toBe(true)
    expect(calendar.csvColumns).toBe(CalendarEvent.DEFAULT_PROPERTIES)
    expect(ready).toHaveBeenCalledTimes(0)
    expect(calendar.minMax).toHaveBeenCalledTimes(0)
    expect(calendar.controls).toHaveBeenCalledTimes(1)
    expect(calendar.resize).toHaveBeenCalledTimes(1)
    expect(calendar.loadCsv).toHaveBeenCalledTimes(1)
    expect(calendar.loadCsv.mock.calls[0][0]).toBe('mock-url')
    expect(calendar.eventsIndex).toEqual({ready: false, noData: false, events: {}})

    calendar.indexData(mockData.csvResponse)

    expect(ready).toHaveBeenCalledTimes(1)
    expect(ready.mock.calls[0][0]).toBe(calendar)
    expect(calendar.minMax).toHaveBeenCalledTimes(1)
    expect(calendar.eventsIndex.ready).toBe(true)
    expect(calendar.eventsIndex.noData).toBe(false)

    Object.keys(mockData.events).forEach(key => {
      const expected = mockData.events[key]
      const received = calendar.eventsIndex.events[key]
      expect(received.date).toBe(expected.date)
      expect(received.name).toBe(expected.name)
      expect(received.sponsor).toBe(expected.sponsor)
      expect(received.about).toBe(expected.about)
      expect(received.location).toBe(expected.location)
      expect(received.start).toBe(expected.start)
      expect(received.end).toBe(expected.end)
      expect(received.timezone).toBe(expected.timezone)
    })

  })

  test('indexData - different csv', () => {
    expect.assertions(38)

    const today = CsvEventCalendar.getToday()
    mockData = getMockData(today)

    const ready = jest.fn()

    const calendar = new CsvEventCalendar({
      target: $('#test-cal'),
      url: 'mock-url',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      ready,
      csvColumns
    })

    expect(calendar.firstView).toBe(true)
    expect(calendar.csvColumns).toBe(csvColumns)
    expect(ready).toHaveBeenCalledTimes(0)
    expect(calendar.minMax).toHaveBeenCalledTimes(0)
    expect(calendar.controls).toHaveBeenCalledTimes(1)
    expect(calendar.resize).toHaveBeenCalledTimes(1)
    expect(calendar.loadCsv).toHaveBeenCalledTimes(1)
    expect(calendar.loadCsv.mock.calls[0][0]).toBe('mock-url')
    expect(calendar.eventsIndex).toEqual({ready: false, noData: false, events: {}})

    calendar.indexData(mockData.differentCsvResponse)

    expect(ready).toHaveBeenCalledTimes(1)
    expect(ready.mock.calls[0][0]).toBe(calendar)
    expect(calendar.minMax).toHaveBeenCalledTimes(1)
    expect(calendar.eventsIndex.ready).toBe(true)
    expect(calendar.eventsIndex.noData).toBe(false)

    Object.keys(mockData.differentEvents).forEach(key => {
      const expected = mockData.differentEvents[key]
      const received = calendar.eventsIndex.events[key]
      expect(received.date).toBe(expected.date)
      expect(received.name).toBe(expected.name)
      expect(received.sponsor).toBe(expected.sponsor)
      expect(received.about).toBe(expected.about)
      expect(received.location).toBe(expected.location)
      expect(received.start).toBe(expected.start)
      expect(received.end).toBe(expected.end)
      expect(received.timezone).toBe(expected.timezone)
    })

  })

})

describe('updateHash', () => {

  const hashChanged = CsvEventCalendar.prototype.hashChanged
  beforeEach(() => {
    CsvEventCalendar.prototype.hashChanged = jest.fn()
 })

  afterEach(() => {
    CsvEventCalendar.prototype.hashChanged = hashChanged
  })  
    
  test('updateHash', () => {
    expect.assertions(2)

    const calendar1 = new CsvEventCalendar({
      target: $('#test-cal')
    })

    expect(window.location.hash).toBe('')
    calendar1.updateHash('#mock-hash')
    expect(window.location.hash).toBe('#mock-hash')
  })
})

test('getHash', () => {
  expect.assertions(2)

  const calendar1 = new CsvEventCalendar({
    target: $('#test-cal')
  })

  expect(calendar1.getHash()).toBe('')
  window.location.hash = '#mock-hash'
  expect(calendar1.getHash()).toBe('#mock-hash')
})

describe('hashChanged', () => {

  const updateState = CsvEventCalendar.prototype.updateState
  const clearSearch = CsvEventCalendar.prototype.clearSearch
  beforeEach(() => {
    CsvEventCalendar.prototype.updateState = jest.fn()
    CsvEventCalendar.prototype.clearSearch = jest.fn()
 })

  afterEach(() => {
    CsvEventCalendar.prototype.updateState = updateState
    CsvEventCalendar.prototype.clearSearch = clearSearch
  })  

  test('hashChanged - this calendar is the target', () => {
    expect.assertions(10)

    const calendar = new CsvEventCalendar({
      target: $('#test-cal'),
      url: 'mock-url'
    })

    expect(window.location.hash).toBe('')

    calendar.updateHash(`#${calendar.container[0].id}/day/2024-11-01`)
    $(window).trigger('hashchange')
  
    expect(calendar.updateState).toHaveBeenCalled()

    const callCount = calendar.updateState.mock.calls.length
    expect(calendar.updateState.mock.calls[callCount - 2][0]).toEqual({
      view: 'day',
      key: '2024-11-01'
    })
    expect(calendar.updateState.mock.calls[callCount - 1][0]).toEqual({
      view: 'day'
    })
    expect(calendar.clearSearch).toHaveBeenCalled()
    expect(calendar.firstView).toBe(false)
    expect(calendar.container.find('.view').hasClass('day')).toBe(true)
  })

  test('hashChanged - this calendar is not the target', () => {
    expect.assertions(9)

    const calendar = new CsvEventCalendar({
      target: $('#test-cal'),
      url: 'mock-url'
    })

    calendar.container.find('.view').removeClass('month').addClass('day')
    expect(window.location.hash).toBe('')

    calendar.updateHash('#not-the-target/day/2024-11-01')
    $(window).trigger('hashchange')
  
    expect(calendar.updateState).toHaveBeenCalledTimes(1)
    expect(calendar.clearSearch).toHaveBeenCalledTimes(0)
    expect(calendar.firstView).toBe(false)
    expect(calendar.container.find('.view').hasClass('day')).toBe(true)
    expect(calendar.container.find('.view').hasClass('month')).toBe(false)
  })  

})

describe('updateState', () => {

  const populate = CsvEventCalendar.prototype.populate
  const week = CsvEventCalendar.prototype.week
  const dateChanged = CsvEventCalendar.prototype.dateChanged
  const viewChanged = CsvEventCalendar.prototype.viewChanged
  beforeEach(() => {
    CsvEventCalendar.prototype.populate = jest.fn()
    CsvEventCalendar.prototype.week = jest.fn()
    CsvEventCalendar.prototype.dateChanged = jest.fn()
    CsvEventCalendar.prototype.viewChanged = jest.fn()
  })

  afterEach(() => {
    CsvEventCalendar.prototype.populate = populate
    CsvEventCalendar.prototype.week = week
    CsvEventCalendar.prototype.dateChanged = dateChanged
    CsvEventCalendar.prototype.viewChanged = viewChanged
  })

  test('updateState - initial state', () => {
    expect.assertions(14)

    const today = CsvEventCalendar.getToday()
    const keyWeekMid = CsvEventCalendar.dateKey(today)
    
    const calendar = new CsvEventCalendar({
      target: $('#test-cal'),
      min: '1900-01-01',
      max: '2100-01-01'
    })

    expect(calendar.state.key()).toBe(keyWeekMid)
    expect(calendar.state.today).toBe(keyWeekMid)
    expect(calendar.state.year).toBe(today.getFullYear())
    expect(calendar.state.month).toBe(today.getMonth())
    expect(calendar.state.date).toBe(today.getDate())
    expect(calendar.state.view).toBe('month')
    expect(calendar.state.previousView).toBe('month')

    expect(calendar.viewOptions.find('input[value="month"]').attr('aria-checked')).toBe('true')
    expect(calendar.viewOptions.find('input[value="month"]').is(':checked')).toBe(true)
    expect(calendar.viewOptions.find('.btn span').html()).toBe('View by month')

    expect(calendar.populate).toHaveBeenCalled()
    expect(calendar.week).toHaveBeenCalledTimes(0)
    expect(calendar.dateChanged).toHaveBeenCalledTimes(0)
    expect(calendar.viewChanged).toHaveBeenCalledTimes(0)
  })

  test('updateState - change view', () => {
    expect.assertions(14)

    const today = CsvEventCalendar.getToday()
    const keyWeekMid = CsvEventCalendar.dateKey(today)
    
    const calendar = new CsvEventCalendar({
      target: $('#test-cal'),
      min: '1900-01-01',
      max: '2100-01-01'
    })

    calendar.updateState({view: 'day'})

    expect(calendar.state.key()).toBe(keyWeekMid)
    expect(calendar.state.today).toBe(keyWeekMid)
    expect(calendar.state.year).toBe(today.getFullYear())
    expect(calendar.state.month).toBe(today.getMonth())
    expect(calendar.state.date).toBe(today.getDate())
    expect(calendar.state.view).toBe('day')
    expect(calendar.state.previousView).toBe('month')

    expect(calendar.viewOptions.find('input[value="day"]').attr('aria-checked')).toBe('true')
    expect(calendar.viewOptions.find('input[value="day"]').is(':checked')).toBe(true)
    expect(calendar.viewOptions.find('.btn span').html()).toBe('View by day')

    expect(calendar.populate).toHaveBeenCalled()
    expect(calendar.week).toHaveBeenCalledTimes(1)
    expect(calendar.dateChanged).toHaveBeenCalledTimes(0)
    expect(calendar.viewChanged).toHaveBeenCalledTimes(1)
  })

  test('updateState - year change', () => {
    expect.assertions(14)

    const today = CsvEventCalendar.getToday()
    const keyWeekMid = CsvEventCalendar.dateKey(today)
    const dateParts = keyWeekMid.split('-')

    const calendar = new CsvEventCalendar({
      target: $('#test-cal'),
      min: '1900-01-01',
      max: '2100-01-01'
    })

    calendar.updateState({year: 2050})

    expect(calendar.state.key()).toBe(`2050-${dateParts[1]}-${dateParts[2]}`)
    expect(calendar.state.today).toBe(keyWeekMid)
    expect(calendar.state.year).toBe(2050)
    expect(calendar.state.month).toBe(today.getMonth())
    expect(calendar.state.date).toBe(today.getDate())
    expect(calendar.state.view).toBe('month')
    expect(calendar.state.previousView).toBe('month')

    expect(calendar.viewOptions.find('input[value="month"]').attr('aria-checked')).toBe('true')
    expect(calendar.viewOptions.find('input[value="month"]').is(':checked')).toBe(true)
    expect(calendar.viewOptions.find('.btn span').html()).toBe('View by month')

    expect(calendar.populate).toHaveBeenCalled()
    expect(calendar.week).toHaveBeenCalledTimes(1)
    expect(calendar.dateChanged).toHaveBeenCalledTimes(1)
    expect(calendar.viewChanged).toHaveBeenCalledTimes(0)
  })

  test('updateState - month change', () => {
    expect.assertions(14)

    const today = CsvEventCalendar.getToday()
    const keyWeekMid = CsvEventCalendar.dateKey(today)
    const dateParts = keyWeekMid.split('-')
    
    let month
    if (dateParts[1] === '01') {
      month = 12
    } else {
      month = dateParts[1] - 2
    }

    const calendar = new CsvEventCalendar({
      target: $('#test-cal'),
      min: '1900-01-01',
      max: '2100-01-01'
    })

    calendar.updateState({month})

    expect(calendar.state.key()).toBe(`${today.getFullYear()}-${month + 1}-${dateParts[2]}`)
    expect(calendar.state.today).toBe(keyWeekMid)
    expect(calendar.state.year).toBe(today.getFullYear())
    expect(calendar.state.month).toBe(month)
    expect(calendar.state.date).toBe(today.getDate())
    expect(calendar.state.view).toBe('month')
    expect(calendar.state.previousView).toBe('month')

    expect(calendar.viewOptions.find('input[value="month"]').attr('aria-checked')).toBe('true')
    expect(calendar.viewOptions.find('input[value="month"]').is(':checked')).toBe(true)
    expect(calendar.viewOptions.find('.btn span').html()).toBe('View by month')

    expect(calendar.populate).toHaveBeenCalled()
    expect(calendar.week).toHaveBeenCalledTimes(1)
    expect(calendar.dateChanged).toHaveBeenCalledTimes(1)
    expect(calendar.viewChanged).toHaveBeenCalledTimes(0)
  })

  test('updateState - date change', () => {
    expect.assertions(14)

    const today = CsvEventCalendar.getToday()
    const keyWeekMid = CsvEventCalendar.dateKey(today)
    const dateParts = keyWeekMid.split('-')
    
    let date
    if (dateParts[2] === '15') {
      date = 10
    } else {
      date = 15
    }

    const calendar = new CsvEventCalendar({
      target: $('#test-cal'),
      min: '1900-01-01',
      max: '2100-01-01'
    })

    calendar.updateState({date})

    expect(calendar.state.key()).toBe(`${today.getFullYear()}-${dateParts[1]}-${date}`)
    expect(calendar.state.today).toBe(keyWeekMid)
    expect(calendar.state.year).toBe(today.getFullYear())
    expect(calendar.state.month).toBe(today.getMonth())
    expect(calendar.state.date).toBe(date)
    expect(calendar.state.view).toBe('month')
    expect(calendar.state.previousView).toBe('month')

    expect(calendar.viewOptions.find('input[value="month"]').attr('aria-checked')).toBe('true')
    expect(calendar.viewOptions.find('input[value="month"]').is(':checked')).toBe(true)
    expect(calendar.viewOptions.find('.btn span').html()).toBe('View by month')

    expect(calendar.populate).toHaveBeenCalled()
    expect(calendar.week).toHaveBeenCalledTimes(1)
    expect(calendar.dateChanged).toHaveBeenCalledTimes(1)
    expect(calendar.viewChanged).toHaveBeenCalledTimes(0)
  })

  test('updateState - key change', () => {
    expect.assertions(14)

    const today = CsvEventCalendar.getToday()
    const keyWeekMid = CsvEventCalendar.dateKey(today)

    const calendar = new CsvEventCalendar({
      target: $('#test-cal'),
      min: '1900-01-01',
      max: '2100-01-01'
    })

    calendar.updateState({key: '2050-01-01'})

    expect(calendar.state.key()).toBe('2050-01-01')
    expect(calendar.state.today).toBe(keyWeekMid)
    expect(calendar.state.year).toBe(2050)
    expect(calendar.state.month).toBe(0)
    expect(calendar.state.date).toBe(1)
    expect(calendar.state.view).toBe('month')
    expect(calendar.state.previousView).toBe('month')

    expect(calendar.viewOptions.find('input[value="month"]').attr('aria-checked')).toBe('true')
    expect(calendar.viewOptions.find('input[value="month"]').is(':checked')).toBe(true)
    expect(calendar.viewOptions.find('.btn span').html()).toBe('View by month')

    expect(calendar.populate).toHaveBeenCalled()
    expect(calendar.week).toHaveBeenCalledTimes(1)
    expect(calendar.dateChanged).toHaveBeenCalledTimes(1)
    expect(calendar.viewChanged).toHaveBeenCalledTimes(0)
  })

})

describe('title', () => {
  
  afterEach(() => {
    CsvEventCalendar.IS_US = true
  })

  test('title - no key - is US', () => {
    expect.assertions(11)

    const today = CsvEventCalendar.getToday()
    const keyWeekMid = CsvEventCalendar.dateKey(today)

    const dateStr = CsvEventCalendar.dateFromKey(keyWeekMid).toLocaleDateString(CsvEventCalendar.getLocale())
    const year = CsvEventCalendar.yearNumber(keyWeekMid)
    const month = CsvEventCalendar.monthName(keyWeekMid)
    const mo = month.substring(0, 3)
    const m = CsvEventCalendar.monthNumber(keyWeekMid)
    const date = CsvEventCalendar.dateNumber(keyWeekMid)
    const day = CsvEventCalendar.dayName(keyWeekMid)
    const d = day.substring(0, 3)

    const node = $('<div><div class="month"><span class="long"></span><span class="short"></span><span class="abbr"></span></div></div>')

    const calendar = new CsvEventCalendar({
      target: $('#test-cal')
    })

    const title = calendar.title({node})

    expect(title.month.long).toBe(`${month} ${year}`)
    expect(title.month.medium).toBe(`${mo} ${year}`)
    expect(title.month.abbr).toBe(`${m}/${year}`)

    expect(title.day.long).toBe(`${day} ${month} ${date}, ${year}`)
    expect(title.day.medium).toBe(`${d} ${mo} ${date}, ${year}`)
    expect(title.day.short).toBe(date)
    expect(title.day.abbr).toBe(`${d} ${dateStr}`)

    expect(node.find('.month .long').html()).toBe(title.month.long)
    expect(node.find('.month .short').html()).toBe(title.month.medium)
    expect(node.find('.month .abbr').html()).toBe(title.month.abbr)
    expect(node.attr('aria-label')).toBe(title.month.long)
  })

  test('title - no key - is not US', () => {
    expect.assertions(11)

    CsvEventCalendar.IS_US = false

    const today = CsvEventCalendar.getToday()
    const keyWeekMid = CsvEventCalendar.dateKey(today)

    const dateStr = CsvEventCalendar.dateFromKey(keyWeekMid).toLocaleDateString(CsvEventCalendar.getLocale())
    const year = CsvEventCalendar.yearNumber(keyWeekMid)
    const month = CsvEventCalendar.monthName(keyWeekMid)
    const mo = month.substring(0, 3)
    const m = CsvEventCalendar.monthNumber(keyWeekMid)
    const date = CsvEventCalendar.dateNumber(keyWeekMid)
    const day = CsvEventCalendar.dayName(keyWeekMid)
    const d = day.substring(0, 3)

    const node = $('<div><div class="month"><span class="long"></span><span class="short"></span><span class="abbr"></span></div></div>')

    const calendar = new CsvEventCalendar({
      target: $('#test-cal')
    })

    const title = calendar.title({node})

    expect(title.month.long).toBe(`${month} ${year}`)
    expect(title.month.medium).toBe(`${mo} ${year}`)
    expect(title.month.abbr).toBe(`${m}/${year}`)

    expect(title.day.long).toBe(`${day} ${date} ${month} ${year}`)
    expect(title.day.medium).toBe(`${d} ${date} ${mo} ${year}`)
    expect(title.day.short).toBe(date)
    expect(title.day.abbr).toBe(`${d} ${dateStr}`)

    expect(node.find('.month .long').html()).toBe(title.month.long)
    expect(node.find('.month .short').html()).toBe(title.month.medium)
    expect(node.find('.month .abbr').html()).toBe(title.month.abbr)
    expect(node.attr('aria-label')).toBe(title.month.long)
  })

})

test('dayNode', () => {
  expect.assertions(2)

  const today = CsvEventCalendar.getToday()
  const keyWeekMid = CsvEventCalendar.dateKey(today)

  const calendar = new CsvEventCalendar({
    target: $('#test-cal')
  })

  const node = calendar.dayNode(keyWeekMid)

  expect($(node)[0].tagName).toBe('LI')
  expect($(node).attr('data-date-key')).toBe(keyWeekMid)

})

describe('previousMonth', () => {

  afterEach(() => {
    testLocale = 'en-US'
  })

  test('previousMonth - is US', () => {
    expect.assertions(2)

    const dates = []

    const calendar = new CsvEventCalendar({
      target: $('#test-cal'),
      min: '1900-01-01',
      max: '2100-01-01'
    })

    calendar.updateState({key: '2023-01-01'})
    calendar.previousMonth(dates)
    expect(dates.length).toBe(0)

    calendar.updateState({key: '2023-12-01'})
    calendar.previousMonth(dates)
    expect(dates).toEqual([
      {key: '2023-11-26', date: 26, monthClass: 'prev'},
      {key: '2023-11-27', date: 27, monthClass: 'prev'},
      {key: '2023-11-28', date: 28, monthClass: 'prev'},
      {key: '2023-11-29', date: 29, monthClass: 'prev'},
      {key: '2023-11-30', date: 30, monthClass: 'prev'}
    ])
  })

  test('previousMonth - is not US', () => {
    expect.assertions(2)


    testLocale = 'fr-FR'

    const dates = []

    const calendar = new CsvEventCalendar({
      target: $('#test-cal'),
      min: '1900-01-01',
      max: '2100-01-01'
    })

    calendar.updateState({key: '2023-01-01'})
    calendar.previousMonth(dates)

    expect(dates).toEqual([
      { key: '2022-12-26', date: 26, monthClass: 'prev' },
      { key: '2022-12-27', date: 27, monthClass: 'prev' },
      { key: '2022-12-28', date: 28, monthClass: 'prev' },
      { key: '2022-12-29', date: 29, monthClass: 'prev' },
      { key: '2022-12-30', date: 30, monthClass: 'prev' },
      { key: '2022-12-31', date: 31, monthClass: 'prev' }
    ])

    dates.length = 0
    calendar.updateState({key: '2023-12-01'})
    calendar.previousMonth(dates)

    expect(dates).toEqual([
      { key: '2023-11-27', date: 27, monthClass: 'prev' },
      { key: '2023-11-28', date: 28, monthClass: 'prev' },
      { key: '2023-11-29', date: 29, monthClass: 'prev' },
      { key: '2023-11-30', date: 30, monthClass: 'prev' }
    ])
  })

})

test('currentMonth', () => {
  expect.assertions(1)

  const dates = []

  const calendar = new CsvEventCalendar({
    target: $('#test-cal'),
    min: '1900-01-01',
    max: '2100-01-01'
  })

  calendar.updateState({key: '2023-01-01'})
  calendar.currentMonth(dates)
  expect(dates).toEqual([
    {key: '2023-01-01', date: 1, monthClass: 'current'},
    {key: '2023-01-02', date: 2, monthClass: 'current'},
    {key: '2023-01-03', date: 3, monthClass: 'current'},
    {key: '2023-01-04', date: 4, monthClass: 'current'},
    {key: '2023-01-05', date: 5, monthClass: 'current'},
    {key: '2023-01-06', date: 6, monthClass: 'current'},
    {key: '2023-01-07', date: 7, monthClass: 'current'},
    {key: '2023-01-08', date: 8, monthClass: 'current'},
    {key: '2023-01-09', date: 9, monthClass: 'current'},
    {key: '2023-01-10', date: 10, monthClass: 'current'},
    {key: '2023-01-11', date: 11, monthClass: 'current'},
    {key: '2023-01-12', date: 12, monthClass: 'current'},
    {key: '2023-01-13', date: 13, monthClass: 'current'},
    {key: '2023-01-14', date: 14, monthClass: 'current'},
    {key: '2023-01-15', date: 15, monthClass: 'current'},
    {key: '2023-01-16', date: 16, monthClass: 'current'},
    {key: '2023-01-17', date: 17, monthClass: 'current'},
    {key: '2023-01-18', date: 18, monthClass: 'current'},
    {key: '2023-01-19', date: 19, monthClass: 'current'},
    {key: '2023-01-20', date: 20, monthClass: 'current'},
    {key: '2023-01-21', date: 21, monthClass: 'current'},
    {key: '2023-01-22', date: 22, monthClass: 'current'},
    {key: '2023-01-23', date: 23, monthClass: 'current'},
    {key: '2023-01-24', date: 24, monthClass: 'current'},
    {key: '2023-01-25', date: 25, monthClass: 'current'},
    {key: '2023-01-26', date: 26, monthClass: 'current'},
    {key: '2023-01-27', date: 27, monthClass: 'current'},
    {key: '2023-01-28', date: 28, monthClass: 'current'},
    {key: '2023-01-29', date: 29, monthClass: 'current'},
    {key: '2023-01-30', date: 30, monthClass: 'current'},
    {key: '2023-01-31', date: 31, monthClass: 'current'}
  ])
})

test('nextMonth', () => {
  expect.assertions(1)

  const dates = []

  const calendar = new CsvEventCalendar({
    target: $('#test-cal'),
    min: '1900-01-01',
    max: '2100-01-01'
  })

  calendar.updateState({key: '2022-12-01'})
  calendar.nextMonth(dates)
  expect(dates).toEqual([
    {key: '2023-01-01', date: 1, monthClass: 'next'},
    {key: '2023-01-02', date: 2, monthClass: 'next'},
    {key: '2023-01-03', date: 3, monthClass: 'next'},
    {key: '2023-01-04', date: 4, monthClass: 'next'},
    {key: '2023-01-05', date: 5, monthClass: 'next'},
    {key: '2023-01-06', date: 6, monthClass: 'next'},
    {key: '2023-01-07', date: 7, monthClass: 'next'},
    {key: '2023-01-08', date: 8, monthClass: 'next'},
    {key: '2023-01-09', date: 9, monthClass: 'next'},
    {key: '2023-01-10', date: 10, monthClass: 'next'},
    {key: '2023-01-11', date: 11, monthClass: 'next'},
    {key: '2023-01-12', date: 12, monthClass: 'next'},
    {key: '2023-01-13', date: 13, monthClass: 'next'},
    {key: '2023-01-14', date: 14, monthClass: 'next'},
    {key: '2023-01-15', date: 15, monthClass: 'next'},
    {key: '2023-01-16', date: 16, monthClass: 'next'},
    {key: '2023-01-17', date: 17, monthClass: 'next'},
    {key: '2023-01-18', date: 18, monthClass: 'next'},
    {key: '2023-01-19', date: 19, monthClass: 'next'},
    {key: '2023-01-20', date: 20, monthClass: 'next'},
    {key: '2023-01-21', date: 21, monthClass: 'next'},
    {key: '2023-01-22', date: 22, monthClass: 'next'},
    {key: '2023-01-23', date: 23, monthClass: 'next'},
    {key: '2023-01-24', date: 24, monthClass: 'next'},
    {key: '2023-01-25', date: 25, monthClass: 'next'},
    {key: '2023-01-26', date: 26, monthClass: 'next'},
    {key: '2023-01-27', date: 27, monthClass: 'next'},
    {key: '2023-01-28', date: 28, monthClass: 'next'},
    {key: '2023-01-29', date: 29, monthClass: 'next'},
    {key: '2023-01-30', date: 30, monthClass: 'next'},
    {key: '2023-01-31', date: 31, monthClass: 'next'},
    {key: '2023-02-01', date: 32, monthClass: 'next'},
    {key: '2023-02-02', date: 33, monthClass: 'next'},
    {key: '2023-02-03', date: 34, monthClass: 'next'},
    {key: '2023-02-04', date: 35, monthClass: 'next'},
    {key: '2023-02-05', date: 36, monthClass: 'next'},
    {key: '2023-02-06', date: 37, monthClass: 'next'},
    {key: '2023-02-07', date: 38, monthClass: 'next'},
    {key: '2023-02-08', date: 39, monthClass: 'next'},
    {key: '2023-02-09', date: 40, monthClass: 'next'},
    {key: '2023-02-10', date: 41, monthClass: 'next'},
    {key: '2023-02-11', date: 42, monthClass: 'next'}
  ])
})

test('navigate', () => {
  expect.assertions(14)

  const calendar = new CsvEventCalendar({
    target: $('#test-cal')
  })

  calendar.monthNavigate = jest.fn()
  calendar.weekNavigate = jest.fn()
  calendar.view = jest.fn()

  calendar.updateState({view: 'month'})
  
  const back = calendar.container.find('.btn.back').attr('disabled', true)
  expect(back.is(':disabled')).toBe(true)

  const next = calendar.container.find('.btn.next')
  
  next.trigger('click')

  expect(calendar.monthNavigate).toHaveBeenCalledTimes(1)
  expect(calendar.monthNavigate.mock.calls[0][0]).toBe(1)
  expect(calendar.weekNavigate).toHaveBeenCalledTimes(0)
  expect(calendar.view).toHaveBeenCalledTimes(1)
  expect(calendar.view.mock.calls[0][0]).toBe('month')
  expect(back.is(':disabled')).toBe(false)

  calendar.updateState({view: 'week'})

  next.attr('disabled', true)
  expect(next.is(':disabled')).toBe(true)

  back.trigger('click')

  expect(calendar.monthNavigate).toHaveBeenCalledTimes(1)
  expect(calendar.weekNavigate).toHaveBeenCalledTimes(1)
  expect(calendar.weekNavigate.mock.calls[0][0]).toBe(-1)
  expect(calendar.view).toHaveBeenCalledTimes(2)
  expect(calendar.view.mock.calls[1][0]).toBe('week')
  expect(next.is(':disabled')).toBe(false)
})

test('monthNavigate', () => {
  expect.assertions(20)

  const calendar = new CsvEventCalendar({
    target: $('#test-cal')
  })

  const id = calendar.container[0].id

  calendar.updateHash = jest.fn()

  calendar.updateState({key: '2022-11-01'})
  expect(calendar.state.month).toBe(10)

  calendar.monthNavigate(-1)

  expect(calendar.state.month).toBe(9)
  expect(calendar.state.year).toBe(2022)
  expect(calendar.updateHash).toHaveBeenCalledTimes(1)
  expect(calendar.updateHash.mock.calls[0][0]).toBe(`#${id}/month/2022-10-01`)

  calendar.updateState({key: '2022-01-01'})
  expect(calendar.state.month).toBe(0)

  calendar.monthNavigate(-1)

  expect(calendar.state.month).toBe(11)
  expect(calendar.state.year).toBe(2021)
  expect(calendar.updateHash).toHaveBeenCalledTimes(2)
  expect(calendar.updateHash.mock.calls[1][0]).toBe(`#${id}/month/2021-12-01`)

  calendar.updateState({key: '2022-11-01'})
  expect(calendar.state.month).toBe(10)

  calendar.monthNavigate(1)

  expect(calendar.state.month).toBe(11)
  expect(calendar.state.year).toBe(2022)
  expect(calendar.updateHash).toHaveBeenCalledTimes(3)
  expect(calendar.updateHash.mock.calls[2][0]).toBe(`#${id}/month/2022-12-01`)

  calendar.updateState({key: '2022-12-01'})
  expect(calendar.state.month).toBe(11)

  calendar.monthNavigate(1)

  expect(calendar.state.month).toBe(0)
  expect(calendar.state.year).toBe(2023)
  expect(calendar.updateHash).toHaveBeenCalledTimes(4)
  expect(calendar.updateHash.mock.calls[3][0]).toBe(`#${id}/month/2023-01-01`)
})

test('weekNavigate', () => {
  expect.assertions(13)

  testToday = '2022-12-14'

  const calendar = new CsvEventCalendar({
    target: $('#test-cal')
  })

  const id = calendar.container[0].id

  calendar.monthView = jest.fn()
  calendar.week = jest.fn()
  calendar.updateHash = jest.fn()

  calendar.updateState({key: '2022-11-01'})
  calendar.week.mockReset()

  expect(calendar.week).toHaveBeenCalledTimes(0)
  calendar.weekNavigate(-1)

  expect(calendar.state.key()).toBe('2022-10-25')
  expect(calendar.monthView).toHaveBeenCalledTimes(1)
  expect(calendar.week).toHaveBeenCalledTimes(2)
  expect(calendar.updateHash).toHaveBeenCalledTimes(1)
  expect(calendar.updateHash.mock.calls[0][0]).toBe(`#${id}/week/2022-10-25`)

  calendar.updateState({key: '2022-12-31'})
  calendar.week.mockReset()

  expect(calendar.container.find('[data-date-key="2022-12-24"]').hasClass('selected')).toBe(false)

  calendar.weekNavigate(-1)

  expect(calendar.state.key()).toBe('2022-12-24')
  expect(calendar.monthView).toHaveBeenCalledTimes(1)
  expect(calendar.week).toHaveBeenCalledTimes(2)
  expect(calendar.updateHash).toHaveBeenCalledTimes(2)
  expect(calendar.updateHash.mock.calls[1][0]).toBe(`#${id}/week/2022-12-24`)
  expect(calendar.container.find('[data-date-key="2022-12-24"]').hasClass('selected')).toBe(true)
})

test('dayNavigate', () => {
  expect.assertions(21)

  testToday = '2022-12-14'

  const today = CsvEventCalendar.getToday()
  const keyToday = CsvEventCalendar.dateKey(today)

  const before = new Date(today)
  const after = new Date(today)
  before.setDate(today.getDate() - 2)
  after.setDate(today.getDate() + 2)
  const keyBefore = CsvEventCalendar.dateKey(before)
  const keyAfter = CsvEventCalendar.dateKey(after)

  const calendar = new CsvEventCalendar({
    target: $('#test-cal'),
    url: 'mock-url',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    min: '1990-01-01',
    max: '2090-01-01'
  })

  const id = calendar.container[0].id

  calendar.monthView = jest.fn()
  calendar.updateHash = jest.fn()

  expect(calendar.state.key()).toBe(keyToday)

  calendar.dayNavigate(-1)

  expect(calendar.state.key()).toBe(keyBefore)
  expect(calendar.monthView).toHaveBeenCalledTimes(0)
  expect(calendar.updateHash).toHaveBeenCalledTimes(1)
  expect(calendar.updateHash.mock.calls[0][0]).toBe(`#${id}/day/${keyBefore}`)

  calendar.dayNavigate(1)

  expect(calendar.state.key()).toBe(keyToday)
  expect(calendar.monthView).toHaveBeenCalledTimes(0)
  expect(calendar.updateHash).toHaveBeenCalledTimes(2)
  expect(calendar.updateHash.mock.calls[1][0]).toBe(`#${id}/day/${keyToday}`)

  calendar.dayNavigate(1)

  expect(calendar.state.key()).toBe(keyAfter)
  expect(calendar.monthView).toHaveBeenCalledTimes(0)
  expect(calendar.updateHash).toHaveBeenCalledTimes(3)
  expect(calendar.updateHash.mock.calls[2][0]).toBe(`#${id}/day/${keyAfter}`)

  calendar.updateState({key: '2022-12-31'})
  expect(calendar.state.key()).toBe('2022-12-31')

  calendar.dayNavigate(1)

  expect(calendar.state.key()).toBe('2023-01-01')
  expect(calendar.monthView).toHaveBeenCalledTimes(1)
  expect(calendar.updateHash).toHaveBeenCalledTimes(4)
  expect(calendar.updateHash.mock.calls[3][0]).toBe(`#${id}/day/2023-01-01`)
})

test('controls', () => {
  expect.assertions(1)

  const calendar = new CsvEventCalendar({
    target: $('#test-cal')
  })

  calendar.container.empty()

  calendar.controls()

  expect(calendar.container.html()).toBe(`<div class="controls"><button class="btn back"><span class="long">Previous</span><span class="short">&lt;</span></button><h2 aria-live="assertive"><span class="month"><span class="long"></span><span class="short"></span><span class="abbr"></span></span></h2><button class="btn next"><span class="long">Next</span><span class="short">&gt;</span></button><input type="date"><div class="search"><input role="combobox" aria-autocomplete="list" aria-expanded="false" autocomplete="off" type="text" placeholder="Find events by name..." aria-label="Find events by name. Begin typing then press down arrow to access search results" aria-owns="autoComplete${CsvEventCalendar.ids.autoComplete}"><div class="out"></div><div class="filtered" role="listbox" id="autoComplete${CsvEventCalendar.ids.autoComplete}"></div><p class="screenreader message" aria-live="polite"></p></div><fieldset><button class="btn" aria-label="showing month view" aria-expanded="false"><span>View by month</span></button><div class="view-choice"><input name="view-choice" type="radio" id="view${CsvEventCalendar.ids.view - 2}" value="month" aria-checked="true" aria-label="View by month"><label aria-hidden="true" for="view${CsvEventCalendar.ids.view - 2}" aria-label="View by month">month</label></div><div class="view-choice"><input name="view-choice" type="radio" id="view${CsvEventCalendar.ids.view - 1}" value="week" aria-checked="false" aria-label="View by week"><label aria-hidden="true" for="view${CsvEventCalendar.ids.view - 1}" aria-label="View by week">week</label></div><div class="view-choice"><input name="view-choice" type="radio" id="view${CsvEventCalendar.ids.view}" value="day" aria-checked="false" aria-label="View by day"><label aria-hidden="true" for="view${CsvEventCalendar.ids.view}" aria-label="View by day">day</label></div></fieldset></div><div class="alert" aria-live="assertive" aria-modal="true"><div><p></p><button class="btn ok"><span>OK</span></button></div></div>`)})

test('clearSearch', () => {
  expect.assertions(6)

  const calendar = new CsvEventCalendar({
    target: $('#test-cal'),
    url: 'mock-url'
  })

  calendar.search.find('.filtered').show()
  calendar.search.find('.message').show()
  calendar.search.find('input').attr('aria-expanded', true).val('mock-value')
  $('body').append(calendar.search.find('.filtered a'))

  calendar.clearSearch()

  expect(calendar.search.find('.filtered').css('display')).toBe('none')
  expect(calendar.search.find('.message').css('display')).toBe('none')
  expect(calendar.search.find('input').attr('aria-expanded')).toBe('false')
})

describe('autoCompleteOptions', () => {

  const searching = CsvEventCalendar.prototype.searching
  beforeEach(() => {
    CsvEventCalendar.prototype.searching = jest.fn()
  })

  afterEach(() => {
    CsvEventCalendar.prototype.searching = searching
  })

  test('autoCompleteOptions', () => {
    expect.assertions(12)
  
    const calendar = new CsvEventCalendar({
      target: $('#test-cal'),
      url: 'mock-url'
    })
  
    const out = calendar.search.find('.out')
  
    expect(out.children().length).toBe(Object.keys(calendar.eventsIndex.events).length)
    out.children().each((i, a) => {
      const key = $(a).attr('href').split('/')[2]
      const event = calendar.eventsIndex.events[key][0]
      expect($(a).html()).toBe(event.name)
      $(a).trigger('click')
      expect(calendar.state.foundEvent).toBe(event.name)
   })

   expect(calendar.searching).toHaveBeenCalledTimes(0)
  
   calendar.search.trigger('keydown')
   
   expect(calendar.searching).toHaveBeenCalled()
  })
})

test('searching', () => {
  expect.assertions(18)

  const calendar = new CsvEventCalendar({
    target: $('#test-cal'),
    url: 'mock-url'
  })

  const search = calendar.search
  const filtered = search.find('.filtered')
  const preventDefault = jest.fn()

  search.find('.out a').each((i, a) => {
    filtered.append(a)
  })

  $(search.find('.filtered').find('a').get(0)).trigger('focus')

  expect(search.find('input').is(':focus')).toBe(false)

  calendar.searching({target: 'not-found', key: 'ArrowUp', preventDefault})

  expect(search.find('input').is(':focus')).toBe(true)
  expect(preventDefault).toHaveBeenCalledTimes(1)

  $(filtered.find('a').get(1)).trigger('focus')

  expect($(filtered.find('a').get(0)).is(':focus')).toBe(false)

  calendar.searching({target: filtered.find('a').get(1), key: 'ArrowUp', preventDefault})

  expect($(filtered.find('a').get(0)).is(':focus')).toBe(true)
  expect(preventDefault).toHaveBeenCalledTimes(2)

  $(filtered.find('a').get(0)).trigger('focus')

  expect($(filtered.find('a').get(1)).is(':focus')).toBe(false)

  calendar.searching({target: filtered.find('a').get(0), key: 'ArrowDown', preventDefault})

  expect($(filtered.find('a').get(1)).is(':focus')).toBe(true)
  expect(preventDefault).toHaveBeenCalledTimes(3)

  $(filtered.find('a').get(2)).trigger('focus')

  expect($(filtered.find('a').get(0)).is(':focus')).toBe(false)

  calendar.searching({target: filtered.find('a').get(2), key: 'ArrowDown', preventDefault})

  expect($(filtered.find('a').get(0)).is(':focus')).toBe(true)
  expect(preventDefault).toHaveBeenCalledTimes(4)

  $(filtered.find('a').get(2)).trigger('focus')

  expect($(filtered.find('a').get(2)).is(':focus')).toBe(true)

  calendar.searching({target: filtered.find('a').get(2), key: 'SomethingOtherThanUpOrDown', preventDefault})

  expect($(filtered.find('a').get(2)).is(':focus')).toBe(true)
  expect(preventDefault).toHaveBeenCalledTimes(4)
})

test('filterAutoComplete', () => {
  expect.assertions(29)

  const calendar = new CsvEventCalendar({
    target: $('#test-cal'),
    url: 'mock-url'
  })

  const search = calendar.search
  const out = search.find('.out')
  const filtered = search.find('.filtered')
  const input = search.find('input')
  const message = search.find('.message')

  filtered.hide()
  input.val('1')

  expect(input.attr('aria-expanded')).toBe('false')
  expect(filtered.css('display')).toBe('none')

  calendar.filterAutoComplete({key: 'NotArrowDown'})

  expect(filtered.find('a').first().is(':focus')).toBe(false)
  expect(input.attr('aria-expanded')).toBe('true')
  expect(filtered.css('display')).toBe('block') 
  expect(message.html()).toBe('found 1 events matching "1"')
  expect(message.attr('aria-label')).toBe('found 1 events matching "1"')

  filtered.hide()
  input.val('E').attr('aria-expanded', false)
  message.html('').attr('aria-label', '')

  expect(input.attr('aria-expanded')).toBe('false')
  expect(filtered.css('display')).toBe('none')

  calendar.filterAutoComplete({key: 'NotArrowDown'})

  expect(filtered.find('a').first().is(':focus')).toBe(false)
  expect(input.attr('aria-expanded')).toBe('true')
  expect(filtered.css('display')).toBe('block')
  expect(message.html()).toBe('')
  expect(message.attr('aria-label')).toBe('')
  
  filtered.show()
  input.val('')
  message.show()

  calendar.filterAutoComplete({key: 'NotArrowDown'})

  expect(filtered.find('a').first().is(':focus')).toBe(false)
  expect(input.attr('aria-expanded')).toBe('false')
  expect(filtered.css('display')).toBe('none')
  expect(message.css('display')).toBe('none')
  expect(message.html()).toBe('')
  expect(message.attr('aria-label')).toBe('')

  calendar.filterAutoComplete({key: 'ArrowDown'})

  expect(filtered.find('a').first().is(':focus')).toBe(true)
  expect(input.attr('aria-expanded')).toBe('false')
  expect(filtered.css('display')).toBe('none')
  expect(message.css('display')).toBe('none')
  expect(message.html()).toBe('')
  expect(message.attr('aria-label')).toBe('')

})

test('calendar', () => {
  expect.assertions(141)

  const dates = [
    { key: '2022-11-27', date: 27, monthClass: 'prev' },
    { key: '2022-11-28', date: 28, monthClass: 'prev' },
    { key: '2022-11-29', date: 29, monthClass: 'prev' },
    { key: '2022-11-30', date: 30, monthClass: 'prev' },
    { key: '2022-12-01', date: 1, monthClass: 'current' },
    { key: '2022-12-02', date: 2, monthClass: 'current' },
    { key: '2022-12-03', date: 3, monthClass: 'current' },
    { key: '2022-12-04', date: 4, monthClass: 'current' },
    { key: '2022-12-05', date: 5, monthClass: 'current' },
    { key: '2022-12-06', date: 6, monthClass: 'current' },
    { key: '2022-12-07', date: 7, monthClass: 'current' },
    { key: '2022-12-08', date: 8, monthClass: 'current' },
    { key: '2022-12-09', date: 9, monthClass: 'current' },
    { key: '2022-12-10', date: 10, monthClass: 'current' },
    { key: '2022-12-11', date: 11, monthClass: 'current' },
    { key: '2022-12-12', date: 12, monthClass: 'current' },
    { key: '2022-12-13', date: 13, monthClass: 'current' },
    { key: '2022-12-14', date: 14, monthClass: 'current' },
    { key: '2022-12-15', date: 15, monthClass: 'current' },
    { key: '2022-12-16', date: 16, monthClass: 'current' },
    { key: '2022-12-17', date: 17, monthClass: 'current' },
    { key: '2022-12-18', date: 18, monthClass: 'current' },
    { key: '2022-12-19', date: 19, monthClass: 'current' },
    { key: '2022-12-20', date: 20, monthClass: 'current' },
    { key: '2022-12-21', date: 21, monthClass: 'current' },
    { key: '2022-12-22', date: 22, monthClass: 'current' },
    { key: '2022-12-23', date: 23, monthClass: 'current' },
    { key: '2022-12-24', date: 24, monthClass: 'current' },
    { key: '2022-12-25', date: 25, monthClass: 'current' },
    { key: '2022-12-26', date: 26, monthClass: 'current' },
    { key: '2022-12-27', date: 27, monthClass: 'current' },
    { key: '2022-12-28', date: 28, monthClass: 'current' },
    { key: '2022-12-29', date: 29, monthClass: 'current' },
    { key: '2022-12-30', date: 30, monthClass: 'current' },
    { key: '2022-12-31', date: 31, monthClass: 'current' },
    { key: '2023-01-01', date: 1, monthClass: 'next' },
    { key: '2023-01-02', date: 2, monthClass: 'next' },
    { key: '2023-01-03', date: 3, monthClass: 'next' },
    { key: '2023-01-04', date: 4, monthClass: 'next' },
    { key: '2023-01-05', date: 5, monthClass: 'next' },
    { key: '2023-01-06', date: 6, monthClass: 'next' },
    { key: '2023-01-07', date: 7, monthClass: 'next' }
  ]

  const calendar = new CsvEventCalendar({
    target: $('#test-cal')
  })
  
  calendar.day = jest.fn()

  calendar.updateState({key: '2022-12-26'})
  calendar.calendar(dates)

  expect(calendar.day).toHaveBeenCalledTimes(35)

  let weekOfMonth = 0
  for (let dateIdx = 0; dateIdx < 35; dateIdx = dateIdx + 1) {
    expect(calendar.day.mock.calls[dateIdx][0]).toEqual(dates[dateIdx])
    expect(calendar.day.mock.calls[dateIdx][1]).toBe(weekOfMonth)
    expect(calendar.day.mock.calls[dateIdx][2][0].className).toBe('dates')
    expect(calendar.day.mock.calls[dateIdx][2][0].tagName).toEqual('OL')
      if ((dateIdx + 1) % 7 === 0) {
      weekOfMonth = weekOfMonth + 1
    }
  }
})

test('week', () => {
  expect.assertions(93)

  testToday = '2022-12-14'
  
  const keyWeekBefore = '2022-12-07'
  const keyWeekMid = '2022-12-14'
  const keyWeekAfter = '2022-12-21'

  const calendar = new CsvEventCalendar({
    target: $('#test-cal')
  })

  calendar.updateState({key: keyWeekMid})

  const midWeekNo = calendar.container.find(`li.day[data-date-key="${keyWeekMid}"]`).data('week')
  const beforeWeekNo = calendar.container.find(`li.day[data-date-key="${keyWeekBefore}"]`).data('week')
  const afterWeekNo = calendar.container.find(`li.day[data-date-key="${keyWeekAfter}"]`).data('week')
  
  expect(calendar.container.find(`li.day[data-date-key="${keyWeekMid}"]`).hasClass('selected-week')).toBe(true)
  expect(calendar.container.find(`li.day[data-date-key="${keyWeekBefore}"]`).hasClass('selected-week')).toBe(false)
  expect(calendar.container.find(`li.day[data-date-key="${keyWeekAfter}"]`).hasClass('selected-week')).toBe(false)
  calendar.container.find(`.week-${midWeekNo}`).each((i, li) => {
    expect($(li).hasClass('start-of-week')).toBe(i === 0)
    expect($(li).hasClass('selected-week')).toBe(true)
  })

  calendar.container.find(`.week-${beforeWeekNo}`).each(li => {
    expect($(li).hasClass('selected-week')).toBe(false)
  })
  calendar.container.find(`.week-${afterWeekNo}`).each(li => {
    expect($(li).hasClass('selected-week')).toBe(false)
  })

  calendar.updateState({key: keyWeekBefore})

  calendar.week()

  expect(calendar.container.find(`li.day[data-date-key="${keyWeekMid}"]`).hasClass('selected-week')).toBe(false)
  expect(calendar.container.find(`li.day[data-date-key="${keyWeekBefore}"]`).hasClass('selected-week')).toBe(true)
  expect(calendar.container.find(`li.day[data-date-key="${keyWeekAfter}"]`).hasClass('selected-week')).toBe(false)
  calendar.container.find(`.week-${beforeWeekNo}`).each((i, li) => {
    expect($(li).hasClass('start-of-week')).toBe(i === 0)
    expect($(li).hasClass('selected-week')).toBe(true)
  })

  calendar.container.find(`.week-${midWeekNo}`).each(li => {
    expect($(li).hasClass('selected-week')).toBe(false)
  })
  calendar.container.find(`.week-${afterWeekNo}`).each(li => {
    expect($(li).hasClass('selected-week')).toBe(false)
  })

  calendar.updateState({key: keyWeekAfter})

  calendar.week()

  expect(calendar.container.find(`li.day[data-date-key="${keyWeekMid}"]`).hasClass('selected-week')).toBe(false)
  expect(calendar.container.find(`li.day[data-date-key="${keyWeekBefore}"]`).hasClass('selected-week')).toBe(false)
  expect(calendar.container.find(`li.day[data-date-key="${keyWeekAfter}"]`).hasClass('selected-week')).toBe(true)
  calendar.container.find(`.week-${afterWeekNo}`).each((i, li) => {
    expect($(li).hasClass('start-of-week')).toBe(i === 0)
    expect($(li).hasClass('selected-week')).toBe(true)
  })

  calendar.container.find(`.week-${midWeekNo}`).each(li => {
    expect($(li).hasClass('selected-week')).toBe(false)
  })
  calendar.container.find(`.week-${beforeWeekNo}`).each(li => {
    expect($(li).hasClass('selected-week')).toBe(false)
  })
})

test('day', () => {
  expect.assertions(16)

  const today = CsvEventCalendar.getToday()
  const keyToday = CsvEventCalendar.dateKey(today)
  const date = { key: keyToday, date: today.getDate(), monthClass: 'current' }
  const month = $('<ol class="dates"></ol>')
  const weekOfMonth = Math.round(today.getDate() / 7) - 1

  const calendar = new CsvEventCalendar({
    target: $('#test-cal')
  })

  const domEvent = $.Event('click')
  domEvent.preventDefault = jest.fn()

  calendar.updateHash = jest.fn()

  calendar.title = jest.fn(options => {
    expect(options.key).toBe(keyToday)
    return {
      day: {
        long: 'long title',
        medium: 'medium title',
        short: 'short title',
        abbr: 'abbr title'
      }
    }
  })

  const day = calendar.day(date, weekOfMonth, month)

  expect(month.children().length).toBe(1)
  expect(month.children().get(0)).toBe(day.get(0))
  expect(day[0].tagName).toBe('LI')
  expect(day.hasClass('day')).toBe(true)
  expect(day.hasClass('current-mo')).toBe(true)
  expect(day.hasClass(`week-${weekOfMonth}`)).toBe(true)
  expect(day.attr('data-date-key')).toBe(date.key)
  expect(day.html()).toBe(`<a class="prev-view"></a><h3><a class="name" href="#calendar${CsvEventCalendar.ids.calendar}/day/${date.key}"><span class="long">long title</span><span class="medium">medium title</span><span class="abbr">abbr title</span><span class="short">short title</span></a></h3><div class="events"></div>`)

  day.trigger(domEvent)

  expect(calendar.updateHash).toHaveBeenCalledTimes(0)
  expect(domEvent.preventDefault).toHaveBeenCalledTimes(0)

  day.addClass('has-events').trigger(domEvent)

  expect(calendar.updateHash).toHaveBeenCalledTimes(1)
  expect(calendar.updateHash.mock.calls[0][0]).toBe(`#calendar${CsvEventCalendar.ids.calendar}/day/${date.key}`)
  expect(domEvent.preventDefault).toHaveBeenCalledTimes(1)

  calendar.updateState({view: 'week'})
  day.trigger(domEvent)

  expect(calendar.updateHash).toHaveBeenCalledTimes(1)
  expect(domEvent.preventDefault).toHaveBeenCalledTimes(1)
})

describe('view', () => {

  let monthViewSpy
  let weekViewSpy
  let dayViewSpy
  let focusSpy
  beforeEach(() => {
    monthViewSpy = jest.spyOn(CsvEventCalendar.prototype, 'monthView')
    weekViewSpy = jest.spyOn(CsvEventCalendar.prototype, 'weekView')
    dayViewSpy = jest.spyOn(CsvEventCalendar.prototype, 'dayView')
    focusSpy = jest.spyOn(CsvEventCalendar.prototype, 'focus')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('view - called from constructor', () => {
    expect.assertions(227)
  
    const today = CsvEventCalendar.getToday()
    const keyToday = CsvEventCalendar.dateKey(today)
  
    const calendar = new CsvEventCalendar({
      target: '#test-cal',
      url: 'mock-url'
    })
  
    const container = calendar.container
    const view = container.find('.view')
    const title = container.find('.controls h2')
    const next = container.find('.controls .next')
    const back = container.find('.controls .back')
  
    const yyyy = CsvEventCalendar.yearNumber(keyToday)
    const m = CsvEventCalendar.monthNumber(keyToday)
    const month = CsvEventCalendar.monthName(keyToday)
    const mm = month.substring(0, 3)
  
    expect(calendar.state.view).toBe('month')
    expect(view.hasClass('month')).toBe(true)
    expect(view.hasClass('week')).toBe(false)
    expect(view.hasClass('day')).toBe(false)
    expect(title.html()).toBe(`<span class="month"><span class="long">${month} ${yyyy}</span><span class="short">${mm} ${yyyy}</span><span class="abbr">${m}/${yyyy}</span></span>`)
    expect(next.attr('aria-label')).toBe('next month')
    expect(next.attr('title')).toBe('next month')
    expect(back.attr('aria-label')).toBe('previous month')
    expect(back.attr('title')).toBe('previous month')
    expect(view.attr('aria-label')).toBeUndefined()
  
    container.find('.day a.name').each((i, a) => {
      expect($(a).attr('aria-live')).toBeUndefined()
    })
  
    expect(container.find('.day a[data-old-label]').length).toBe(0)
  
    container.find('.day a.prev-view').each((i, a) => {
      expect($(a).attr('aria-label')).toBeUndefined()
      expect($(a).attr('title')).toBeUndefined()
      expect($(a).attr('href')).toBeUndefined()
    })

    container.find('.view .day[aria-hidden="true"] a.prev-view').each((i, a) => {
      expect($(a).attr('tabindex')).toBe('-1')
    })

    container.find('.view .day a').each((i, a) => {
      const aria = $(a).attr('aria-hidden')
      const download = $(a).attr('download')
      if (aria !== 'true' && !download) {
        expect($(a).attr('tabindex')).toBeUndefined()
      }
    })

    expect(container.find(`.view .day[data-date-key="${keyToday}"]`).hasClass('today')).toBe(true)

    expect(monthViewSpy).toHaveBeenCalledTimes(2)
    expect(focusSpy).toHaveBeenCalledTimes(1)
  })

  test('view - change to week', () => {
    expect.assertions(227)
  
    const today = CsvEventCalendar.getToday()
    const keyToday = CsvEventCalendar.dateKey(today)
  
    const calendar = new CsvEventCalendar({
      target: '#test-cal',
      url: 'mock-url'
    })
  
    const container = calendar.container
    const view = container.find('.view')
    const title = container.find('.controls h2')
    const next = container.find('.controls .next')
    const back = container.find('.controls .back')
  
    const yyyy = CsvEventCalendar.yearNumber(keyToday)
    const m = CsvEventCalendar.monthNumber(keyToday)
    const month = CsvEventCalendar.monthName(keyToday)
    const mm = month.substring(0, 3)
  
    calendar.view('week')

    expect(calendar.state.view).toBe('week')
    expect(view.hasClass('month')).toBe(false)
    expect(view.hasClass('week')).toBe(true)
    expect(view.hasClass('day')).toBe(false)
    expect(title.html()).toBe(`<span class="month"><span class="long">${month} ${yyyy}</span><span class="short">${mm} ${yyyy}</span><span class="abbr">${m}/${yyyy}</span></span>`)
    expect(next.attr('aria-label')).toBe('next week')
    expect(next.attr('title')).toBe('next week')
    expect(back.attr('aria-label')).toBe('previous week')
    expect(back.attr('title')).toBe('previous week')
    expect(view.attr('aria-label')).toBeUndefined()
  
    container.find('.day a.name').each((i, a) => {
      expect($(a).attr('aria-live')).toBeUndefined()
    })
  
    expect(container.find('.day a[data-old-label]').length).toBe(0)
  
    container.find('.day a.prev-view').each((i, a) => {
      expect($(a).attr('aria-label')).toBe('return to month view')
      expect($(a).attr('title')).toBe('return to month view')
      expect($(a).attr('href')).toBe(`#calendar${CsvEventCalendar.ids.calendar}/month/${keyToday}`)
    })

    container.find('.view .day[aria-hidden="true"] a.prev-view').each((i, a) => {
      expect($(a).attr('tabindex')).toBe('-1')
    })

    container.find('.view .day a').each((i, a) => {
      const aria = $(a).attr('aria-hidden')
      const download = $(a).attr('download')
      if (aria !== 'true' && !download) {
        expect($(a).attr('tabindex')).toBeUndefined()
      }
    })

    expect(container.find(`.view .day[data-date-key="${keyToday}"]`).hasClass('today')).toBe(true)

    expect(monthViewSpy).toHaveBeenCalledTimes(2)
    expect(focusSpy).toHaveBeenCalledTimes(2)
  })

  test('view - change to day', () => {
    expect.assertions(227)
  
    const today = CsvEventCalendar.getToday()
    const keyToday = CsvEventCalendar.dateKey(today)
  
    const calendar = new CsvEventCalendar({
      target: '#test-cal',
      url: 'mock-url'
    })
  
    const container = calendar.container
    const view = container.find('.view')
    const title = container.find('.controls h2')
    const next = container.find('.controls .next')
    const back = container.find('.controls .back')
  
    const yyyy = CsvEventCalendar.yearNumber(keyToday)
    const m = CsvEventCalendar.monthNumber(keyToday)
    const month = CsvEventCalendar.monthName(keyToday)
    const mm = month.substring(0, 3)
  
    calendar.view('day')

    expect(calendar.state.view).toBe('day')
    expect(view.hasClass('month')).toBe(false)
    expect(view.hasClass('week')).toBe(false)
    expect(view.hasClass('day')).toBe(true)
    expect(title.html()).toBe(`<span class="month"><span class="long">${month} ${yyyy}</span><span class="short">${mm} ${yyyy}</span><span class="abbr">${m}/${yyyy}</span></span>`)
    expect(next.attr('aria-label')).toBe('next day')
    expect(next.attr('title')).toBe('next day')
    expect(back.attr('aria-label')).toBe('previous day')
    expect(back.attr('title')).toBe('previous day')
    expect(view.attr('aria-label')).toBeUndefined()
  
    container.find('.day a.name').each((i, a) => {
      expect($(a).attr('aria-live')).toBeUndefined()
    })
  
    expect(container.find('.day a[data-old-label]').length).toBe(0)
  
    container.find('.day a.prev-view').each((i, a) => {
      expect($(a).attr('aria-label')).toBe('return to month view')
      expect($(a).attr('title')).toBe('return to month view')
      expect($(a).attr('href')).toBe(`#calendar${CsvEventCalendar.ids.calendar}/month/${keyToday}`)
    })

    container.find('.view .day[aria-hidden="true"] a.prev-view').each((i, a) => {
      expect($(a).attr('tabindex')).toBe('-1')
    })

    container.find('.view .day a').each((i, a) => {
      const aria = $(a).attr('aria-hidden')
      const download = $(a).attr('download')
      if (aria !== 'true' && !download) {
        expect($(a).attr('tabindex')).toBeUndefined()
      }
    })

    expect(container.find(`.view .day[data-date-key="${keyToday}"]`).hasClass('today')).toBe(true)

    expect(monthViewSpy).toHaveBeenCalledTimes(2)
    expect(focusSpy).toHaveBeenCalledTimes(2)
  })

  test('view - change to month', () => {
    expect.assertions(227)
  
    const today = CsvEventCalendar.getToday()
    const keyToday = CsvEventCalendar.dateKey(today)
  
    const calendar = new CsvEventCalendar({
      target: '#test-cal',
      url: 'mock-url'
    })
  
    const container = calendar.container
    const view = container.find('.view')
    const title = container.find('.controls h2')
    const next = container.find('.controls .next')
    const back = container.find('.controls .back')
  
    const yyyy = CsvEventCalendar.yearNumber(keyToday)
    const m = CsvEventCalendar.monthNumber(keyToday)
    const month = CsvEventCalendar.monthName(keyToday)
    const mm = month.substring(0, 3)
  
    calendar.view('day')
    calendar.view('month')

    expect(calendar.state.view).toBe('month')
    expect(view.hasClass('month')).toBe(true)
    expect(view.hasClass('week')).toBe(false)
    expect(view.hasClass('day')).toBe(false)
    expect(title.html()).toBe(`<span class="month"><span class="long">${month} ${yyyy}</span><span class="short">${mm} ${yyyy}</span><span class="abbr">${m}/${yyyy}</span></span>`)
    expect(next.attr('aria-label')).toBe('next month')
    expect(next.attr('title')).toBe('next month')
    expect(back.attr('aria-label')).toBe('previous month')
    expect(back.attr('title')).toBe('previous month')
    expect(view.attr('aria-label')).toBeUndefined()
  
    container.find('.day a.name').each((i, a) => {
      expect($(a).attr('aria-live')).toBeUndefined()
    })
  
    expect(container.find('.day a[data-old-label]').length).toBe(0)
  
    container.find('.day a.prev-view').each((i, a) => {
      expect($(a).attr('aria-label')).toBeUndefined()
      expect($(a).attr('title')).toBeUndefined()
      expect($(a).attr('href')).toBeUndefined()
    })

    container.find('.view .day[aria-hidden="true"] a.prev-view').each((i, a) => {
      expect($(a).attr('tabindex')).toBe('-1')
    })

    container.find('.view .day a').each((i, a) => {
      const aria = $(a).attr('aria-hidden')
      const download = $(a).attr('download')
      if (aria !== 'true' && !download) {
        expect($(a).attr('tabindex')).toBeUndefined()
      }
    })

    expect(container.find(`.view .day[data-date-key="${keyToday}"]`).hasClass('today')).toBe(true)

    expect(monthViewSpy).toHaveBeenCalledTimes(3)
    expect(focusSpy).toHaveBeenCalledTimes(3)
  })

})

describe('viewDesc', () => {

  const today = CsvEventCalendar.getToday()
  const keyToday = CsvEventCalendar.dateKey(today)

  test('viewDesc - month - 0 event - no foundEvent', () => {
    expect.assertions(4)

    const calendar = new CsvEventCalendar({
      target: '#test-cal'
    })

    const desc = calendar.container.find('.view-desc a')
    const long = desc.find('.long')
    const medium = desc.find('.medium')
    const abbr = desc.find('.abbr')

    calendar.viewDesc('month', keyToday, 0)

    expect(long.html()).toBe('Showing 0 scheduled events')
    expect(medium.html()).toBe('Showing 0 scheduled events')
    expect(abbr.html()).toBe('Showing 0 events')
    expect(desc.attr('aria-label')).toBe('Showing 0 scheduled events')
  })

  test('viewDesc - month - 1 event - no foundEvent', () => {
    expect.assertions(4)

    const calendar = new CsvEventCalendar({
      target: '#test-cal'
    })

    const desc = calendar.container.find('.view-desc a')
    const long = desc.find('.long')
    const medium = desc.find('.medium')
    const abbr = desc.find('.abbr')

    calendar.viewDesc('month', keyToday, 1)

    expect(long.html()).toBe('Showing 1 scheduled event')
    expect(medium.html()).toBe('Showing 1 scheduled event')
    expect(abbr.html()).toBe('Showing 1 event')
    expect(desc.attr('aria-label')).toBe('Showing 1 scheduled event')
  })

  test('viewDesc - month - 1 event - has foundEvent', () => {
    expect.assertions(4)

    const calendar = new CsvEventCalendar({
      target: '#test-cal'
    })

    calendar.state.foundEvent = 'mock-event-name'

    const desc = calendar.container.find('.view-desc a')
    const long = desc.find('.long')
    const medium = desc.find('.medium')
    const abbr = desc.find('.abbr')

    calendar.viewDesc('month', keyToday, 1)

    expect(long.html()).toBe('Showing 1 scheduled event')
    expect(medium.html()).toBe('Showing 1 scheduled event')
    expect(abbr.html()).toBe('Showing 1 event')
    expect(desc.attr('aria-label')).toBe('Showing details for "mock-event-name" scheduled')
  })

  test('viewDesc - month - 2 events - no foundEvent', () => {
    expect.assertions(4)

    const calendar = new CsvEventCalendar({
      target: '#test-cal'
    })

    const desc = calendar.container.find('.view-desc a')
    const long = desc.find('.long')
    const medium = desc.find('.medium')
    const abbr = desc.find('.abbr')

    calendar.viewDesc('month', keyToday, 2)

    expect(long.html()).toBe('Showing 2 scheduled events')
    expect(medium.html()).toBe('Showing 2 scheduled events')
    expect(abbr.html()).toBe('Showing 2 events')
    expect(desc.attr('aria-label')).toBe('Showing 2 scheduled events')
  })

  test('viewDesc - month - 2 events - has foundEvent', () => {
    expect.assertions(4)

    const calendar = new CsvEventCalendar({
      target: '#test-cal'
    })

    calendar.state.foundEvent = 'mock-event-name'

    const desc = calendar.container.find('.view-desc a')
    const long = desc.find('.long')
    const medium = desc.find('.medium')
    const abbr = desc.find('.abbr')

    calendar.viewDesc('month', keyToday, 2)

    expect(long.html()).toBe('Showing 2 scheduled events')
    expect(medium.html()).toBe('Showing 2 scheduled events')
    expect(abbr.html()).toBe('Showing 2 events')
    expect(desc.attr('aria-label')).toBe('Showing details for "mock-event-name", and 1 other scheduled events')
  })

  test('viewDesc - week - 0 events - no foundEvent', () => {
    expect.assertions(4)

    const calendar = new CsvEventCalendar({
      target: '#test-cal'
    })

    const title = calendar.title({key: keyToday})

    const desc = calendar.container.find('.view-desc a')
    const long = desc.find('.long')
    const medium = desc.find('.medium')
    const abbr = desc.find('.abbr')

    calendar.viewDesc('week', keyToday, 0)

    expect(long.html()).toBe(`Showing 0 scheduled events for week of ${title.day.long}`)
    expect(medium.html()).toBe(`Showing 0 events for week of ${title.day.medium}`)
    expect(abbr.html()).toBe(`0 events for week of ${title.day.abbr.substring(4)}`)
    expect(desc.attr('aria-label')).toBe(`Showing 0 scheduled events for week of ${title.day.long}`)
  })

  test('viewDesc - week - 1 event - no foundEvent', () => {
    expect.assertions(4)

    const calendar = new CsvEventCalendar({
      target: '#test-cal'
    })

    const title = calendar.title({key: keyToday})

    const desc = calendar.container.find('.view-desc a')
    const long = desc.find('.long')
    const medium = desc.find('.medium')
    const abbr = desc.find('.abbr')

    calendar.viewDesc('week', keyToday, 1)

    expect(long.html()).toBe(`Showing 1 scheduled event for week of ${title.day.long}`)
    expect(medium.html()).toBe(`Showing 1 event for week of ${title.day.medium}`)
    expect(abbr.html()).toBe(`1 event for week of ${title.day.abbr.substring(4)}`)
    expect(desc.attr('aria-label')).toBe(`Showing 1 scheduled event for week of ${title.day.long}`)
  })

  test('viewDesc - week - 1 event - has foundEvent', () => {
    expect.assertions(4)

    const calendar = new CsvEventCalendar({
      target: '#test-cal'
    })

    calendar.state.foundEvent = 'mock-event-name'

    const title = calendar.title({key: keyToday})

    const desc = calendar.container.find('.view-desc a')
    const long = desc.find('.long')
    const medium = desc.find('.medium')
    const abbr = desc.find('.abbr')

    calendar.viewDesc('week', keyToday, 1)

    expect(long.html()).toBe(`Showing 1 scheduled event for week of ${title.day.long}`)
    expect(medium.html()).toBe(`Showing 1 event for week of ${title.day.medium}`)
    expect(abbr.html()).toBe(`1 event for week of ${title.day.abbr.substring(4)}`)
    expect(desc.attr('aria-label')).toBe(`Showing details for "mock-event-name" scheduled for week of ${title.day.long}`)
  })

  test('viewDesc - week - 2 events - no foundEvent', () => {
    expect.assertions(4)

    const calendar = new CsvEventCalendar({
      target: '#test-cal'
    })

    const title = calendar.title({key: keyToday})

    const desc = calendar.container.find('.view-desc a')
    const long = desc.find('.long')
    const medium = desc.find('.medium')
    const abbr = desc.find('.abbr')

    calendar.viewDesc('week', keyToday, 2)

    expect(long.html()).toBe(`Showing 2 scheduled events for week of ${title.day.long}`)
    expect(medium.html()).toBe(`Showing 2 events for week of ${title.day.medium}`)
    expect(abbr.html()).toBe(`2 events for week of ${title.day.abbr.substring(4)}`)
    expect(desc.attr('aria-label')).toBe(`Showing 2 scheduled events for week of ${title.day.long}`)
  })

  test('viewDesc - week - 2 events - has foundEvent', () => {
    expect.assertions(4)

    const calendar = new CsvEventCalendar({
      target: '#test-cal'
    })

    calendar.state.foundEvent = 'mock-event-name'

    const title = calendar.title({key: keyToday})

    const desc = calendar.container.find('.view-desc a')
    const long = desc.find('.long')
    const medium = desc.find('.medium')
    const abbr = desc.find('.abbr')

    calendar.viewDesc('week', keyToday, 2)

    expect(long.html()).toBe(`Showing 2 scheduled events for week of ${title.day.long}`)
    expect(medium.html()).toBe(`Showing 2 events for week of ${title.day.medium}`)
    expect(abbr.html()).toBe(`2 events for week of ${title.day.abbr.substring(4)}`)
    expect(desc.attr('aria-label')).toBe(`Showing details for "mock-event-name", and 1 other scheduled events for week of ${title.day.long}`)
  })

  test('viewDesc - day - 0 events - no foundEvent', () => {
    expect.assertions(4)

    const calendar = new CsvEventCalendar({
      target: '#test-cal'
    })

    const title = calendar.title({key: keyToday})

    const desc = calendar.container.find('.view-desc a')
    const long = desc.find('.long')
    const medium = desc.find('.medium')
    const abbr = desc.find('.abbr')

    calendar.viewDesc('day', keyToday, 0)

    expect(long.html()).toBe(`There no scheduled events on ${title.day.long}`)
    expect(medium.html()).toBe(`No scheduled events on ${title.day.medium}`)
    expect(abbr.html()).toBe(`No events on ${title.day.abbr}`)
    expect(desc.attr('aria-label')).toBe(`There no scheduled events on ${title.day.long}`)
  })

  test('viewDesc - day - 1 event - has foundEvent', () => {
    expect.assertions(4)

    const calendar = new CsvEventCalendar({
      target: '#test-cal'
    })

    calendar.state.foundEvent = 'mock-event-name'

    const title = calendar.title({key: keyToday})

    const desc = calendar.container.find('.view-desc a')
    const long = desc.find('.long')
    const medium = desc.find('.medium')
    const abbr = desc.find('.abbr')

    calendar.viewDesc('day', keyToday, 1)

    expect(long.html()).toBe(`Showing 1 scheduled event on ${title.day.long}`)
    expect(medium.html()).toBe(`Showing 1 event on ${title.day.medium}`)
    expect(abbr.html()).toBe(`1 event on ${title.day.abbr}`)
    expect(desc.attr('aria-label')).toBe(`Showing details for "mock-event-name" scheduled on ${title.day.long}`)
  })

  test('viewDesc - day - 2 events - has foundEvent', () => {
    expect.assertions(4)

    const calendar = new CsvEventCalendar({
      target: '#test-cal'
    })

    calendar.state.foundEvent = 'mock-event-name'

    const title = calendar.title({key: keyToday})

    const desc = calendar.container.find('.view-desc a')
    const long = desc.find('.long')
    const medium = desc.find('.medium')
    const abbr = desc.find('.abbr')

    calendar.viewDesc('day', keyToday, 2)

    expect(long.html()).toBe(`Showing 2 scheduled events on ${title.day.long}`)
    expect(medium.html()).toBe(`Showing 2 events on ${title.day.medium}`)
    expect(abbr.html()).toBe(`2 events on ${title.day.abbr}`)
    expect(desc.attr('aria-label')).toBe(`Showing details for "mock-event-name", and 1 other scheduled events on ${title.day.long}`)
  })

})

describe('monthView', () => {

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('monthView', () => {
    expect.assertions(19)

    testToday = '2023-10-20'

    const calendar = new CsvEventCalendar({
      target: '#test-cal',
      url: 'mock-url'
    })

    const previousMonthSpy = jest.spyOn(calendar, 'previousMonth')
    const currentMonthSpy = jest.spyOn(calendar, 'currentMonth')
    const nextMonthSpy = jest.spyOn(calendar, 'nextMonth')
    const calendarSpy = jest.spyOn(calendar, 'calendar')
    const populateSpy = jest.spyOn(calendar, 'populate')
    const viewDescSpy = jest.spyOn(calendar, 'viewDesc')

    const expectedDates = [
      {date: 1,  key: '2023-10-01',  monthClass: 'current'},
      {date: 2,  key: '2023-10-02',  monthClass: 'current'},
      {date: 3,  key: '2023-10-03',  monthClass: 'current'},
      {date: 4,  key: '2023-10-04',  monthClass: 'current'},
      {date: 5,  key: '2023-10-05',  monthClass: 'current'},
      {date: 6,  key: '2023-10-06',  monthClass: 'current'},
      {date: 7,  key: '2023-10-07',  monthClass: 'current'},
      {date: 8,  key: '2023-10-08',  monthClass: 'current'},
      {date: 9,  key: '2023-10-09',  monthClass: 'current'},
      {date: 10,  key: '2023-10-10',  monthClass: 'current'},
      {date: 11,  key: '2023-10-11',  monthClass: 'current'},
      {date: 12,  key: '2023-10-12',  monthClass: 'current'},
      {date: 13,  key: '2023-10-13',  monthClass: 'current'},
      {date: 14,  key: '2023-10-14',  monthClass: 'current'},
      {date: 15,  key: '2023-10-15',  monthClass: 'current'},
      {date: 16,  key: '2023-10-16',  monthClass: 'current'},
      {date: 17,  key: '2023-10-17',  monthClass: 'current'},
      {date: 18,  key: '2023-10-18',  monthClass: 'current'},
      {date: 19,  key: '2023-10-19',  monthClass: 'current'},
      {date: 20,  key: '2023-10-20',  monthClass: 'current'},
      {date: 21,  key: '2023-10-21',  monthClass: 'current'},
      {date: 22,  key: '2023-10-22',  monthClass: 'current'},
      {date: 23,  key: '2023-10-23',  monthClass: 'current'},
      {date: 24,  key: '2023-10-24',  monthClass: 'current'},
      {date: 25,  key: '2023-10-25',  monthClass: 'current'},
      {date: 26,  key: '2023-10-26',  monthClass: 'current'},
      {date: 27,  key: '2023-10-27',  monthClass: 'current'},
      {date: 28,  key: '2023-10-28',  monthClass: 'current'},
      {date: 29,  key: '2023-10-29',  monthClass: 'current'},
      {date: 30,  key: '2023-10-30',  monthClass: 'current'},
      {date: 31,  key: '2023-10-31',  monthClass: 'current'},
      {date: 1,  key: '2023-11-01',  monthClass: 'next'},
      {date: 2,  key: '2023-11-02',  monthClass: 'next'},
      {date: 3,  key: '2023-11-03',  monthClass: 'next'},
      {date: 4,  key: '2023-11-04',  monthClass: 'next'},
      {date: 5,  key: '2023-11-05',  monthClass: 'next'},
      {date: 6,  key: '2023-11-06',  monthClass: 'next'},
      {date: 7,  key: '2023-11-07',  monthClass: 'next'},
      {date: 8,  key: '2023-11-08',  monthClass: 'next'},
      {date: 9,  key: '2023-11-09',  monthClass: 'next'},
      {date: 10,  key: '2023-11-10',  monthClass: 'next'},
      {date: 11,  key: '2023-11-11',  monthClass: 'next'}
    ]

    calendar.monthView()

    const receivedDates = calendarSpy.mock.calls[0][0]

    expect(previousMonthSpy).toHaveBeenCalledTimes(1)
    expect(currentMonthSpy).toHaveBeenCalledTimes(1)
    expect(nextMonthSpy).toHaveBeenCalledTimes(1)
    expect(calendarSpy).toHaveBeenCalledTimes(1)
    expect(populateSpy).toHaveBeenCalledTimes(1)
    expect(viewDescSpy).toHaveBeenCalledTimes(1)

    expect(previousMonthSpy.mock.calls[0][0]).toBe(receivedDates)
    expect(currentMonthSpy.mock.calls[0][0]).toBe(receivedDates)
    expect(nextMonthSpy.mock.calls[0][0]).toBe(receivedDates)
    expect(calendarSpy.mock.calls[0][0]).toBe(receivedDates)
    expect(calendarSpy.mock.calls[0][0]).toBe(receivedDates)
    expect(receivedDates).toEqual(expectedDates)

    expect(calendar.container.find('.view .event a').attr('tabindex')).toBe('-1')

    expect(viewDescSpy.mock.calls[0][0]).toBe('month')
    expect(viewDescSpy.mock.calls[0][1]).toBe('2023-10-20')
    expect(viewDescSpy.mock.calls[0][2]).toBe(3)
  })

})

describe('weekView', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('weekView', () => {
    expect.assertions(7)

    testToday = '2023-10-20'

    const calendar = new CsvEventCalendar({
      target: '#test-cal',
      url: 'mock-url'
    })
  
    const viewDescSpy = jest.spyOn(calendar, 'viewDesc')

    calendar.weekView()

    expect(viewDescSpy).toHaveBeenCalledTimes(1)
  
    expect(viewDescSpy.mock.calls[0][0]).toBe('week')
    expect(viewDescSpy.mock.calls[0][1]).toBe('2023-10-15')
    expect(viewDescSpy.mock.calls[0][2]).toBe(2)
})

})

describe('dayView', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('dayView - eventCount = 1', () => {
    expect.assertions(9)

    testToday = '2023-10-20'

    const calendar = new CsvEventCalendar({
      target: '#test-cal',
      url: 'mock-url',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    })
  
    calendar.state.foundEvent = 'mock-event-name'

    const viewDescSpy = jest.spyOn(calendar, 'viewDesc')

    calendar.dayView()

    expect(viewDescSpy).toHaveBeenCalledTimes(1)
    expect(viewDescSpy.mock.calls[0][0]).toBe('day')
    expect(viewDescSpy.mock.calls[0][1]).toBe('2023-10-20')
    expect(viewDescSpy.mock.calls[0][2]).toBe(1)
    expect(calendar.container.find('.day[data-date-key="2023-10-20"]').hasClass('selected')).toBe(true)
    expect(calendar.state.foundEvent).toBeNull()
  })

  test('dayView - eventCount = 0', () => {
    expect.assertions(9)

    testToday = '2023-10-20'

    const calendar = new CsvEventCalendar({
      target: '#test-cal',
      url: 'mock-url',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    })
  
    calendar.state.foundEvent = 'mock-event-name'

    const viewDescSpy = jest.spyOn(calendar, 'viewDesc')

    calendar.updateState({key: '2023-10-19'})
    calendar.dayView()

    expect(viewDescSpy).toHaveBeenCalledTimes(1)
    expect(viewDescSpy.mock.calls[0][0]).toBe('day')
    expect(viewDescSpy.mock.calls[0][1]).toBe('2023-10-19')
    expect(viewDescSpy.mock.calls[0][2]).toBe(0)
    expect(calendar.container.find('.day[data-date-key="2023-10-19"]').hasClass('selected')).toBe(true)
    expect(calendar.state.foundEvent).toBeNull()
  })

})

describe('populate', () => {

  const populate = CsvEventCalendar.prototype.populate
  const week = CsvEventCalendar.prototype.week
  beforeEach(() => {
    CsvEventCalendar.prototype.populate = jest.fn()
    CsvEventCalendar.prototype.week = jest.fn()
  })

  afterEach(() => {
    CsvEventCalendar.prototype.populate = populate
    CsvEventCalendar.prototype.week = week
    mockResponse = 'csvResponse'
  })

  test('populate - eventsIndex is ready - no mulit-event days', () => {
    expect.assertions(216)

    testToday = '2027-01-01'
    
    const keyBefore = '2026-12-30'
    const keyAfter = '2027-01-03'

    const calendar = new CsvEventCalendar({
      target: '#test-cal',
      url: 'mock-url'
    })

    const container = calendar.container
    const dayNodes = calendar.container.find('.view li.day')

    expect(calendar.populate).toHaveBeenCalledTimes(2)
    expect(calendar.week).toHaveBeenCalledTimes(0)

    calendar.populate = populate

    calendar.populate()

    expect(calendar.week).toHaveBeenCalledTimes(1)

    dayNodes.each((i, dayNode) => {
      const a = $(dayNode).find('h3 a')
      const key = $(dayNode).attr('data-date-key')
      const events = calendar.eventsIndex.events[key]
      const eventCount = events && events.length || 0
      const hasEvents = eventCount > 0
      const eventsNode = $(dayNode).find('.events')
      const eventHtml = hasEvents ? `<div class="event">${events[0].html().html()}</div>` : '<div class="no-events">no events scheduled</div>'
      
      expect(eventsNode.parent()[0]).toBe(dayNode)
      expect(container.find(`[data-date-key="${key}"]`).hasClass('has-events')).toBe(hasEvents)
      expect(eventsNode.html()).toBe(eventHtml)
      expect($(dayNode).hasClass('selected')).toBe(key === testToday)
      
      if (hasEvents) {
        expect(a.attr('href')).toBe(`#${container.attr('id')}/day/${key}`)
      } else {
        expect(a.attr('href')).toBeUndefined()
      }
    })
  })

  test('populate - eventsIndex is ready - has mulit-event days', () => {
    expect.assertions(216)

    testToday = '2027-01-01'
    mockResponse = 'mulitEventCsvResponse'

    const calendar = new CsvEventCalendar({
      target: '#test-cal',
      url: 'mock-url'
    })

    const container = calendar.container
    const dayNodes = calendar.container.find('.view li.day')

    expect(calendar.populate).toHaveBeenCalledTimes(2)
    expect(calendar.week).toHaveBeenCalledTimes(0)

    calendar.populate = populate

    calendar.populate()

    expect(calendar.week).toHaveBeenCalledTimes(1)

    dayNodes.each((i, dayNode) => {
      const a = $(dayNode).find('h3 a')
      const key = $(dayNode).attr('data-date-key')
      const events = calendar.eventsIndex.events[key]
      const eventCount = events && events.length || 0
      const hasEvents = eventCount > 0
      const eventsNode = $(dayNode).find('.events')

      if (hasEvents) {
        const div = $('<div></div>')
        events.forEach(event => {
          div.append(`<div class="event">${event.html().html()}</div>`)
        })
        expect(eventsNode.html()).toBe(div.html())
      } else {
        expect(eventsNode.html()).toBe('<div class="no-events">no events scheduled</div>')        
      }

      expect(eventsNode.parent()[0]).toBe(dayNode)
      expect(container.find(`[data-date-key="${key}"]`).hasClass('has-events')).toBe(hasEvents)
      expect($(dayNode).hasClass('selected')).toBe(key === testToday)
      
      if (hasEvents) {
        expect(a.attr('href')).toBe(`#${container.attr('id')}/day/${key}`)
      } else {
        expect(a.attr('href')).toBeUndefined()
      }
    })
  })

  test('populate - eventsIndex is not ready', () => {
    expect.assertions(300)

    testToday = '2027-01-01'
    mockResponse = 'mulitEventCsvResponse'

    const calendar = new CsvEventCalendar({
      target: '#test-cal'
    })

    const container = calendar.container
    const dayNodes = calendar.container.find('.view-wo-events li.day')

    expect(calendar.eventsIndex.ready).toBe(false)
    expect(calendar.populate).toHaveBeenCalledTimes(2)
    expect(calendar.week).toHaveBeenCalledTimes(0)

    calendar.populate = populate

    calendar.populate()

    expect(calendar.eventsIndex.ready).toBe(false)
    expect(calendar.container.find('.view li.day').length).toBe(0)
    expect(calendar.week).toHaveBeenCalledTimes(1)

    dayNodes.each((i, dayNode) => {
      const a = $(dayNode).find('h3 a')
      const key = $(dayNode).attr('data-date-key')
      const events = calendar.eventsIndex.events[key] || []
      const eventsNode = $(dayNode).find('.events')
      expect(events.length).toBe(0)
      expect(eventsNode.length).toBe(1)        
      expect(eventsNode.html()).toBe('')        
      expect(eventsNode.parent()[0]).toBe(dayNode)
      expect(container.find(`[data-date-key="${key}"]`).hasClass('has-events')).toBe(false)
      expect($(dayNode).hasClass('selected')).toBe(key === testToday)
      expect(a.attr('href')).toBe(`#${container.attr('id')}/day/${key}`)
    })
  })

})
