/**
 * @module CsvEventCalendar
 */

import $ from 'jquery'
import Papa from 'papaparse'

class CsvEventCalendar {
  /**
   * @desc Create an instance of CsvEventCalendar
   * @public
   * @constructor
   * @param {module:CsvEventCalendar.Options} options CsvEventCalendar options
   */
  constructor(options) {
    this.firstView = true
    this.eventsIndex = {ready: false, noData: false}
    this.container = $('<div class="calendar"></div>')
    this.min = options.min || CsvEventCalendar.MIN_DEFAULT
    this.max = options.max || CsvEventCalendar.MAX_DEFAULT
    this.eventProperties = options.eventProperties || CsvEventCalendar.EVENT_PROPERTIES
    this.eventHtml = options.eventHtml || this.eventHtml
    this.viewChanged = options.viewChanged || this.viewChanged
    this.dateChanged = options.dateChanged || this.dateChanged
    this.today = new Date()
    this.today.setHours(0, 0, 0, 0)
    this.search = null
    this.dateInput = null
    this.viewOptions = null

    $(options.target).append(this.container)
    this.state = {
      today: CsvEventCalendar.dateKey(this.today),
      year: this.today.getFullYear(),
      month: this.today.getMonth(),
      date: this.today.getDate(),
      day: this.today.getDay(),
      view: CsvEventCalendar.VIEW_NAMES.month,
      previousView: CsvEventCalendar.VIEW_NAMES.month,
      foundEvent: null,
      key: () => {
        let m = this.state.month + 1
        let d = this.state.date
        if (m < 10) m = `0${m}`
        if (d < 10) d = `0${d}`
        return `${this.state.year}-${m}-${d}`
      }
    }
    this.container.attr('id', CsvEventCalendar.nextId('calendar'))
    this.controls()
    if (options.url) {
      Papa.parse(options.url, {
        download: true,
        header: true,
        complete: this.indexData.bind(this)
      })
    } else {
      this.eventsIndex.noData = true
      this.view(CsvEventCalendar.VIEW_NAMES.month)
      this.container.find('.view').get(0).className = 'view-wo-events'
      this.container.find('.controls').addClass('controls-wo-views')
    }
    $(document).on('keyup', this.esc.bind(this))
    $(window).on('resize', this.resize.bind(this))
    $(window).on('hashchange', this.hashChanged.bind(this))
    this.resize()
  }

  dateChanged() {}
  viewChanged() {}

  esc(domEvent) {
    if (domEvent.key === 'Escape') {
      window.location.hash = `#${this.container.attr('id')}/${this.state.previousView}/${this.state.key()}`
    }
  }

  hashChanged() {
    const values = window.location.hash.substring(1).split('/')
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
      this.updateState({key: this.max})
      this.alert('max')
      return
    }
    if (this.state.key() < this.min) {
      this.updateState({key: this.min})
      this.alert('min')
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
        events: this.eventsIndex[key] || []
      })
    }
    if (key !== beforeKey) {
      this.week()
      this.dateChanged({
        view: view,
        date: key,
        events: this.eventsIndex[key] || []
      })
    }
  }

  title(options) {
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

  dayNode(key) {
    return this.container.find(`[data-date-key="${key}"]`)
  }

  previousMonth(dates) {
    const day = new Date(this.state.year, this.state.month).getDay()
    const firstDay = CsvEventCalendar.IS_US ? day : (day - 1)
    const totalDaysInPrevMonth = new Date(this.state.year, this.state.month, 0).getDate()
    for (let i = 1; i <= firstDay; i++) {
      const prevMonthDate = totalDaysInPrevMonth - firstDay + i
      const key = CsvEventCalendar.dateKey(new Date(this.state.year, this.state.month - 1, prevMonthDate))
      dates.push({key: key, date: prevMonthDate, monthClass: 'prev'})
    }
  }

  currentMonth(dates) {
    const totalDaysInMonth = new Date(this.state.year, this.state.month + 1, 0).getDate()
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const key = CsvEventCalendar.dateKey(new Date(this.state.year, this.state.month, i))
      dates.push({key: key, date: i, monthClass: 'current'})
    }
  }

  nextMonth(dates) {
    const gridsize = 42
    if(dates.length < gridsize) {
      const count = gridsize - dates.length
      for(let i = 1; i <= count; i++) {
        const key = CsvEventCalendar.dateKey(new Date(this.state.year, this.state.month + 1, i))
        dates.push({key: key, date: i, monthClass: 'next'})
      }
    }
  }

  navigate(domEvent) {
    const delta =  $(domEvent.currentTarget).data('delta')
    const view = this.state.view
    this.container.find('.controls button').removeAttr('disabled')
    this[`${view}Navigate`](delta)
    this.view(view)
  }

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
    this.updateState({month: month, year: year})
    window.location.hash = `#${this.container.attr('id')}/month/${this.state.key()}`
  }

  weekNavigate(delta) {
    const key = this.state.key()
    const date = CsvEventCalendar.dateFromKey(key)
    date.setDate(date.getDate() + (delta * 7))
    this.updateState({key: CsvEventCalendar.dateKey(date)})
    const dayNode = this.dayNode(this.state.key())
    if (!dayNode.length) {
      this.monthView();
    }
    this.container.find('li.day').removeClass('selected')
    dayNode.addClass('selected')
    this.week()
    window.location.hash = `#${this.container.attr('id')}/week/${this.state.key()}`
  }

  dayNavigate(delta) {
    const key = this.state.key()
    const date = CsvEventCalendar.dateFromKey(key)
    date.setDate(date.getDate() + delta)
  
    const nextKey = CsvEventCalendar.dateKey(date)
    this.updateState({key: nextKey})
  
    const dayNode = this.dayNode(this.state.key())
    if (!dayNode.length) {
      this.monthView()
    }
    if (!dayNode.hasClass('has-events')) {
      this.dayNavigate(delta)
      return
    }
    this.container.find('li.day').removeClass('selected')
    dayNode.addClass('selected')
    window.location.hash = `#${this.container.attr('id')}/day/${this.state.key()}`
  }

  controls() {
    const me = this
    const back = $('<button class="btn back"><span class="long">Previous</span><span class="short">&lt;</span></button>')
      .data('delta', -1)
      .on('click', this.navigate.bind(this))
    const next = $('<button class="btn next"><span class="long">Next</span><span class="short">&gt;</span></button>')
      .data('delta', 1)
      .on('click', this.navigate.bind(this))
    const autoCompleteId = CsvEventCalendar.nextId('autoComplete')
    this.search = $('<div class="search"><input  role="combobox" aria-autocomplete="list" aria-expanded="false" autocomplete="off" type="text" placeholder="Find events by name..." aria-label="Find events by name. Begin typing then press down arrow to access search results"><div class="out"></div><div class="filtered" role="listbox"></div><p class="screenreader message" aria-live="polite"></p></div>')
    this.search.find('input').attr('aria-owns', autoCompleteId)
    this.search.find('.filtered').attr('id', autoCompleteId)
    this.dateInput = $('<input type="date">')
      .val(this.state.key())
      .on('change', () => {
        const key = me.dateInput.val()
        if (me.eventsIndex[key]) {
          window.location.hash = `#${me.container.attr('id')}/day/${key}`
        } else {
          me.alert(key)
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
        me.clearSearch()
        viewOptions.removeClass('expanded')
        activeateBtn.attr('aria-expanded', false)
        activeateBtn.trigger('focus')
        window.location.hash = `#${me.container.attr('id')}/${$(domEvent.target).val()}/${me.state.key()}`
      }
    })
    $(document).on('click', domEvent => {
      const nextElem = domEvent.target
      if (nextElem && !$.contains(viewOptions.get(0), nextElem)) {
        activeateBtn.attr('aria-expanded', false)
        viewOptions.removeClass('expanded')
      }
      if (nextElem && !$.contains(me.search.get(0), nextElem)) {
        me.clearSearch()
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
    const alert = $('<div class="alert" aria-live="assertive" aria-modal="true"><div><p></p><button class="btn ok"><span>OK</span></button></div></div></div>')
    alert.find('.ok').on('click', () => {
      alert.hide()
      controls.removeAttr('aria-hidden')
      me.container.find('.view').removeAttr('aria-hidden')
    })
    this.container.append(alert)
  }

  clearSearch() {
    this.search.find('.filtered').hide()
    this.search.find('.message').hide()
    this.search.find('input').attr('aria-expanded', false).val('')
    this.search.find('.out').append(this.search.find('.filtered a'))
  }

  autoComplete() {
    const me = this
    const input = this.search.find('input')
    const out = this.search.find('.out')
    const filtered = this.search.find('.filtered')
    Object.keys(this.eventsIndex).forEach(key => {
      if (key !== 'noData' && key !== 'ready') {
        const events = this.eventsIndex[key]
        events.forEach(event => {
          const name = event[this.eventProperties.name]
          const a = $('<a role="option"></a>')
            .html(name)
            .attr('href', `#${this.container.attr('id')}/day/${key}`)
            .on('click', () => {
              me.state.foundEvent = name
            })
          out.append(a)
          this.search.on('keydown', domEvent => {
            const keyName = domEvent.key
            if (keyName === 'ArrowUp' || keyName === 'ArrowDown') {
              const choices = filtered.find('a')
              const index = choices.index(domEvent.target)
              let next
              if (keyName === 'ArrowUp') {
                if (index <= 0) {
                  next = input
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
          })
        })
      }
    })
  }

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
        clearTimeout(filtered.data('message-timeout'))
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

  day(date, week, month) {
    const key = date.key
    const title = this.title({key: key}).day
    const prevView = $('<a class="prev-view"></a>')
    const h3 = $('<h3></h3>')
    const a = $('<a class="name"></a>')
    h3.append(a)
    a.append(`<span class="long">${title.long}</span>`)
      .append(`<span class="medium">${title.medium}</span>`)
      .append(`<span class="abbr">${title.abbr}</span>`)
      .append(`<span class="short">${title.short}</span>`)
      .attr('href',` #${this.container.attr('id')}/day/${key}`)
    const day = $('<li class="day"></li>')
      .data(CsvEventCalendar.VIEW_NAMES.week, week)
      .addClass(date.monthClass + '-mo')
      .addClass( 'week-' + week)
      .attr('data-date-key', date.key)
      .append(prevView)
      .append(h3)
      .append('<div class="events"></div>')
      .on('click', () => {
        if (day.hasClass('has-events'))
          window.location.hash = day.find('a.name').attr('href')
      })
      month.append(day)
      return day
  }

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
    this.title({node: this.container.find('.controls h2')})
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
    this.container.find('.day a.prev-view')
      .attr({
        'aria-label': `return to ${previousView} view`,
        title: `return to ${previousView} view`,
        href: `#${this.container.attr('id')}/${previousView}/${key}`
      })
    this.container.find('.view .day a').removeAttr('tabindex')
    this[`${view}View`]()
    this.container.find('.view .day[aria-hidden="true"] a.prev-view').attr('tabindex', -1)
    this.container.find(`.view .day[data-date-key="${this.state.today}"]`).addClass('today')
    this.focus()
  }

  viewDesc(view, key, count) {
    const title = this.title({key: key})
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

  weekView() {
    const key = this.container.find('.day.start-of-week').attr('data-date-key')
    const count = this.container.find('.selected-week .event').length
    this.viewDesc(CsvEventCalendar.VIEW_NAMES.week, key, count)
  }

  dayView() {
    const key = this.state.key()
    const dayNode = this.dayNode(key)
    const eventCount = this.eventsIndex[key] && this.eventsIndex[key].length || 0
    this.container.find('li.day').removeClass('selected')
    dayNode.addClass('selected')
    this.viewDesc(CsvEventCalendar.VIEW_NAMES.day, key, eventCount)
    this.state.foundEvent = null
  }

  populate() {
    const me = this
    const calendarEvents = {}
    const dayNodes = this.container.find('.view li.day')
    dayNodes.each((i, dayNode) => {
      const key = $(dayNode).attr('data-date-key')
      const title = me.title({key: key}).day.long
      const events = me.eventsIndex[key]
      const eventCount = events && events.length || 0
      const eventsNode = $(dayNode).find('.events')
      const a = $(dayNode).find('h3 a')
      $(dayNode).append(eventsNode)
      if (me.eventsIndex.ready) {
        if (events) {
          calendarEvents[key] = events
          $(dayNode).addClass('has-events')
          $.each(events, (i, calEvent) => {
            if (i < 4) {
              eventsNode.append(me.eventHtml(calEvent))
            } else {
              const a = $('<a class="title"></a>')
                .html(`+${events.length - 4} for ${me.title({key}).day.abbr.split(' ')[1]}`)
                .attr('href', `#${me.container.attr('id')}/day/${key}`)
              eventsNode.append($('<div class="event more"></div>').append(a))            
              eventsNode.append(me.eventHtml(calEvent).addClass('overflow'))
            }
          })
          a.attr('href', `#${me.container.attr('id')}/day/${key}`)
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

  indexData(response) {
    const calEvents = response.data
    CsvEventCalendar.sortByDate(calEvents)
    if (this.min === CsvEventCalendar.MIN_DEFAULT) {
      this.min = calEvents[0].date
      this.dateInput.attr('min', this.min)
    }
    if (this.max === CsvEventCalendar.MAX_DEFAULT) {
      let max = calEvents[calEvents.length - 1].date
      let i = 2
      while (!max) { // papaparse parses blank lines aty the end of file
        max = calEvents[calEvents.length - i].date
        i = i + 1
      }
      this.max = max
      this.dateInput.attr('max', this.max)
    }
    calEvents.forEach(calEvent => {
      const key = calEvent.date
      this.eventsIndex[key] = this.eventsIndex[key] || []
      this.eventsIndex[key].push(calEvent)
      CsvEventCalendar.sortByStartTime(this.eventsIndex[key])
    })
    this.eventsIndex.ready = true
    this.autoComplete()
    this.hashChanged()
  }

  alert(minMaxKey) {
    let msg
    if (['min', 'max'].indexOf(minMaxKey) > -1) {
      this.container.find(`.controls button.${(minMaxKey === 'min' ? 'back' : 'next')}`)
        .attr('disabled', true);
      msg = `No events scheduled ${(minMaxKey === 'min' ? 'before' : 'after')} ${this.title({key: this[minMaxKey]}).day.long}`
    } else {
      msg = `No events scheduled on ${this.title({key: minMaxKey}).day.long}`
    }
    this.container.find('.controls').attr('aria-hidden', true)
    this.container.find('.view').attr('aria-hidden', true)
    this.container.find('.alert p').html(msg)
    const alert = this.container.find('.alert')
      .attr({'aria-label': msg, tabindex: 0})
      .show()
      .trigger('focus')
    const ok = alert.find('button.ok')
    const timeout = setTimeout(() => {
      ok.trigger('focus')
    }, 6500)
    ok.on('click', () => {
      clearTimeout(timeout)
    })
  }

  focus() {
    const me = this
    if (!this.container.find('.alert').is(':visible')) {
      const scroll = $(document).scrollTop()
      setTimeout(() => {
        me.container.find('.view-desc a').focus()
        me.container.scrollTop(0)
        $(document).scrollTop(scroll)
      }, 200)
    }
  }

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

  eventHtml(calEvent) {
    const fmt = CsvEventCalendar.timeFormat
    const props = this.eventProperties
    const location = calEvent[props.location]
    const time = $('<div class="time"></div>')
      .append('<strong>Start:</strong>')
      .append(`<span>${fmt(calEvent[props.start], true)}</span>`)
    const about = $('<div class="about"></div>')
      .append(calEvent[props.about])
    if (calEvent.end) {
      time.append('<strong>End:</strong>')
        .append(`<span>${fmt(calEvent[props.end], true)}</span>`)
    }
    return $('<div class="event"></div>')
      .append(`<div class="title">${calEvent[props.name]}</div>`)
      .append(`<h4>${calEvent[props.name]}</h4>`)
      .append(location ? `<h5>Location:</h5> <div class="location">${location}</div>` : '')
      .append(time)
      .append(about)
  }
}

CsvEventCalendar.getLocale = () => {
  return navigator.language
}

CsvEventCalendar.IS_US = CsvEventCalendar.getLocale() === 'en-US'
CsvEventCalendar.VIEW_NAMES = {month: 'month', week: 'week', day: 'day'}
CsvEventCalendar.MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
CsvEventCalendar.DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
CsvEventCalendar.DAY_NAMES_US = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
CsvEventCalendar.CSS_WIDTHS = [645, 500, 400, 375, 340, 300, 280]
CsvEventCalendar.MIN_DEFAULT = '1900-01-01'
CsvEventCalendar.MAX_DEFAULT = '2200-01-01'
CsvEventCalendar.EVENT_PROPERTIES = {
  name: 'name',
  location: 'location',
  start: 'start',
  end: 'end',
  about: 'about'
}

CsvEventCalendar.localeDayNames = () => {
  return CsvEventCalendar.IS_US ? CsvEventCalendar.DAY_NAMES_US : CsvEventCalendar.DAY_NAMES
}

CsvEventCalendar.dateKey = date => {
  const dt = new Date(date.getTime())
  dt.setHours(0, 0, 0, 0)
  return dt.toISOString().split('T')[0]
}

CsvEventCalendar.dateFromKey = key => {
  return new Date(`${key}T00:00`)
}

CsvEventCalendar.dateNumber = key => {
  return key.split('-')[2] * 1
}

CsvEventCalendar.dayNumber = key => {
  const date = CsvEventCalendar.dateFromKey(key)
  return date.getDay()
}

CsvEventCalendar.dayName = key => {
  const day = CsvEventCalendar.dayNumber(key)
  return CsvEventCalendar.DAY_NAMES_US[day]
}

CsvEventCalendar.monthNumber = key => {
  return key.split('-')[1] * 1
}

CsvEventCalendar.monthName = key => {
  const month = CsvEventCalendar.monthNumber(key)
  return CsvEventCalendar.MONTH_NAMES[month - 1]
}

CsvEventCalendar.sameMonth = (key1, key2) => {
  return CsvEventCalendar.monthNumber(key1) === CsvEventCalendar.monthNumber(key2)
}

CsvEventCalendar.yearNumber = key => {
  return key.split('-')[0] * 1
};

CsvEventCalendar.timeFormat = (time, ampm) => {
  if (time.trim().length === 0) return '';
  const parts = time.split(':')
  for (let i = 0; i < parts.length; i++) {
    parts[i] = parseInt(parts[i])
    if (('' + parts[i]).length === 1) {
      parts[i] = `0${parts[i]}`
    }
  }
  if (time.toUpperCase().indexOf('M') > -1) {
    if (parseInt(parts[0]) === 12) {
      parts[0] = '00'
    }
    if (time.toUpperCase().indexOf('P') > -1) {
      parts[0] = parseInt(parts[0]) + 12
    }
  }
  if (parts.length < 2) {
    parts.push('00')
  }
  const hh24 = parts.join(':')
  let suffix = ' AM'
  if (!ampm) return hh24;
  if (parseInt(parts[0]) > 12) {
    suffix = ' PM'
    parts[0] = parts[0] - 12;
  } else if (parseInt(parts[0]) === 12) {
    suffix = ' PM'
  }
  return parts.join(':') + suffix
}

CsvEventCalendar.sortByStartTime = events => {
  const fmt = CsvEventCalendar.timeFormat
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

CsvEventCalendar.sortByDate = events => {
  events.sort((event1, event2) => {
    const date1 = event1.date
    const date2 = event2.date
    if (date1 < date2) {
      return -1
    } else if (date1 < date2) {
      return 1
    }
    return 0
  });
  while (!events[0].date) {
    events.shift()
  }
}

CsvEventCalendar.nextId = prefix => {
  CsvEventCalendar[prefix] = CsvEventCalendar[prefix] || {}
  CsvEventCalendar[prefix].id = CsvEventCalendar[prefix].id || 0
  CsvEventCalendar[prefix].id = CsvEventCalendar[prefix].id + 1
  return prefix + CsvEventCalendar[prefix].id
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
  const tested = {exact: [], possible: []}
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
 * @param {Object<string,RegExp>} matchers Matchers
 * @param {jQuery} item Item
 * @param {Object<string,Array<JQuery>>} filtered Filtered
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
 * @return {Object<string,RegExp>} Exact and possible regexes
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
 * @desc Constructor options for {@link module:CsvEventCalendar}
 * @public
 * @typedef {Object}
 * @property {jQuery|Element|string} target The target DOM node for creating the calendar
 * @property {string} url The URL to the CSV event data
 * @property {string} min The minimum date formatted as yyyy-mm-dd
 * @property {string} max The maximum date formatted as yyyy-mm-dd
 * @property {function} dateChanged Handler for date changed event
 * @property {function} viewChanged Handler for state changed event
 */
 CsvEventCalendar.Options

export default CsvEventCalendar