import $ from 'jquery'
import CsvEventCalendar from '../js/CsvEventCalendar'


let target
beforeEach(() => {
  // window.navigator = {
  //   language: 'en-US'
  // }
  $('body').append($('<div id="test-cal"></div>'))
})

afterEach(() => {
  // window.navigator = undefined
  $('#test-cal').remove()
})

describe('constructor', () => {
  test('constructor', () => {
    expect.assertions(1)

    const calendar = new CsvEventCalendar({
      targetL: $('#test-cal'),
      url: '../../data/calendar.csv'
    })
    expect(calendar instanceof CsvEventCalendar).toBe(true)
  })
})
