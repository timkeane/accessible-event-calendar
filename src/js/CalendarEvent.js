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
    
    /**
     * @private
     * @member {string}
     */
    this.name = data[props.name]
    
    /**
     * @private
     * @member {string}
     */
    this.about = data[props.about] || ''
    
    /**
     * @private
     * @member {string}
     */
    this.location = data[props.location] || ''

    /**
     * @private
     * @member {string}
     */
    this.date = options.date

    /**
     * @private
     * @member {string}
     */
    this.start = fmt(data[props.start], true)

    /**
     * @private
     * @member {string}
     */
    this.end = fmt(data[props.end], true) || ''

    /**
     * @private
     * @member {string}
     */
    this.sponsor = data[props.sponsor] || ''

    /**
     * @private
     * @member {string}
     */
    this.timeZone = options.timeZone || CalendarEvent.DEFAULT_TIME_ZONE
  }

  /**
   * @private
   * @method
   */
  download() {
    const e = encodeURIComponent
    const ics = 'data:text/calendar,' +
      encodeURIComponent('BEGIN:VCALENDAR\n' +
        'VERSION:2.0\n' +
        'BEGIN:VEVENT\n' +
        `SUMMARY:${this.name}\n` +
        `DESCRIPTION:${this.desc()}\n` +
        `DTSTART;TZID=${this.timeZone}:${this.time(this.start)}\n` +
        `DTEND;TZID=${this.timeZone}:${this.time(this.end)}\n` +
        `LOCATION:${this.location}\n` +
        `SOURCE:${document.location}\n` +
        'END:VEVENT\n' +
        'END:VCALENDAR\n'
      )
      return ics
  }

  /**
   * @private
   * @method
   */
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

  /**
   * @private
   * @method
   * @param {string}
   */
  time(t) {
    const date = this.date.replace(/-/g, '')
    const hh24 = CalendarEvent.timeFormat(t)
    if (hh24) {
      return `${date}T${hh24.replace(/:/g, '')}00`
    }
    return date
  }

  /**
   * @private
   * @method
   */
  html() {
    const name = this.name
    const location = this.location
    const sponsor = this.sponsor
    const about = this.about
    const download = $('<a class="download" aria-label="Add event to my calendar"></a>')
      .attr('download', `${name.replace(/ /g, '-')}.ics`)
      .attr('href', this.download())
    const time = $('<div class="time"></div>')
      .append('<strong>Start:</strong>')
      .append(`<span>${this.start}</span>`)
    if (this.end) {
      time.append('<strong>End:</strong>')
        .append(`<span>${this.end}</span>`)
    }
   return $('<div class="event"></div>')
    .append(download)
    .append(`<div class="title">${name}</div>`)
    .append(`<h4>${name}</h4>`)
    .append(time)
    .append(location ? `<h5>Location:</h5> <div class="location">${location}</div>` : '<br>')
    .append(sponsor ? `<h5>Sponsor:</h5> <div class="sponsor">${sponsor}</div>` :  '<br>')
    .append(about ? `<h5>Description:</h5> <div class="description">${about}</div>` :  '<br>')
  }
}

/**
 * @private
 * @static
 * @method
 * @param {string} time
 * @param {boolean} ampm
 * @return {string}
 */
CalendarEvent.timeFormat = (time, ampm) => {
  if (!time || time.trim().length === 0) return ''
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

/**
 * @desc Default mapping for CSV columns
 * @public
 * @const {Object<string, string>}
 */
CalendarEvent.DEFAULT_PROPERTIES = {
  date: 'date',
  name: 'name',
  about: 'about',
  start: 'start',
  end: 'end',
  location: 'location',
  sponsor: 'sponsor'
}

/**
 * @desc Default time zone
 * @public
 * @const {string}
 */
CalendarEvent.DEFAULT_TIME_ZONE = 'America/New_York'

/**
 * @desc Constructor options for {@link module:CalendarEvent}
 * @public
 * @typedef {Object}
 * @property {Object<string, string>} [properties=CalendarEvent.DEFAULT_PROPERTIES] Mapping of the event properties
 * @property {string} date Event date (yyyy-mm-dd)
 * @property {string} [timeZone=CalendarEvent.DEFAULT_TIME_ZONE] Event date (yyyy-mm-dd)
 * @property {Object} data The event data
 */
 CalendarEvent.Options

export default CalendarEvent
