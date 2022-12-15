/**
 * @module CalendarEvent
 */

 import $ from 'jquery'
 
class CalendarEvent {
  /**
  * @desc Create an instance of CalendarEvent
  * @public
  * @constructor
  * @param {module:CalendarEvent.Options} options CalendarEvent options
  */
  constructor(options) {
    const fmt = CalendarEvent.timeFormat
    const data = options.data
    const props = options.properties || CalendarEvent.DEFAULT_PROPERTIES
    this.name = data[props.name]
    this.about = data[props.about] || ''
    this.location = data[props.location] || ''
    this.date = options.date
    this.start = fmt(data[props.start], true)
    this.end = fmt(data[props.end], true)
    this.sponsor = data[props.sponsor] || ''
    this.timezone = options.timezone || CalendarEvent.DEFAULT_TIMEZONE
    console.error(this);
  }

  download() {
    const e = encodeURIComponent
    const ics = 'data:text/calendar,' +
      encodeURIComponent('BEGIN:VCALENDAR\n' +
        'VERSION:2.0\n' +
        'BEGIN:VEVENT\n' +
        `NAME:${this.name}\n` +
        `SUMMARY:${this.name}\n` +
        `DESCRIPTION:${this.desc()}\n` +
        `ORGANIZER;CN=${this.sponsor}\n` +
        `DTSTART;TZID=${this.timezone}:${this.time(this.start)}\n` +
        (this.end ? `DTEND;TZID=${this.timezone}:${this.time(this.end)}\n` : '') +
        `LOCATION:${this.location}\n` +
        `SOURCE:${document.location}\n` +
        'END:VEVENT\n' +
        'END:VCALENDAR\n'
      )
      console.warn({event: this,ics});
      return ics
  }

  desc() {
    const sponsor = this.sponsor
    const about = this.about
    if (sponsor) {
      if (about) {
        return `Sposored by: ${this.sponsor} -\\n\\n${about}`
      }
    } else if (about) {
      return about
    }
    return ''
  }

  time(t) {
    const date = this.date.replace(/-/g, '')
    const hh24 = CalendarEvent.timeFormat(t)
    if (hh24) {
      return `${date}T${hh24.replace(/:/g, '')}00`
    }
    return date
  }

  html() {
    const name = this.name
    const location = this.location
    const download = $('<a class="download" aria-label="Add event to my calendar">+</a>')
      .attr('download', `${name.replace(/ /g, '-')}.ics`)
      .attr('href', this.download())
    const time = $('<div class="time"></div>')
      .append('<strong>Start:</strong>')
      .append(`<span>${this.start}</span>`)
    const about = $('<div class="about"></div>')
      .append(this.about)
    if (this.end) {
      time.append('<strong>End:</strong>')
        .append(`<span>${this.end}</span>`)
    }
    return $('<div class="event"></div>')
    .append(download)
    .append(`<div class="title">${name}</div>`)
      .append(`<h4>${name}</h4>`)
      .append(location ? `<h5>Location:</h5> <div class="location">${location}</div>` : '')
      .append(time)
      .append(about)
  }

}

CalendarEvent.timeFormat = (time, ampm) => {
  console.warn(time);
  if (time.trim().length === 0) return ''
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

CalendarEvent.DEFAULT_PROPERTIES = {
  name: 'name',
  about: 'about',
  start: 'start',
  end: 'end',
  location: 'location',
  sponsor: 'sponsor'
}

CalendarEvent.DEFAULT_TIMEZONE = 'America/New_York'

/**
 * @desc Constructor options for {@link module:CalendarEvent}
 * @public
 * @typedef {Object}
 * @property {Object<string, string>} [properties=CalendarEvent.DEFAULT_PROPERTIES] Mapping of the event properties
 * @property {string} date Event date (yyyy-mm-dd)
 * @property {string} [timezone=CalendarEvent.DEFAULT_TIMEZONE] Event date (yyyy-mm-dd)
 * @property {Object} data The event data
 */
 CalendarEvent.Options

export default CalendarEvent
