/**
 * @module CsvEventCalendar
 */

import $ from 'jquery'
import Papa from 'papaparse'
import CalendarEvent from './CalendarEvent'
import tz from 'countries-and-timezones'

class CsvEventCalendar {
  /**
   * @desc Create an instance of CsvEventCalendar
   * @public
   * @constructor
   * @param {module:CsvEventCalendar~CsvEventCalendar.Options} options CsvEventCalendar options
   */
  constructor(options) {
    /**
     * @private
     * @member {boolean}
     */
    this.firstView = true

    /**
     * @private
     * @member {Object<string, Object>}
     */
    this.eventsIndex = { ready: false, noData: false, events: {} }

    /**
     * @private
     * @member {JQuery}
     */
    this.container = $(`<div id="${CsvEventCalendar.nextId('calendar')}" class="calendar"></div>`)

    /**
     * @private
     * @member {string}
     */
    this.timeZone = options.timeZone

    /**
     * @private
     * @member {string}
     */
    this.min = options.min || CsvEventCalendar.MIN_DEFAULT

    /**
     * @private
     * @member {string}
     */
    this.max = options.max || CsvEventCalendar.MAX_DEFAULT

    /**
     * @private
     * @member {string}
     */
    this.geoclientUrl = options.geoclientUrl

    /**
     * @private
     * @member {Geocoder}
     */
    this.geocoder = options.geocoder

    /**
     * @private
     * @member {function}
     */
    this.eventHtml = options.eventHtml


    /**
     * @private
     * @member {function}
     */
    this.showMap = options.showMap

    /**
     * @private
     * @member {function}
     */
    this.geocode = options.geocode

    this.ready = options.ready || this.ready
    this.viewChanged = options.viewChanged || this.viewChanged
    this.dateChanged = options.dateChanged || this.dateChanged

    /**
     * @private
     * @member {Object<string, string>}
     */
    this.csvColumns = options.csvColumns || CalendarEvent.DEFAULT_PROPERTIES

    /**
     * @private
     * @member {Date}
     */
    this.today = CsvEventCalendar.getToday()

    /**
     * @private
     * @member {string}
     */
    this.url = options.url

    /**
     * @private
     * @member {JQuery}
     */
    this.search = null

    /**
     * @private
     * @member {JQuery}
     */
    this.dateInput = null

    /**
     * @private
     * @member {JQuery}
     */
    this.viewOptions = null

    $(options.target).append(this.container)

    /**
     * @private
     * @member {Object<string, Object>}
     */
    this.state = {
      today: CsvEventCalendar.dateKey(this.today),
      year: this.today.getFullYear(),
      month: this.today.getMonth(),
      date: this.today.getDate(),
      view: CsvEventCalendar.VIEW_NAMES.month,
      previousView: CsvEventCalendar.VIEW_NAMES.month,
      foundEvent: null,
      key: () => {
        let mm = CsvEventCalendar.pad(this.state.month + 1)
        let dd = CsvEventCalendar.pad(this.state.date)
        return `${this.state.year}-${mm}-${dd}`
      }
    }

    this.createControls()
    $(document).on('keyup', this.esc.bind(this))
    $(window).on('resize', this.resize.bind(this))
      .on('hashchange', this.hashChanged.bind(this))
    this.resize()
    if (this.url) {
      this.loadCsv(this.url)
    } else {
      this.eventsIndex.noData = true
      this.view(CsvEventCalendar.VIEW_NAMES.month)
      this.container.find('.view').get(0).className = 'view-wo-events'
      this.container.find('.controls').addClass('controls-wo-views')
    }
  }

  /**
   * @private
   * @method
   */
  loadCsv() {
    if (this.clientTimeZone || this.sameTimeZone()) {
      Papa.parse(this.url, {
        download: true,
        header: true,
        complete: this.indexData.bind(this)
      })
    }
  }

  /**
   * @desc Default date change handler to be optionally injected with constructor options
   * @public
   * @method
   * @param {string} dateKey The new date key
   */
  dateChanged(dateKey) { }

  /**
   * @desc Default vew change handler to be optionally injected with constructor options
   * @public
   * @method
   * @param {string} viewName The new view  name
   */
  viewChanged(viewName) { }

  /**
   * @desc Default ready handler to be optionally injected with constructor options
   * @public
   * @method
   * @param {module:CsvEventCalendar~CsvEventCalendar} calendar This calendar instance
   */
  ready(calendar) { }

  /**
   * @private
   * @method
   * @param {Event} domEvent 
   */
  esc(domEvent) {
    if (domEvent.key === 'Escape') {
      this.updateHash(`#${this.container.attr('id')}/${this.state.previousView}/${this.state.key()}`)
    }
  }

  /**
   * @private
   * @method
   * @param {string} hash 
   */
  updateHash(hash) {
    window.location.hash = hash
  }

  /**
   * @private
   * @method
   */
  getHash() {
    return window.location.hash
  }

  /**
   * @private
   * @method
   */
  hashChanged() {
    const values = this.getHash().substring(1).split('/')
    if (values[0] === this.container.attr('id') && values.length === 3) {
      this.updateState({
        view: values[1],
        key: values[2]
      })
      this.clearSearch()
      this.view(values[1])
    } else if (this.firstView) {
      this.view(CsvEventCalendar.VIEW_NAMES.month)
    }
    this.firstView = false
  }

  /**
   * @private
   * @method
   * @param {Object} options 
   */
  updateState(options) {
    const beforeKey = this.state.key()
    const beforeView = this.state.view
    if (options.view === CsvEventCalendar.VIEW_NAMES.week) {
      this.state.previousView = CsvEventCalendar.VIEW_NAMES.month
    } else if (this.state.view !== CsvEventCalendar.VIEW_NAMES.day) {
      this.state.previousView = this.state.view
    }
    this.state.view = options.view || this.state.view
    this.state.year = options.year || this.state.year
    this.state.month = options.month !== undefined ? options.month : this.state.month
    const currentMonth = new Date(this.state.year, this.state.month + 1, 0)
    const lastDayOfMonth = currentMonth.getDate()
    this.state.date = options.date || this.state.date
    if (this.state.date > lastDayOfMonth) {
      this.state.month = this.state.month
      this.state.date = lastDayOfMonth
    }
    if (options.key) {
      this.state.year = CsvEventCalendar.yearNumber(options.key)
      this.state.month = CsvEventCalendar.monthNumber(options.key) - 1
      this.state.date = CsvEventCalendar.dateNumber(options.key)
    }
    if (this.state.key() > this.max) {
      this.updateState({ key: this.max })
      this.alert({ minMax: 'max' })
      return
    }
    if (this.state.key() < this.min) {
      this.updateState({ key: this.min })
      this.alert({ minMax: 'min' })
      return
    }
    const key = this.state.key()
    const view = this.state.view
    this.dateInput.val(key)
    this.viewOptions.find('input')
      .attr('aria-checked', false)
      .prop('checked', false);
    this.viewOptions.find('button')
      .attr('aria-label', `showing ${view} view`)
    this.viewOptions.find(`input[value="${view}"]`)
      .attr('aria-checked', true)
      .prop('checked', true)
    this.viewOptions.find('.btn span').html('View by ' + view)
    if (view !== beforeView) {
      this.week()
      this.viewChanged({
        view: view,
        date: key,
        events: this.eventsIndex.events[key] || []
      })
    }
    if (key !== beforeKey) {
      this.week()
      this.dateChanged({
        view: view,
        date: key,
        events: this.eventsIndex.events[key] || []
      })
    }
  }

  /**
   * @private
   * @method
   * @param {Object} options
   */
  getTitle(options) {
    const key = options.key || this.state.key()
    const dateStr = CsvEventCalendar.dateFromKey(key).toLocaleDateString(CsvEventCalendar.getLocale())
    const year = CsvEventCalendar.yearNumber(key)
    const month = CsvEventCalendar.monthName(key)
    const mo = month.substring(0, 3)
    const m = CsvEventCalendar.monthNumber(key)
    const date = CsvEventCalendar.dateNumber(key)
    const day = CsvEventCalendar.dayName(key)
    const d = day.substring(0, 3)
    const title = {
      month: {
        long: `${month} ${year}`,
        medium: `${mo} ${year}`,
        abbr: `${m}/${year}`
      },
      day: {
        long: CsvEventCalendar.IS_US ? `${day} ${month} ${date}, ${year}` : `${day} ${date} ${month} ${year}`,
        medium: CsvEventCalendar.IS_US ? `${d} ${mo} ${date}, ${year}` : `${d} ${date} ${mo} ${year}`,
        short: date,
        abbr: `${d} ${dateStr}`
      }
    }
    $(options.node).find('.month .long').html(title.month.long)
    $(options.node).find('.month .short').html(title.month.medium)
    $(options.node).find('.month .abbr').html(title.month.abbr)
    $(options.node).attr('aria-label', title.month.long)
    return title
  }

  /**
   * @private
   * @method
   * @param {string} key 
   */
  dayNode(key) {
    return this.container.find(`.day[data-date-key="${key}"]`)
  }

  /**
   * @private
   * @method
   * @param {Array<Object>} dates
   */
  previousMonth(dates) {
    const firstDayIndex = new Date(this.state.year, this.state.month).getDay()
    const totalDaysInPrevMonth = new Date(this.state.year, this.state.month, 0).getDate()
    const dayNames = CsvEventCalendar.localeDayNames()
    const firstDayName = CsvEventCalendar.DAY_NAMES[firstDayIndex]
    const firstDayLocaleIndex = dayNames.indexOf(firstDayName)

    for (let i = 1; i <= firstDayLocaleIndex; i++) {
      const prevMonthDate = totalDaysInPrevMonth - Math.abs(firstDayLocaleIndex - i)
      const key = CsvEventCalendar.dateKey(new Date(this.state.year, this.state.month - 1, prevMonthDate))
      dates.push({ key: key, date: prevMonthDate, monthClass: 'prev' })
    }
  }

  /**
   * @private
   * @method
   * @param {Array<Object>} dates
   */
  currentMonth(dates) {
    const totalDaysInMonth = new Date(this.state.year, this.state.month + 1, 0).getDate()
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const key = CsvEventCalendar.dateKey(new Date(this.state.year, this.state.month, i))
      dates.push({ key: key, date: i, monthClass: 'current' })
    }
  }

  /**
   * @private
   * @method
   * @param {Array<Object>} dates
   */
  nextMonth(dates) {
    const gridsize = 42
    if (dates.length < gridsize) {
      const count = gridsize - dates.length
      for (let i = 1; i <= count; i++) {
        const key = CsvEventCalendar.dateKey(new Date(this.state.year, this.state.month + 1, i))
        dates.push({ key: key, date: i, monthClass: 'next' })
      }
    }
  }

  /**
   * @private
   * @method
   * @param {Array<Object>} dates
   */
  calendar(dates) {
    const month = this.month()
    const endOfWeek1 = dates[6].key
    const startOfWeek6 = dates[35].key
    let weekOfMonth = 0
    $.each(dates, (i, date) => {
      this.day(date, weekOfMonth, month)
      if ((i + 1) % 7 === 0) {
        weekOfMonth = weekOfMonth + 1
        if (i === 34 && !CsvEventCalendar.sameMonth(endOfWeek1, startOfWeek6)) {
          return false
        }
      }
    })
  }

  /**
   * @private
   * @method
   * @param {Event} domEvent
   */
  navigate(domEvent) {
    const delta = $(domEvent.currentTarget).data('delta')
    const view = this.state.view
    this.container.find('.controls button').removeAttr('disabled')
    this[`${view}Navigate`](delta)
    this.view(view)
  }

  /**
   * @private
   * @method
   * @param {number} delta
   */
  monthNavigate(delta) {
    const before = this.state.month
    let month = this.state.month
    let year = this.state.year
    if (before === 11 && delta === 1) {
      month = 0
      year = this.state.year + 1
    } else if (before === 0 && delta === -1) {
      month = 11
      year = this.state.year - 1
    } else {
      month = this.state.month + delta
    }
    this.updateState({ month: month, year: year })
    this.updateHash(`#${this.container.attr('id')}/month/${this.state.key()}`)
  }

  /**
   * @private
   * @method
   * @param {number} delta
   */
  weekNavigate(delta) {
    const key = this.state.key()
    const date = CsvEventCalendar.dateFromKey(key)
    date.setDate(date.getDate() + (delta * 7))
    this.updateState({ key: CsvEventCalendar.dateKey(date) })
    const dayNode = this.dayNode(this.state.key())
    if (dayNode.length === 0) {
      this.monthView()
    }
    this.container.find('li.day').removeClass('selected')
    dayNode.addClass('selected')
    this.week()
    this.updateHash(`#${this.container.attr('id')}/week/${this.state.key()}`)
  }

  /**
   * @private
   * @method
   * @param {number} delta
   */
  dayNavigate(delta) {
    const key = this.state.key()
    const date = CsvEventCalendar.dateFromKey(key)
    date.setDate(date.getDate() + delta)

    const nextKey = CsvEventCalendar.dateKey(date)
    this.updateState({ key: nextKey })

    const dayNode = this.dayNode(this.state.key())
    if (dayNode.length === 0) {
      this.monthView()
    }
    if (!this.container.find('.view-wo-events').length && !dayNode.hasClass('has-events')) {
      this.dayNavigate(delta)
      return
    }
    this.container.find('li.day').removeClass('selected')
    dayNode.addClass('selected')
    this.updateHash(`#${this.container.attr('id')}/day/${this.state.key()}`)
  }

  /**
   * @private
   * @method
   */
  createControls() {
    const back = $('<button class="btn back"><span class="long">Previous</span><span class="short">&lt;</span></button>')
      .data('delta', -1)
      .on('click', this.navigate.bind(this))
    const next = $('<button class="btn next"><span class="long">Next</span><span class="short">&gt;</span></button>')
      .data('delta', 1)
      .on('click', this.navigate.bind(this))
    const autoCompleteId = CsvEventCalendar.nextId('autoComplete')
    this.search = $('<div class="search"><input role="combobox" aria-autocomplete="list" aria-expanded="false" autocomplete="off" type="text" placeholder="Find events by name..." aria-label="Find events by name. Begin typing then press down arrow to access search results"><div class="out"></div><div class="filtered" role="listbox"></div><p class="screenreader message" aria-live="polite"></p></div>')
    this.search.find('input').attr('aria-owns', autoCompleteId)
    this.search.find('.filtered').attr('id', autoCompleteId)
    this.dateInput = $('<input type="date">')
      .val(this.state.key())
      .on('change', () => {
        const key = this.dateInput.val()
        if (this.eventsIndex.events[key]) {
          this.updateHash(`#${this.container.attr('id')}/day/${key}`)
        } else {
          this.alert({ key })
        }
      })
    const viewOptions = $('<fieldset></fieldset>')
      .append('<button class="btn" aria-label="showing month view" aria-expanded="false"><span>View by month</span></button>')
    this.viewOptions = viewOptions
    Object.keys(CsvEventCalendar.VIEW_NAMES).forEach(view => {
      const id = CsvEventCalendar.nextId('view')
      const radio = $('<input name="view-choice" type="radio">')
        .attr({
          id,
          value: view,
          'aria-checked': view === CsvEventCalendar.VIEW_NAMES.month,
          'aria-label': `View by ${view}`
        }).prop('checked', view === CsvEventCalendar.VIEW_NAMES.month)
      const label = $('<label aria-hidden="true"></label>')
        .html(view)
        .attr({
          for: id,
          'aria-label': `View by ${view}`
        })
      viewOptions.append($('<div class="view-choice"></div>').append(radio).append(label))
    })
    const activeateBtn = viewOptions.find('button.btn')
    activeateBtn.on('click keyup', domEvent => {
      if (domEvent.type === 'click' || domEvent.key === 'ArrowDown') {
        const open = activeateBtn.attr('aria-expanded') === true
        activeateBtn.attr('aria-expanded', !open)
        viewOptions[!open ? 'addClass' : 'removeClass']('expanded')
        setTimeout(() => {
          viewOptions.find('input[aria-checked="true"]').trigger('focus')
        }, 200);
      }
    })
    viewOptions.find('input').on('click keyup', domEvent => {
      if ((domEvent.type === 'click' && domEvent.clientX > 0) || (domEvent.key === ' ' || domEvent.key === 'Enter')) {
        this.clearSearch()
        viewOptions.removeClass('expanded')
        activeateBtn.attr('aria-expanded', false)
        activeateBtn.trigger('focus')
        this.updateHash(`#${this.container.attr('id')}/${$(domEvent.target).val()}/${this.state.key()}`)
      }
    })
    $(document).on('click', domEvent => {
      const nextElem = domEvent.target
      if (nextElem && !$.contains(viewOptions.get(0), nextElem)) {
        activeateBtn.attr('aria-expanded', false)
        viewOptions.removeClass('expanded')
      }
      if (nextElem && !$.contains(this.search.get(0), nextElem)) {
        this.clearSearch()
      }
    })
    viewOptions.find('button, input').on('blur', domEvent => {
      const next = domEvent.relatedTarget
      if (next && !$.contains(viewOptions.get(0), next)) {
        activeateBtn.attr('aria-expanded', false)
        viewOptions.removeClass('expanded')
      }
    })
    const h2 = $('<h2 aria-live="assertive"></h2>')
      .append(
        $('<span class="month"></span>')
          .append('<span class="long"></span>')
          .append('<span class="short"></span>')
          .append('<span class="abbr"></span>')
      )
    const controls = $('<div class="controls"></div>')
      .append(back)
      .append(h2)
      .append(next)
      .append(this.dateInput)
      .append(this.search)
      .append(viewOptions)
    this.search.find('input').on('keyup', this.filterAutoComplete.bind(this))
    this.container.append(controls)

    const id0 = CsvEventCalendar.nextId('tz')
    const id1 = CsvEventCalendar.nextId('tz')
    const alert = $('<div class="alert" aria-live="assertive" aria-modal="true"><div class="content"><p></p><form><div class="tz tz0 btn"><input type="radio" name="timezone" checked><label></label></div><div class="tz tz1 btn"><input type="radio" name="timezone"><label></label></div></form><button class="btn ok"><span>OK</span></button></div></div>')
    alert.find('.tz0 input').attr('id', id0)
    alert.find('.tz1 input').attr('id', id1)
    alert.find('.tz0 label').attr('for', id0)
    alert.find('.tz1 label').attr('for', id1)
    this.container.append(alert)
  }

  /**
   * @private
   * @method
   */
  clearSearch() {
    this.search.find('.filtered').hide()
    this.search.find('.message').hide()
    this.search.find('input').attr('aria-expanded', false).val('')
    this.search.find('.out').append(this.search.find('.filtered a'))
  }

  /**
   * @private
   * @method
   */
  autoCompleteOptions() {
    const out = this.search.find('.out')
    Object.keys(this.eventsIndex.events).forEach(key => {
      const events = this.eventsIndex.events[key]
      events.forEach(event => {
        const name = event.name
        const a = $('<a role="option"></a>')
          .html(name)
          .attr('href', `#${this.container.attr('id')}/day/${key}`)
          .on('click', () => {
            this.state.foundEvent = name
          })
        out.append(a)
        this.search.on('keydown', this.searching.bind(this))
      })
    })
  }

  /**
   * @private
   * @method
   * @param {Event} domEvent
   */
  searching(domEvent) {
    const keyName = domEvent.key
    if (keyName === 'ArrowUp' || keyName === 'ArrowDown') {
      const choices = this.search.find('.filtered').find('a')
      const index = choices.index(domEvent.target)
      let next
      if (keyName === 'ArrowUp') {
        if (index <= 0) {
          next = this.search.find('input')
        } else {
          next = choices.get(index - 1)
        }
      } else if (keyName === 'ArrowDown') {
        if (index < choices.length - 1) {
          next = choices.get(index + 1)
        } else {
          next = choices.get(0)
        }
      }
      domEvent.preventDefault()
      $(next).trigger('focus')
    }
  }

  /**
   * @private
   * @method
   * @param {Event} domEvent
   */
  filterAutoComplete(domEvent) {
    const search = this.search
    const out = search.find('.out')
    const filtered = search.find('.filtered')
    if (domEvent.key === 'ArrowDown') {
      filtered.find('a').first().trigger('focus')
    } else {
      const text = search.find('input').val()
      if (text) {
        search.find('input').attr('aria-expanded', true)
        CsvEventCalendar.filter(out, filtered, text)
        const count = filtered.children().length
        const msg = `found ${count} events matching "${text}"`
        if (out.children().length > 0) {
          search.find('.message').html(msg).attr('aria-label', msg).show()
        }
        filtered.show()
      } else {
        search.find('input').attr('aria-expanded', false)
        search.find('.message').hide()
        filtered.hide()
      }
    }
  }

  /**
   * @private
   * @method
   */
  month() {
    const dayNames = $('<ul class="day-names" aria-hidden="true"></ul>')
    const month = $('<ol class="dates"></ol>')
    const viewDesc = $('<h2 class="view-desc"><a tabindex="0"><span class="long"></span><span class="medium"></span><span class="abbr"></span></a></h2>')
    let viewContainer = this.container.find('.view, .view-wo-events')
    if (!viewContainer.length) {
      viewContainer = $('<div class="view month"></div>')
    }
    this.container.append(viewContainer.empty().append(viewDesc).append(dayNames).append(month))
    CsvEventCalendar.localeDayNames().forEach(name => {
      const li = $('<li></li>')
        .append('<span class="long">' + name + '</span>')
        .append('<span class="medium">' + name.substring(0, 3) + '</span>')
        .append('<span class="short">' + name.substring(0, 1) + '</span>')
      dayNames.append(li)
    })
    return month
  }

  /**
   * @private
   * @method
   */
  week() {
    const key = this.state.key()
    const dayNode = this.dayNode(key)
    this.container.find('li.day')
      .removeClass('start-of-week')
      .removeClass('selected-week')
    $(`.week-${dayNode.data(CsvEventCalendar.VIEW_NAMES.week)}`)
      .addClass('selected-week')
      .first().addClass('start-of-week')
  }

  /**
   * @private
   * @method
   * @param {number} day
   * @param {string} week
   * @param {JQuery} month
   * @returns {JQuery}
   */
  day(date, week, month) {
    const key = date.key
    const title = this.getTitle({ key: key }).day
    const prevView = $('<a class="prev-view"></a>')
    const h3 = $('<h3></h3>')
    const a = $('<a class="name"></a>')
    h3.append(a)
    a.append(`<span class="long">${title.long}</span>`)
      .append(`<span class="medium">${title.medium}</span>`)
      .append(`<span class="abbr">${title.abbr}</span>`)
      .append(`<span class="short">${title.short}</span>`)
    if (this.eventsIndex.ready) {
      a.attr('href', `#${this.container.attr('id')}/day/${key}`)
    }
    const day = $('<li class="day"></li>')
      .data(CsvEventCalendar.VIEW_NAMES.week, week)
      .addClass(`${date.monthClass}-mo`)
      .addClass(`week-${week}`)
      .attr('data-date-key', date.key)
      .append(prevView)
      .append(h3)
      .append('<div class="events"></div>')
      .on('click', domEvent => {
        if (day.hasClass('has-events') && this.state.view === 'month') {
          domEvent.preventDefault()
          this.updateHash(a.attr('href'))
        }
      })
    month.append(day)
    return day
  }

  /**
   * @private
   * @method
   * @param {string} view
   */
  view(view) {
    const key = this.state.key()
    const dayNode = this.dayNode(key)
    const previousView = this.state.previousView
    if (!dayNode.length) {
      this.monthView()
      return this.view(view)
    }
    this.container.find('.view')
      .removeClass(CsvEventCalendar.VIEW_NAMES.month)
      .removeClass(CsvEventCalendar.VIEW_NAMES.week)
      .removeClass(CsvEventCalendar.VIEW_NAMES.day)
      .addClass(view)
    this.getTitle({ node: this.container.find('.controls h2') })
    this.container.find('.controls .next').attr({
      'aria-label': `next ${view}`,
      title: `next ${view}`
    })
    this.container.find('.controls .back').attr({
      'aria-label': `previous ${view}`,
      title: `previous ${view}`
    })
    this.container.find('.view').removeAttr('aria-label')
    this.container.find('.day a.name').removeAttr('aria-live')
    this.container.find('.day a[data-old-label]').each((i, btn) => {
      $(btn).attr('aria-label', $(btn).attr('data-old-label'))
        .removeAttr('data-old-label')
    })
    this.container.find('.day a.prev-view').attr({
      'aria-label': `return to ${previousView} view`,
      title: `return to ${previousView} view`,
      ['href']: `#${this.container.attr('id')}/${previousView}/${key}`
    })
    this.container.find('.view .day a').removeAttr('tabindex')
    this[`${view}View`]()
    this.container.find('.view .day[aria-hidden="true"] a.prev-view').attr('tabindex', -1)
    this.container.find(`.view .day[data-date-key="${this.state.today}"]`).addClass('today')
    this.updateState({ view })
    this.focus()
  }


  /**
   * @private
   * @method
   * @param {string} view
   * @param {string} key
   * @param {number} count
   */
  viewDesc(view, key, count) {
    const title = this.getTitle({ key: key })
    const desc = this.container.find('.view-desc a')
    const long = desc.find('.long')
    const medium = desc.find('.medium')
    const abbr = desc.find('.abbr')
    const events = count === 1 ? 'event' : 'events'
    const name = this.state.foundEvent
    let msg = name ? `Showing details for "${name}"` : ''
    if (view === CsvEventCalendar.VIEW_NAMES.month) {
      if (msg && count > 1) {
        msg = `${msg}, and ${count - 1} other scheduled ${events}`
      } else if (msg) {
        msg = `${msg} scheduled`
      }
      long.html(`Showing ${count} scheduled ${events}`)
      medium.html(`Showing ${count} scheduled ${events}`)
      abbr.html(`Showing ${count} ${events}`)
    } else if (view === CsvEventCalendar.VIEW_NAMES.week) {
      if (msg && count > 1) {
        msg = `${msg}, and ${count - 1} other scheduled ${events} for week of ${title.day.long}`
      } else if (msg) {
        msg = `${msg} scheduled for week of ${title.day.long}`
      }
      long.html(`Showing ${count} scheduled ${events} for week of ${title.day.long}`)
      medium.html(`Showing ${count} ${events} for week of ${title.day.medium}`)
      abbr.html(`${count} ${events} for week of ${title.day.abbr.substring(4)}`)
    } else if (count) {
      if (msg && count > 1) {
        msg = `${msg}, and ${count - 1} other scheduled ${events} on ${title.day.long}`
      } else if (msg) {
        msg = `${msg} scheduled on ${title.day.long}`
      }
      long.html(`Showing ${count} scheduled ${events} on ${title.day.long}`)
      medium.html(`Showing ${count} ${events} on ${title.day.medium}`)
      abbr.html(`${count} ${events} on ${title.day.abbr}`)
    } else {
      long.html(`There no scheduled events on ${title.day.long}`)
      medium.html(`No scheduled events on ${title.day.medium}`)
      abbr.html(`No events on ${title.day.abbr}`)
    }
    desc.attr('aria-label', msg || long.text())
  }

  /**
   * @private
   * @method
   */
  monthView() {
    const dates = []
    this.previousMonth(dates)
    this.currentMonth(dates)
    this.nextMonth(dates)
    this.calendar(dates)
    this.populate()
    this.container.find('.view .event a').attr('tabindex', -1)
    this.viewDesc(CsvEventCalendar.VIEW_NAMES.month, this.state.key(), this.container.find('.view .event').length)
  }

  /**
   * @private
   * @method
   */
  weekView() {
    const key = this.container.find('.day.start-of-week').attr('data-date-key')
    const count = this.container.find('.selected-week .event').length
    this.viewDesc(CsvEventCalendar.VIEW_NAMES.week, key, count)
  }

  /**
   * @private
   * @method
   */
  dayView() {
    const key = this.state.key()
    const dayNode = this.dayNode(key)
    const eventCount = this.eventsIndex.events[key] && this.eventsIndex.events[key].length || 0
    this.container.find('li.day').removeClass('selected')
    dayNode.addClass('selected')
    this.viewDesc(CsvEventCalendar.VIEW_NAMES.day, key, eventCount)
    this.state.foundEvent = null
  }

  /**
   * @private
   * @method
   */
  populate() {
    const calendarEvents = {}
    const dayNodes = this.container.find('.view li.day')
    dayNodes.each((i, dayNode) => {
      const key = $(dayNode).attr('data-date-key')
      const title = this.getTitle({ key: key }).day.long
      const events = this.eventsIndex.events[key]
      const eventCount = events && events.length || 0
      const eventsNode = $(dayNode).find('.events')
      const a = $(dayNode).find('h3 a')
      $(dayNode).append(eventsNode)
      if (this.eventsIndex.ready) {
        if (events) {
          calendarEvents[key] = events
          $(dayNode).addClass('has-events')
          $.each(events, (i, calEvent) => {
            if (i < 4) {
              eventsNode.append(calEvent.html())
            } else {
              const a = $('<a class="title"></a>')
                .html(`+${events.length - 4} for ${this.getTitle({ key }).day.abbr.split(' ')[1]}`)
                .attr('href', `#${this.container.attr('id')}/day/${key}`)
              eventsNode.append($('<div class="event more"></div>').append(a))
              eventsNode.append(calEvent.html().addClass('overflow'))
            }
          })
          a.attr('href', `#${this.container.attr('id')}/day/${key}`)
            .attr('aria-label', `${title} (${eventCount} ${(eventCount === 1 ? ' event' : ' events')} scheduled`)
        } else {
          $(dayNode).attr('aria-hidden', 'true')
            .find('a.prev-view').attr('aria-hidden', 'true')
          a.removeAttr('href').attr('aria-label', `${title} (no events scheduled)`)
          eventsNode.html('<div class="no-events">no events scheduled</div>')
        }
      }
    })
    const dayNode = this.dayNode(this.state.key())
    this.container.find('.view.month .day').removeClass('selected')
    dayNode.addClass('selected')
    this.week()
  }

  /**
   * @private
   * @method
   * @returns {boolean}
   */
  sameTimeZone() {
    if (this.eventsIndex.ready || this.clientTimeZone) {
      return this.clientTimeZone === this.timeZone
    }
    if (Intl.DateTimeFormat().resolvedOptions().timeZone === this.timeZone) {
      this.clientTimeZone = this.timeZone
      return true
    }
    this.alert({ differentTimeZone: true })
    return false
  }

  /**
   * @private
   * @method
   * @param {string} date
   * @returns {string}
   */
  timeFromDateStr(date) {
    if (date) {
      return new Intl.DateTimeFormat('default', {
        hour12: false,
        hour: 'numeric',
        minute: 'numeric'
      }).format(new Date(date))
    }
    return ''
  }

  /**
   * @private
   * @method
   * @param {Object} calEvent
   * @returns {string}
   */
  adjustForTimeZone(calEvent) {
    const cols = this.csvColumns
    const key = calEvent[cols.date]
    if (!this.sameTimeZone()) {
      const origStart = calEvent[cols.start]
      const origEnd = calEvent[cols.end]
      const origStart24 = origStart ? CalendarEvent.timeFormat(origStart) : origStart
      const origEnd24 = origEnd ? CalendarEvent.timeFormat(origEnd) : origEnd
      const offset = tz.getTimezone(this.timeZone).utcOffsetStr
      const dateForKey = new Date(`${key}T${origStart24 || '12:00'}:00${offset}`)
      const strForStart = origStart24 ? `${key}T${origStart24}:00${offset}` : ''
      const strForEnd = origEnd24 ? `${key}T${origEnd24}:00${offset}` : ''
      const newKey = CsvEventCalendar.dateKey(dateForKey)
      calEvent[cols.date] = newKey
      calEvent[cols.start] = this.timeFromDateStr(strForStart)
      calEvent[cols.end] = this.timeFromDateStr(strForEnd)
      return newKey
    }
    return key
  }

  /**
   * @public
   * @method
   * @param {string} key The date key
   * @param {Object<string, string>} calEvent The CSV calendar event row
   */
  createCalendarEvent(key, calEvent) {
    return new CalendarEvent({
      timeZone: this.clientTimeZone,
      date: key,
      data: calEvent,
      properties: this.csvColumns,
      eventHtml: this.eventHtml,
      showMap: this.showMap,
      geocode: this.geocode,
      geocoder: this.geocoder
    })
  }

  /**
   * @private
   * @method
   * @param {Object} response
   */
  indexData(response) {
    response.data.forEach(calEvent => {
      let key = calEvent[this.csvColumns.date]
      if (key) { // papaparse parses blank lines at the end of file
        key = this.adjustForTimeZone(calEvent)
        this.eventsIndex.events[key] = this.eventsIndex.events[key] || []
        this.eventsIndex.events[key].push(this.createCalendarEvent(key, calEvent))
        CsvEventCalendar.sortByStartTime(this.eventsIndex.events[key])
      }
    })

    this.minMax(Object.keys(this.eventsIndex.events))
    this.eventsIndex.ready = true
    this.autoCompleteOptions()
    this.hashChanged()
    this.ready(this)
  }

  /**
   * @private
   * @method
   * @param {Array<string>} allDates
   */
  minMax(allDates) {
    const sorted = allDates.sort()
    if (this.min === CsvEventCalendar.MIN_DEFAULT) {
      this.min = sorted[0]
      this.dateInput.attr('min', this.min)
    }
    if (this.max === CsvEventCalendar.MAX_DEFAULT) {
      this.max = sorted[sorted.length - 1]
      this.dateInput.attr('max', this.max)
    }
  }

  /**
   * @private
   * @method
   * @param {Object} options
   */
  alert(options) {
    let msg
    const alert = this.container.find('.alert').removeClass('input')
    const minMax = options.minMax
    const key = options.key
    const view = this.container.find('.view')
    const controls = this.container.find('.controls')
    const clientTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

    if (['min', 'max'].indexOf(minMax) > -1) {
      controls.find(`button.${(minMax === 'min' ? 'back' : 'next')}`)
        .attr('disabled', true)
      msg = `No events scheduled ${(minMax === 'min' ? 'before' : 'after')} ${this.getTitle({ key: this[minMax] }).day.long}`
    } else if (key) {
      msg = `No events scheduled on ${this.getTitle({ key }).day.long}`
    } else {
      alert.addClass('input')
      msg = 'Your time zone does not match the calendar events. Please choose a time zone to continue.'
      alert.find('.tz0 input').val(this.timeZone)
      alert.find('.tz1 input').val(clientTimeZone)
      alert.find('.tz0 label').html(`<strong>Calendar time zone</strong><br>${this.timeZone}`)
      alert.find('.tz1 label').html(`<strong>Your time zone</strong><br>${clientTimeZone}`)
    }
    controls.attr('aria-hidden', true)
    view.attr('aria-hidden', true)
    alert.find('p').html(msg)
    alert.attr({ 'aria-label': msg, tabindex: 0 })
      .show()
      .trigger('focus')
    const ok = alert.find('button.ok')
    const timeout = setTimeout(() => {
      ok.trigger('focus')
    }, 6500)
    const click = () => {
      alert.hide()
      controls.removeAttr('aria-hidden')
      view.removeAttr('aria-hidden')
      clearTimeout(timeout)
    }
    if (!options.differentTimeZone) {
      ok.one('click', click)
    } else {
      const form = alert.find('form').get(0)
      ok.one('click', () => {
        this.clientTimeZone = form.timezone.value
        click()
        this.loadCsv()
      })
    }
  }

  /**
   * @private
   * @method
   */
  focus() {
    if (!this.container.find('.alert').is(':visible')) {
      const scroll = $(document).scrollTop()
      setTimeout(() => {
        this.container.find('.view-desc a').focus()
        this.container.scrollTop(0)
        $(document).scrollTop(scroll)
      }, 200)
    }
  }

  /**
   * @private
   * @method
   */
  resize() {
    const container = this.container
    const width = container.width()
    CsvEventCalendar.CSS_WIDTHS.forEach(w => {
      container.removeClass('w-' + w)
      if (width <= w) {
        container.addClass('w-' + w)
      }
    })
  }
}

/**
 * @private
 * @static
 * @method
 * @returns {string}
 */
CsvEventCalendar.getLocale = () => {
  return window.navigator.language
}

/**
 * @private
 * @const {boolean}
 */
CsvEventCalendar.IS_US = CsvEventCalendar.getLocale() === 'en-US'

/**
 * @private
 * @const {Object<string, string>}
 */
CsvEventCalendar.VIEW_NAMES = {month: 'month', week: 'week', day: 'day'}

/**
 * @private
 * @const {Array<string>}
 */
CsvEventCalendar.MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

/**
 * @private
 * @const {Array<string>}
 */
CsvEventCalendar.DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/**
 * @private
 * @const {Array<number>}
 */
CsvEventCalendar.CSS_WIDTHS = [645, 500, 400, 375, 340, 300, 280]

/**
 * @private
 * @const {string}
 */
CsvEventCalendar.MIN_DEFAULT = '1900-01-01'

/**
 * @private
 * @const {string}
 */
CsvEventCalendar.MAX_DEFAULT = '2200-01-01'

/**
 * @private
 * @static
 * @method
 * @returns {Array<string>}
 */
CsvEventCalendar.localeDayNames = () => {
  const startOfWeekByCountry = {
    AE: 7, AF: 7, AG: 1, AS: 1, AU: 1, BD: 1, BH: 7, BR: 1, BS: 1, BT: 1, BW: 1, BZ: 1, CA: 1, CN: 1, CO: 1,
    DJ: 7, DM: 1, DO: 1, DZ: 7, EG: 7, ET: 1, GT: 1, GU: 1, HK: 1, HN: 1, ID: 1, IL: 1, IN: 1, IQ: 7, IR: 7,
    JM: 1, JO: 7, JP: 1, KE: 1, KH: 1, KR: 1, KW: 7, LA: 1, LY: 7, MH: 1, MM: 1, MO: 1, MT: 1, MV: 6, MX: 1,
    MZ: 1, NI: 1, NP: 1, OM: 7, PA: 1, PE: 1, PH: 1, PK: 1, PR: 1, PT: 1, PY: 1, QA: 7, SA: 1, SD: 7,
    SG: 1, SV: 1, SY: 7, TH: 1, TT: 1, TW: 1, UM: 1, US: 1, VE: 1, VI: 1, WS: 1, YE: 1, ZA: 1, ZW: 0
  }
  const country = CsvEventCalendar.getLocale().split('-')[1]
  const startOfWeek = (startOfWeekByCountry[country] || 2) - 1
  const week = [...CsvEventCalendar.DAY_NAMES]
  if (startOfWeek === 0) {
    return week
  }
  const week0 = [...week]
  const week1 = [...week0]
  week0.splice(0, startOfWeek)
  week1.splice(startOfWeek)
  return week0.concat(week1)
}

/**
 * @private
 * @static
 * @method
 * @param {string} n
 * @returns {string}
 */
CsvEventCalendar.pad = n => {
  if (isNaN(n) || n * 1 > 9) {
    return n
  }
  return `0${n}`
}

/**
 * @private
 * @static
 * @method
 * @param {Date} date
 * @returns {string}
 */
CsvEventCalendar.dateKey = date => {
  const format = new Intl.DateTimeFormat()
  const parts = {}
  format.formatToParts(date).forEach(part => {
    parts[part.type] = CsvEventCalendar.pad(part.value)
  })
  return `${parts.year}-${parts.month}-${parts.day}`
}

/**
 * @private
 * @static
 * @method
 * @param {string} key
 * @returns {Date}
 */
CsvEventCalendar.dateFromKey = key => {
  return new Date(`${key}T00:00`)
}

/**
 * @private
 * @static
 * @method
 * @param {string} key
 * @returns {number}
 */
CsvEventCalendar.dateNumber = key => {
  return key.split('-')[2] * 1
}

/**
 * @private
 * @static
 * @method
 * @param {string} key
 * @returns {number}
 */
CsvEventCalendar.dayNumber = key => {
  const date = CsvEventCalendar.dateFromKey(key)
  return date.getDay()
}

/**
 * @private
 * @static
 * @method
 * @param {string} key
 * @returns {string}
 */
CsvEventCalendar.dayName = key => {
  const day = CsvEventCalendar.dayNumber(key)
  return CsvEventCalendar.DAY_NAMES[day]
}

/**
 * @private
 * @static
 * @method
 * @param {string} key
 * @returns {number}
 */
CsvEventCalendar.monthNumber = key => {
  return key.split('-')[1] * 1
}

/**
 * @private
 * @static
 * @method
 * @param {string} key
 * @returns {string}
 */
CsvEventCalendar.monthName = key => {
  const month = CsvEventCalendar.monthNumber(key)
  return CsvEventCalendar.MONTH_NAMES[month - 1]
}

/**
 * @private
 * @static
 * @method
 * @param {string} key1
 * @param {string} key2
 * @returns {boolean}
 */
CsvEventCalendar.sameMonth = (key1, key2) => {
  return CsvEventCalendar.monthNumber(key1) === CsvEventCalendar.monthNumber(key2)
}

/**
 * @private
 * @static
 * @method
 * @param {string} key
 * @returns {number}
 */
CsvEventCalendar.yearNumber = key => {
  return key.split('-')[0] * 1
}

/**
 * @private
 * @static
 * @method
 * @param {Array<Object>} events
 */
CsvEventCalendar.sortByStartTime = events => {
  const fmt = CalendarEvent.timeFormat
  events.sort((event1, event2) => {
    const time1 = fmt(event1.start)
    const time2 = fmt(event2.start)
    if (time1 < time2) {
      return -1
    } else if (time1 < time2) {
      return 1
    }
    return 0
  })
}

/**
 * @private
 * @const {Object}
 */
CsvEventCalendar.ids = {}

/**
 * @private
 * @static
 * @method
 * @param {string} prefix
 * @returns {string}
 */
CsvEventCalendar.nextId = prefix => {
  const ids = CsvEventCalendar.ids
  ids[prefix] = ids[prefix] || 0
  ids[prefix] = ids[prefix] + 1
  return prefix + ids[prefix]
}

/**
 * @private
 * @static
 * @method
 * @param {jQuery} out The ul element to search
 * @param {jQuery} filtered The ul element to receive results
 * @param {string} typed The text for searching
 */
CsvEventCalendar.filter = (out, filtered, typed) => {
  const long = typed.length > 1
  const veryLong = typed.length > 6
  const tested = { exact: [], possible: [] }
  const matchers = CsvEventCalendar.regexp(typed)
  const all = []
  const test = CsvEventCalendar.filterTest
  $.merge($(filtered).children(), $(out).children()).each((_, a) => {
    all.push($(a))
    test(matchers, $(a), tested, long)
  })
  $(out).append(all)
  if (tested.exact.length) {
    $(filtered).prepend(tested.exact)
  } else if (!veryLong) {
    $(filtered).prepend(tested.possible)
  }
}

/**
 * @private
 * @static
 * @method
 * @param {Object<string, RegExp>} matchers Matchers
 * @param {jQuery} item Item
 * @param {Object<string, Array<JQuery>>} filtered Filtered
 * @param {boolean} long If true use exact test
 */
CsvEventCalendar.filterTest = (matchers, item, tested, long) => {
  const text = item.text()
  if (long) {
    if (matchers.exact.test(text)) {
      tested.exact.push(item)
    }
  }
  if (matchers.possible.test(text)) {
    tested.possible.push(item)
  }
}

/**
 * @private
 * @static
 * @method
 * @param {string} typed Typed string
 * @return {Object<string, RegExp>} Exact and possible regexes
 */
CsvEventCalendar.regexp = typed => {
  const possibleMatch = new String(typed.replace(/[^a-zA-Z0-9]/g, ''))
  const exactMatch = new String(typed.replace(/[^a-zA-Z0-9 ]/g, ''))
  let possible = '^'
  for (let i = 0; i < possibleMatch.length; i++) {
    possible += `(?=.*${possibleMatch.charAt(i)})|`
  }
  possible = possible.substring(0, possible.length - 1)
  possible += '.*$'
  return {
    exact: new RegExp(`(${exactMatch})`, 'i'),
    possible: new RegExp(possible, 'i')
  }
}

/**
 * @private
 * @static
 * @method
 * @return {Date}
 */
CsvEventCalendar.getToday = () => {
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  return today
}

/**
 * @desc Constructor options for {@link module:CsvEventCalendar~CsvEventCalendar}
 * @public
 * @typedef {Object}
 * @property {jQuery|Element|string} target The target DOM node for creating the calendar
 * @property {string} url The URL to the CSV event data
 * @property {string} [timeZone={@link module:CalendarEvent~CalendarEvent.DEFAULT_TIME_ZONE}] The calendar time zone
 * @property {Object<string, string>} [csvColumns={@link module:CalendarEvent~CalendarEvent.DEFAULT_PROPERTIES}] A map of CSV column names keyed to the necessary property names
 * @property {function(string)=} dateChanged Handler for date changed event
 * @property {function(string=)} viewChanged Handler for state changed event
 * @property {function(module:CsvEventCalendar~CsvEventCalendar)=} ready Fires once data is loaded
 * @property {function():JQuery=} eventHtml Custom render for the event details (must return a JQuery DIV with class="event")
 * @property {function()=} showMap A showMap implemtation
 * @property {function()=} geocode A geocode implemtation
 * @property {Geocoder=} geocoder A geocoder implemtating <code><a href="https://maps.nyc.gov/nyc-lib/v1.4.78/doc/module-nyc_Geocoder-Geocoder.html">nyc-lib/nyc/Geocoder</a></code> (try <code><a href="https://maps.nyc.gov/nyc-lib/v1.4.78/doc/module-nyc_OsmGeocoder-OsmGeocoder.html">nyc-lib/nyc/OsmGeocoder</a></code> with implementation specific <code><a href="https://maps.nyc.gov/nyc-lib/v1.4.78/doc/module-nyc_OsmGeocoder-OsmGeocoder.html#.Options">constructor options</a></code>)
 * @property {string=} geoclientUrl The geoclient URL
 * @property {string=} min The minimum date formatted as yyyy-mm-dd (defaults to the lower bound of events)
 * @property {string=} max The maximum date formatted as yyyy-mm-dd (defaults to the upper bound of events)
 */
CsvEventCalendar.Options

export default CsvEventCalendar
