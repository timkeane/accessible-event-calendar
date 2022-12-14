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
    const data = options.data
    const props = options.properties || CalendarEvent.DEFAULT_PROPERTIES
    this.name = data[props.name]
    this.location = data[props.location]
    this.date = data[props.date]
    this.start = data[props.start]
    this.end = data[props.end]
    this.sponsor = data[props.sponsor]
  }

  html() {
    const fmt = CalendarEvent.timeFormat
    const name = this.name
    const location = this.location
    const time = $('<div class="time"></div>')
      .append('<strong>Start:</strong>')
      .append(`<span>${fmt(this.start, true)}</span>`)
    const about = $('<div class="about"></div>')
      .append(this.about)
    if (this.end) {
      time.append('<strong>End:</strong>')
        .append(`<span>${fmt(this.end, true)}</span>`)
    }
    return $('<div class="event"></div>')
      .append(`<div class="title">${name}</div>`)
      .append(`<h4>${name}</h4>`)
      .append(location ? `<h5>Location:</h5> <div class="location">${location}</div>` : '')
      .append(time)
      .append(about)
  }

}

CalendarEvent.timeFormat = (time, ampm) => {
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

CalendarEvent.DEFAULT_PROPERTIES = {
  name: 'name',
  location: 'location',
  start: 'start',
  end: 'end',
  about: 'about'
}

/**
 * @desc Constructor options for {@link module:CalendarEvent}
 * @public
 * @typedef {Object}
 * @property {Object<string, string>} [properties=CalendarEvent.DEFAULT_PROPERTIES] Mapping of the event properties
 * @property {Object} datas The event data
 */
 CalendarEvent.Options

export default CalendarEvent
