/**
 * @module CalendarEvent
 */

 import $ from 'jquery'
 import LocationMgr from 'nyc-lib/nyc/ol/LocationMgr'
 import OsmGeocoder from 'nyc-lib/nyc/OsmGeocoder'
 import Map from 'ol/Map'
 import Layer from 'ol/layer/Tile'
 import OSM from 'ol/source/OSM'

class CalendarEvent {
  /**
   * @desc Create an instance of CalendarEvent
   * @public
   * @class
   * @constructor
   * @param {module:CalendarEvent~CalendarEvent.Options} options CalendarEvent options
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
    this.timeZone = options.timeZone

    /**
     * @private
     * @member {Geocoder}
     */
    this.geocoder = options.geocoder

    /**
     * @private
     * @member {Map}
     */
    this.map = null

        /**
     * @private
     * @member {Map}
     */
        this.map = null

    /**
     * @private
     * @member {LocationMgr}
     */
    this.locationMgr = null

    const customPropNames = Object.values(props)
    Object.keys(data).forEach(prop => {
      if (customPropNames.indexOf(prop) === -1) {
        this[prop] = data[prop]
      }
    })

    if (typeof options.eventHtml === 'function') {
      this.html = options.eventHtml
    }

    if (typeof options.showMap === 'function') {
      this.showMap = options.showMap
    }

    if (typeof options.geocode === 'function') {
      this.geocode = options.geocode
    }
  }

  /**
   * @private
   * @method
   * @returns {JQuery}
   */
  download() {
    const download = $('<a class="download" tabindex="0" aria-label="Add event to my calendar" title="Add event to my calendar"></a>')
      .attr('download', `${this.name.replace(/ /g, '-')}.ics`)
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
    return download.attr('href', ics)
  }

  /**
   * @private
   * @method
   * @returns {string}
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
   * @param {string} t
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
   * @desc Shows a map of the event location. May be optionally injected with constructor options.
   * @public
   * @method
   */
  showMap() {
    if (this.map === null) {
      this.map = new Map({target: this.mapDiv.show()[0]})
      this.map.addLayer(new Layer({source: new OSM()}))
      this.geocode()
    } else if (this.mapDiv.is(':visible')) {
      this.mapDiv.hide()
    } else {
      this.mapDiv.show()
      this.geocode()
    }
  }

  /**
   * @desc Geocodes the event location for display on the map. May be optionally injected with constructor options.
   * @public
   * @method
   */
  geocode() {
    const map = this.map
    const geocoder = this.geocoder || new OsmGeocoder()
    this.locationMgr = this.locationMgr || new LocationMgr({map, geocoder})
    this.locationMgr.goTo(this.location)
  }

  /**
   * @private
   * @method
   */
  directions() {
    window.open(`https://www.google.com/maps/dir//${encodeURIComponent(this.location)}/`)
  }

  /**
   * @desc Returns The HTML rendering of the event. Use the [`CsvEventCalendar.Options.eventHtml`](./src/js/CalendarEvent.js#L235) constructor option when creating an instance of [`CsvEventCalendar`](./src/js/CalendarEvent.js#L1) to alter the HTML rendering.
   * @public
   * @method
   * @returns {JQuery} The HTML rendering of the event
   */
  html() {
    const name = this.name
    const location = this.location
    const sponsor = this.sponsor
    const about = this.about
    const download = this.download()
    const time = $('<div class="time"></div>')
      .append('<strong>Start:</strong>')
      .append(`<span>${this.start}</span>`)
    if (this.end) {
      time.append('<strong>End:</strong>')
        .append(`<span>${this.end}</span>`)
    }
    const loc = $(location ? `<h5>Location:</h5><div class="location">${location}<button class="btn show-map" aria-hidden="true">Map</button><button class="btn directions" aria-label="Directions">Directions</button></div>` : '')
    loc.find('.show-map').on('click', this.showMap.bind(this))
    loc.find('.show-map').on('click', event => $(event.currentTarget).toggleClass('pressed'))
    loc.find('.directions').on('click', this.directions.bind(this))
    this.mapDiv = $('<div class="map"></div>')
    return $('<div class="event"></div>')
      .append(download)
      .append(`<div class="title">${name}</div>`)
      .append(`<h4>${name}</h4>`)
      .append(time)
      .append(sponsor ? `<h5>Sponsor:</h5><div class="sponsor">${sponsor}</div>` :  '<br>')
      .append(about ? `<h5>Description:</h5><div class="description">${about}</div>` :  '<br>')
      .append(loc)
      .append(this.mapDiv)
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
  if (!ampm) return hh24
  if (parseInt(parts[0]) > 12) {
    suffix = ' PM'
    parts[0] = parts[0] - 12
  } else if (parseInt(parts[0]) === 12) {
    suffix = ' PM'
  }
  return parts.join(':') + suffix
}

/**
 * @desc Default mapping for CSV columns <div><code>CalendarEvent.DEFAULT_PROPERTIES = {<br>&nbsp;&nbsp;date: 'date',<br>&nbsp;&nbsp;name: 'name',<br>&nbsp;&nbsp;about: 'about',<br>&nbsp;&nbsp;start: 'start',<br>&nbsp;&nbsp;end: 'end',<br>&nbsp;&nbsp;location: 'location',<br>&nbsp;&nbsp;sponsor: 'sponsor'<br>}</code></div>
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
 * @desc Constructor options for {@link module:CalendarEvent~CalendarEvent}
 * @public
 * @typedef {Object}
 * @property {string} date Event date (yyyy-mm-dd)
 * @property {Object} data The event data
 * @property {string} timeZone Event date (yyyy-mm-dd)
 * @property {Object<string, string>} [properties=CalendarEvent.DEFAULT_PROPERTIES] Mapping of the event properties
 * @property {function()=} showMap A function to create and show the map
 * @property {function()=} geocode A function to geocode the event location and show it on the map
 * @property {Geocoder=} geocoder A geocoder implemtating <code><a href="https://maps.nyc.gov/nyc-lib/v1.4.77/doc/module-nyc_Geocoder-Geocoder.html">nyc-lib/nyc/Geocoder</a></code> (try <code><a href="https://maps.nyc.gov/nyc-lib/v1.4.77/doc/module-nyc_OsmGeocoder-OsmGeocoder.html">nyc-lib/nyc/OsmGeocoder</a></code> with implementation specific <code><a href="https://maps.nyc.gov/nyc-lib/v1.4.77/doc/module-nyc_OsmGeocoder-OsmGeocoder.html#.Options">constructor options</a></code>)
 * @property {function():JQuery=} eventHtml Custom render for the event details (must return a JQuery DIV with class="event")
 */
 CalendarEvent.Options

export default CalendarEvent
