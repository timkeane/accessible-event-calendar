/**
 * @module ICalendar
 */

import $ from 'jquery'
import Papa from 'papaparse'

class ICalendar {
  /**
   * @desc Create an instance of ICalendar
   * @public
   * @constructor
   * @param {module:ICalendar.Options} options ICalendar options
   */
  constructor(options) {
  }
}

/**
 * @desc Constructor options for {@link module:ICalendar}
 * @public
 * @typedef {Object}
 * @property {jQuery|Element|string} target The target DOM node for creating the calendar
 * @property {string} url The URL to the CSV event data
 * @property {string} min The minimum date formatted as yyyy-mm-dd
 * @property {string} max The maximum date formatted as yyyy-mm-dd
 * @property {function} dateChanged Handler for date changed event
 * @property {function} viewChanged Handler for state changed event
 */
 ICalendar.Options

export default ICalendar
