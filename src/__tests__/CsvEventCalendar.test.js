import $ from 'jquery'
import CsvEventCalendar from '../js/CsvEventCalendar'
import CalendarEvent from '../js/CalendarEvent'
import Papa from 'papaparse'
import { MOCK_CSV_RESPONSE, MOCK_DIFF_CSV_RESPONSE, MOCK_EVENTS, MOCK_DIFF_EVENTS } from './mockCsv'

const today = new Date()
today.setHours(0, 0, 0, 0)

const csvColumns = {
  date: 'Date',
  name: 'Event Name',
  about: 'Description',
  start: 'Start Time',
  end: 'End Time',
  location: 'Address',
  sponsor: 'Sponsor'
}

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
  window.location.hash = ''
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
    expect.assertions(24)

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
    expect(calendar.hashAttr).toBe('href')

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

    expect(calendar.state.today).toBe(today.toISOString().split('T')[0])
    expect(calendar.state.year).toBe(today.getFullYear())
    expect(calendar.state.month).toBe(today.getMonth())
    expect(calendar.state.date).toBe(today.getDate())
    expect(calendar.state.view).toBe('month')
    expect(calendar.state.previousView).toBe('month')
    expect(calendar.state.foundEvent).toBeNull()
    expect(calendar.state.key()).toBe(today.toISOString().split('T')[0])

  })

  test('constructor - different csv', () => {
    expect.assertions(24)

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
    expect(calendar.hashAttr).toBe('href')

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

    expect(calendar.state.today).toBe(today.toISOString().split('T')[0])
    expect(calendar.state.year).toBe(today.getFullYear())
    expect(calendar.state.month).toBe(today.getMonth())
    expect(calendar.state.date).toBe(today.getDate())
    expect(calendar.state.view).toBe('month')
    expect(calendar.state.previousView).toBe('month')
    expect(calendar.state.foundEvent).toBeNull()
    expect(calendar.state.key()).toBe(today.toISOString().split('T')[0])

  })

  test('constructor - no url', () => {
    expect.assertions(23)

    const calendar = new CsvEventCalendar({
      target: $('#test-cal'),
      ready: 'mock-ready',
      dateChanged: 'mock-date-changed',
      viewChanged: 'mock-view-changed'
    })

    expect(calendar instanceof CsvEventCalendar).toBe(true)
    expect(calendar.eventsIndex.noData).toBe(true)
    expect(calendar.today).toEqual(today)
    expect(calendar.hashAttr).toBe('href')

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

    expect(calendar.state.today).toBe(today.toISOString().split('T')[0])
    expect(calendar.state.year).toBe(today.getFullYear())
    expect(calendar.state.month).toBe(today.getMonth())
    expect(calendar.state.date).toBe(today.getDate())
    expect(calendar.state.view).toBe('month')
    expect(calendar.state.previousView).toBe('month')
    expect(calendar.state.foundEvent).toBeNull()
    expect(calendar.state.key()).toBe(today.toISOString().split('T')[0])
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
    expect.assertions(38)

    const ready = jest.fn()

    const calendar = new CsvEventCalendar({
      target: $('#test-cal'),
      url: 'mock-url',
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

    calendar.indexData(MOCK_CSV_RESPONSE)

    expect(ready).toHaveBeenCalledTimes(1)
    expect(ready.mock.calls[0][0]).toBe(calendar)
    expect(calendar.minMax).toHaveBeenCalledTimes(1)
    expect(calendar.eventsIndex.ready).toBe(true)
    expect(calendar.eventsIndex.noData).toBe(false)

    Object.keys(MOCK_EVENTS).forEach(key => {
      const expected = MOCK_EVENTS[key]
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

    const ready = jest.fn()

    const calendar = new CsvEventCalendar({
      target: $('#test-cal'),
      url: 'mock-url',
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

    calendar.indexData(MOCK_DIFF_CSV_RESPONSE)

    expect(ready).toHaveBeenCalledTimes(1)
    expect(ready.mock.calls[0][0]).toBe(calendar)
    expect(calendar.minMax).toHaveBeenCalledTimes(1)
    expect(calendar.eventsIndex.ready).toBe(true)
    expect(calendar.eventsIndex.noData).toBe(false)

    Object.keys(MOCK_DIFF_EVENTS).forEach(key => {
      const expected = MOCK_DIFF_EVENTS[key]
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
    expect.assertions(8)

    const calendar1 = new CsvEventCalendar({
      target: $('#test-cal')
    })

    const calendar2 = new CsvEventCalendar({
      noHash: true,
      target: $('#test-cal')
    })

    expect(window.location.hash).toBe('')
    expect(calendar1.pseudoHash).toBe('')
    calendar1.updateHash('#mock-hash')
    expect(window.location.hash).toBe('#mock-hash')
    expect(calendar1.pseudoHash).toBe('')

    expect(calendar2.pseudoHash).toBe('')
    calendar2.updateHash('#mock-hash-oo')
    expect(window.location.hash).toBe('#mock-hash')
    expect(calendar2.pseudoHash).toBe('#mock-hash-oo')
    expect(calendar2.hashChanged).toHaveBeenCalledTimes(1)

  })
})

test('getHash', () => {
  expect.assertions(4)

  const calendar1 = new CsvEventCalendar({
    target: $('#test-cal')
  })

  const calendar2 = new CsvEventCalendar({
    noHash: true,
    target: $('#test-cal')
  })

  expect(calendar1.getHash()).toBe('')
  window.location.hash = '#mock-hash'
  expect(calendar1.getHash()).toBe('#mock-hash')

  expect(calendar2.getHash()).toBe('')
  calendar2.pseudoHash = '#pseudo-hash'
  expect(calendar2.getHash()).toBe('#pseudo-hash')
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
    expect.assertions(9)

    const calendar = new CsvEventCalendar({
      target: $('#test-cal'),
      url: 'mock-url'
    })

    expect(window.location.hash).toBe('')

    calendar.updateHash(`#${calendar.container[0].id}/day/2024-11-01`)
    $(window).trigger('hashchange')
  
    expect(calendar.updateState).toHaveBeenCalled()
    expect(calendar.updateState.mock.lastCall[0]).toEqual({
      view: 'day',
      key: '2024-11-01'
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
  
    expect(calendar.updateState).toHaveBeenCalledTimes(0)
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
    /*
    options 
        view
        year
        month
        date
        key
    */
    const isoToday = today.toISOString().split('T')[0]
    
    const calendar = new CsvEventCalendar({
      target: $('#test-cal'),
      min: '1900-01-01',
      max: '2100-01-01'
    })

    expect(calendar.state.key()).toBe(isoToday)
    expect(calendar.state.today).toBe(isoToday)
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
    /*
    options 
        view
        year
        month
        date
        key
    */
    const isoToday = today.toISOString().split('T')[0]
    
    const calendar = new CsvEventCalendar({
      target: $('#test-cal'),
      min: '1900-01-01',
      max: '2100-01-01'
    })

    calendar.updateState({view: 'day'})

    expect(calendar.state.key()).toBe(isoToday)
    expect(calendar.state.today).toBe(isoToday)
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
    /*
    options 
        view
        year
        month
        date
        key
    */
    const isoToday = today.toISOString().split('T')[0]
    const dateParts = isoToday.split('-')
    
    const calendar = new CsvEventCalendar({
      target: $('#test-cal'),
      min: '1900-01-01',
      max: '2100-01-01'
    })

    calendar.updateState({year: 2050})

    expect(calendar.state.key()).toBe(`2050-${dateParts[1]}-${dateParts[2]}`)
    expect(calendar.state.today).toBe(isoToday)
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
    /*
    options 
        view
        year
        month
        date
        key
    */
    const isoToday = today.toISOString().split('T')[0]
    const dateParts = isoToday.split('-')
    
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
    expect(calendar.state.today).toBe(isoToday)
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
    /*
    options 
        view
        year
        month
        date
        key
    */
    const isoToday = today.toISOString().split('T')[0]
    const dateParts = isoToday.split('-')
    
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
    expect(calendar.state.today).toBe(isoToday)
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
    /*
    options 
        view
        year
        month
        date
        key
    */
    const isoToday = today.toISOString().split('T')[0]

    const calendar = new CsvEventCalendar({
      target: $('#test-cal'),
      min: '1900-01-01',
      max: '2100-01-01'
    })

    calendar.updateState({key: '2050-01-01'})

    expect(calendar.state.key()).toBe('2050-01-01')
    expect(calendar.state.today).toBe(isoToday)
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

    const isoToday = today.toISOString().split('T')[0]

    const dateStr = CsvEventCalendar.dateFromKey(isoToday).toLocaleDateString(CsvEventCalendar.getLocale())
    const year = CsvEventCalendar.yearNumber(isoToday)
    const month = CsvEventCalendar.monthName(isoToday)
    const mo = month.substring(0, 3)
    const m = CsvEventCalendar.monthNumber(isoToday)
    const date = CsvEventCalendar.dateNumber(isoToday)
    const day = CsvEventCalendar.dayName(isoToday)
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

    const isoToday = today.toISOString().split('T')[0]

    const dateStr = CsvEventCalendar.dateFromKey(isoToday).toLocaleDateString(CsvEventCalendar.getLocale())
    const year = CsvEventCalendar.yearNumber(isoToday)
    const month = CsvEventCalendar.monthName(isoToday)
    const mo = month.substring(0, 3)
    const m = CsvEventCalendar.monthNumber(isoToday)
    const date = CsvEventCalendar.dateNumber(isoToday)
    const day = CsvEventCalendar.dayName(isoToday)
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

  const isoToday = today.toISOString().split('T')[0]

  const calendar = new CsvEventCalendar({
    target: $('#test-cal')
  })

  const node = calendar.dayNode(isoToday)

  expect($(node)[0].tagName).toBe('LI')
  expect($(node).attr('data-date-key')).toBe(isoToday)

})

describe('previousMonth', () => {

  afterEach(() => {
    CsvEventCalendar.IS_US = true
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

    CsvEventCalendar.IS_US = false

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
    expect(dates).toEqual( [
      {key: '2023-11-27', date: 27, monthClass: 'prev'},
      {key: '2023-11-28', date: 28, monthClass: 'prev'},
      {key: '2023-11-29', date: 29, monthClass: 'prev'},
      {key: '2023-11-30', date: 30, monthClass: 'prev'}
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

test.only('navigate', () => {
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