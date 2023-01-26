/**
 * @module NycEvent
 */

import LocationMgr from 'nyc-lib/nyc/ol/LocationMgr'
import CalendarEvent from '../CalendarEvent'
import olms from 'ol-mapbox-style'

class NycEvent extends CalendarEvent {
  /**
  * @desc Create an instance of NycEvent
   * @public
   * @class
   * @extends {module:CalendarEvent~CalendarEvent}
   * @constructor
  * @param {module:NycEvent~NycEvent.Options} options NycEvent options
  */
  constructor(options) {
    options.timeZone = options.timeZone || NycEvent.DEFAULT_TIME_ZONE
    super(options)
    /**
     * @private
     * @member {string}
     */
    this.geoclientUrl = `${options.geoclientUrl}&page=${encodeURIComponent(document.location.pathname)}`
  }
  /**
   * @desc Shows a map of the event location. May be optionally injected with constructor options.
   * @override
   * @public
   * @method
   */
  showMap() {
    if (this.map === null) {
      olms(this.mapDiv.show()[0], NycEvent.DEFAULT_MAP_URL).then(map => {
        this.map = map
        this.geocode()
      }).catch(err => console.error(err))
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
   * @override
   * @method
   */
  geocode() {
    this.locationMgr = this.locationMgr || new LocationMgr({map: this.map, url: this.geoclientUrl})
    this.locationMgr.goTo(this.location)
  }
}

/**
 * @private
 * @const {string}
 */
NycEvent.DEFAULT_TIME_ZONE = 'America/New_York'

/**
 * @private
 * @const {string}
 */
NycEvent.DEFAULT_MAP_URL = 'https://www.arcgis.com/sharing/rest/content/items/df7862bfd7984baab51ff9df8e214278/resources/styles/root.json?f=json'

/**
 * @desc Constructor options for {@link module:NycEvent~NycEvent}
 * @public
 * @typedef {Object}
 * @property {Object<string, string>} [properties=CalendarEvent.DEFAULT_PROPERTIES] Mapping of the event properties
 * @property {string} date Event date (yyyy-mm-dd)
 * @property {Object} data The event data
 * @property {string=} geoclientUrl The geoclient URL
 * @property {string} [timeZone={@link module:NycEvent~NycEvent.DEFAULT_TIME_ZONE}] The event time zone
 * @property {function()=} showMap A showMap implemtation
 * @property {function()=} geocode A geocode implemtation
 * @property {function():JQuery=} eventHtml Custom render for the event details (must return a JQuery DIV with class="event")
 */
NycEvent.Options

export default NycEvent
