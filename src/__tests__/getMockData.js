import CalendarEvent from '../js/CalendarEvent'
import CsvEventCalendar from '../js/CsvEventCalendar'

const getMockData = (today) => {

  const data = [{name: 'event 1', about: 'about 1', start: '2pm', end: '3pm', sponsor: 'sponsor 1', location: 'location 1'},
    {name: 'event 2', about: 'about 2', start: '11am', end: '1pm', sponsor: 'sponsor 2', location: 'location 2'},
    {name: 'event 3', about: 'about 3', start: '12pm', end: '1pm', sponsor: 'sponsor 3', location: 'location 3'},
    {}
  ]
  const differentData = [
    {'Event Name': 'event 1', 'Description': 'about 1', 'Start Time': '2pm', 'End Time': '3pm', 'Sponsor': 'sponsor 1', 'Address': 'location 1'},
    {'Event Name': 'event 2', 'Description': 'about 2', 'Start Time': '11am', 'End Time': '1pm', 'Sponsor': 'sponsor 2', 'Address': 'location 2'},
    {'Event Name': 'event 3', 'Description': 'about 3', 'Start Time': '12pm', 'End Time': '1pm', 'Sponsor': 'sponsor 3', 'Address': 'location 3'},
    {}
  ]
  const multiEventData = [
    {name: 'event 1', about: 'about 1', start: '2pm', end: '3pm', sponsor: 'sponsor 1', location: 'location 1'},
    {name: 'event 2', about: 'about 2', start: '11am', end: '1pm', sponsor: 'sponsor 2', location: 'location 2'},
    {name: 'event 3', about: 'about 3', start: '12pm', end: '1pm', sponsor: 'sponsor 3', location: 'location 3'},
    {name: 'event 4', about: 'about 4', start: '1pm', end: '2pm', sponsor: 'sponsor 4', location: 'location 4'},
    {}
  ]

  let date = today

  date.setDate(date.getDate() - 2)
  const d0 = CsvEventCalendar.dateKey(date)
  data[0].date = d0
  multiEventData[0].date = d0
  date.setDate(date.getDate() + 2)
  const d1 = CsvEventCalendar.dateKey(date)
  data[1].date = d1
  multiEventData[1].date = d1
  date.setDate(date.getDate() + 2)
  const d2 = CsvEventCalendar.dateKey(date)
  data[2].date = d2
  multiEventData[2].date = d2
  multiEventData[3].date = d2

  date = today

  date.setDate(date.getDate() - 2)
  const dd0 = CsvEventCalendar.dateKey(date)
  differentData[0].Date = dd0
  date.setDate(date.getDate() + 2)
  const dd1 = CsvEventCalendar.dateKey(date)
  differentData[1].Date = dd1
  date.setDate(date.getDate() + 2)
  const dd2 = CsvEventCalendar.dateKey(date)
  differentData[2].Date = dd2

  const expected = {
    [d0]: [
      new CalendarEvent({
        date: d0,
        timezone: 'America/New_York',
        data: {
          about: 'about 1',
          date: d0,
          end: '3:00 PM',
          location: 'location 1',
          name: 'event 1',
          sponsor: 'sponsor 1',
          start: '2:00 PM'
        }
      })
    ],
    [d1]: [
      new CalendarEvent({
        date: d1,
        timezone: 'America/New_York',
        data: {
          about: 'about 2',
          date: d1,
          end: '1:00 PM',
          location: 'location 2',
          name: 'event 2',
          sponsor: 'sponsor 2',
          start: '11:00 AM'
        }
      })
    ],
    [d2]: [
      new CalendarEvent({
        date: d2,
        timezone: 'America/New_York',
        data: {
          about: 'about 3',
          date: d2,
          end: '1:00 PM',
          location: 'location 3',
          name: 'event 3',
          sponsor: 'sponsor 3',
          start: '12:00 PM'
        }
      })
    ]
  }

  const multiExpected = {
    [d0]: [
      new CalendarEvent({
        date: d0,
        timezone: 'America/New_York',
        data: {
          about: 'about 1',
          date: d0,
          end: '3:00 PM',
          location: 'location 1',
          name: 'event 1',
          sponsor: 'sponsor 1',
          start: '2:00 PM'
        }
      })
    ],
    [d1]: [
      new CalendarEvent({
        date: d1,
        timezone: 'America/New_York',
        data: {
          about: 'about 2',
          date: d1,
          end: '1:00 PM',
          location: 'location 2',
          name: 'event 2',
          sponsor: 'sponsor 2',
          start: '11:00 AM'
        }
      })
    ],
    [d2]: [
      new CalendarEvent({
        date: d2,
        timezone: 'America/New_York',
        data: {
          about: 'about 3',
          date: d2,
          end: '1:00 PM',
          location: 'location 3',
          name: 'event 3',
          sponsor: 'sponsor 3',
          start: '12:00 PM'
        }
      }),
      new CalendarEvent({
        date: d2,
        timezone: 'America/New_York',
        data: {
          about: 'about 4',
          date: d2,
          end: '2:00 PM',
          location: 'location 4',
          name: 'event 4',
          sponsor: 'sponsor 4',
          start: '1:00 PM'
        }
      })      
    ]
  }

  const differentExpected = {
    [dd0]: [
      new CalendarEvent({
        date: dd0,
        timezone: 'America/New_York',
        data: {
          about: 'about 1',
          date: dd0,
          end: '3:00 PM',
          location: 'location 1',
          name: 'event 1',
          sponsor: 'sponsor 1',
          start: '2:00 PM'
        }
      })
    ],
    [dd1]: [
      new CalendarEvent({
        date: dd1,
        timezone: 'America/New_York',
        data: {
          about: 'about 2',
          date: dd1,
          end: '1:00 PM',
          location: 'location 2',
          name: 'event 2',
          sponsor: 'sponsor 2',
          start: '11:00 AM'
        }
      })
    ],
    [dd2]: [
      new CalendarEvent({
        date: dd2,
        timezone: 'America/New_York',
        data: {
          about: 'about 3',
          date: dd2,
          end: '1:00 PM',
          location: 'location 3',
          name: 'event 3',
          sponsor: 'sponsor 3',
          start: '12:00 PM'
        }
      })
    ]
  }

  return {
    csvResponse: {data},
    differentCsvResponse: {data: differentData},
    mulitEventCsvResponse: {data: multiEventData},
    events: expected,
    differentEvents: differentExpected,
    multiEvents: multiExpected
  }

}

export default getMockData
