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
    expect.assertions(23)

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
    expect.assertions(23)

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
    expect.assertions(22)

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
    expect.assertions(4)

    const calendar1 = new CsvEventCalendar({
      target: $('#test-cal')
    })

    expect(window.location.hash).toBe('')
    expect(calendar1.pseudoHash).toBe('')
    calendar1.updateHash('#mock-hash')
    expect(window.location.hash).toBe('#mock-hash')
    expect(calendar1.pseudoHash).toBe('')
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
  expect.assertions(20)

  const isoToday = today.toISOString().split('T')[0]
  const yesterday = new Date(today)
  const tomorrow = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  tomorrow.setDate(today.getDate() + 1)
  const isoYesterday = yesterday.toISOString().split('T')[0]
  const isoTomorrow = tomorrow.toISOString().split('T')[0]

  const calendar = new CsvEventCalendar({
    target: $('#test-cal'),
    url: 'mock-url',
    min: '1990-01-01',
    max: '2090-01-01'
  })

  const id = calendar.container[0].id

  const dayWithEvents = $(calendar.container.find('li.day.has-events')[0])
  const dayWithoutEvents = $(calendar.container.find('li.day').not('.has-events')[0])

  calendar.monthView = jest.fn()
  calendar.updateHash = jest.fn()

  calendar.dayNavigate(-1)

  expect(calendar.state.key()).toBe(isoYesterday)
  expect(calendar.monthView).toHaveBeenCalledTimes(0)
  expect(calendar.updateHash).toHaveBeenCalledTimes(1)
  expect(calendar.updateHash.mock.calls[0][0]).toBe(`#${id}/day/${isoYesterday}`)

  calendar.dayNavigate(1)

  expect(calendar.state.key()).toBe(isoToday)
  expect(calendar.monthView).toHaveBeenCalledTimes(0)
  expect(calendar.updateHash).toHaveBeenCalledTimes(2)
  expect(calendar.updateHash.mock.calls[1][0]).toBe(`#${id}/day/${isoToday}`)

  calendar.dayNavigate(1)

  expect(calendar.state.key()).toBe(isoTomorrow)
  expect(calendar.monthView).toHaveBeenCalledTimes(0)
  expect(calendar.updateHash).toHaveBeenCalledTimes(3)
  expect(calendar.updateHash.mock.calls[2][0]).toBe(`#${id}/day/${isoTomorrow}`)

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

test.only('filterAutoComplete', () => {
  expect.assertions(6)

  const calendar = new CsvEventCalendar({
    target: $('#test-cal'),
    url: 'mock-url'
  })

  const search = calendar.search
  const out = search.find('.out')
  const filtered = search.find('.filtered')
  const input = search.find('input')

  input.val('E')

  expect(input.attr('aria-expanded')).toBe('false')

  calendar.filterAutoComplete({key: 'NotArrowDown'})

  expect(input.attr('aria-expanded')).toBe('true')

  out.find('a').each((i, a) => {
    filtered.append(a)
  })

  calendar.filterAutoComplete({key: 'ArrowDown'})

  expect(filtered.find('a').first().is(':focus')).toBe(true)

})
