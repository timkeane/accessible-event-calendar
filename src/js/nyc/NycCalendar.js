/**
 * @module NycCalendar
 */

import CsvEventCalendar from "../CsvEventCalendar"
import NycCalendarEvent from "./NycEvent"

class NycCalendar extends CsvEventCalendar {
  /**
   * @desc Create an instance of NycCalendar
   * @public
   * @class
   * @extends {module:CsvEventCalendar~CsvEventCalendar}
   * @constructor
   * @param {module:NycCalendar~NycCalendar.Options} options NycCalendar options
   */
  constructor(options) {
    options.timeZone = options.timeZone || NycCalendarEvent.DEFAULT_TIME_ZONE
    super(options)
    this.geoclientUrl = options.geoclientUrl
  }
  /**
   * @public
   * @override
   * @method
   * @param {string} key The date key
   * @param {Object<string, string>} calEvent The CSV calendar event row
   */
  createCalendarEvent(key, calEvent) {
    return new NycCalendarEvent({
      timeZone: this.clientTimeZone,
      date: key,
      data: calEvent,
      properties: this.csvColumns,
      eventHtml: this.eventHtml,
      geoclientUrl: this.geoclientUrl,
      showMap: this.showMap,
      geocode: this.geocode
    })
  }
}

/**
 * @desc Constructor options for {@link module:NycCalendar~CsvEventCalendar}
 * @public
 * @typedef {Object}
 * @property {jQuery|Element|string} target The target DOM node for creating the calendar
 * @property {string} url The URL to the CSV event data
 * @property {string} [timeZone={@link module:NycCalendarEvent~NycCalendarEvent.DEFAULT_TIME_ZONE}] The calendar time zone
 * @property {Object<string, string>} [csvColumns={@link module:CalendarEvent~CalendarEvent.DEFAULT_PROPERTIES}] A map of CSV column names keyed to the necessary property names
 * @property {function(string)=} dateChanged Handler for date changed event
 * @property {function(string=)} viewChanged Handler for state changed event
 * @property {function(module:NycCalendar~NycCalendar)=} ready Fires once data is loaded
 * @property {function():JQuery=} eventHtml Custom render for the event details (must return a JQuery DIV with class="event")
 * @property {function()=} showMap A showMap implemtation
 * @property {function()=} geocode A geocode implemtation
 * @property {string=} geoclientUrl The geoclient URL
 * @property {string=} min The minimum date formatted as yyyy-mm-dd (defaults to the lower bound of events)
 * @property {string=} max The maximum date formatted as yyyy-mm-dd (defaults to the upper bound of events)
 */
NycCalendar.Options

export default NycCalendar
