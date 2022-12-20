import CalendarEvent from '../js/CalendarEvent'

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
const dates = []
const differentDates = []

let date = new Date()
date.setHours(0, 0, 0, 0)

date.setDate(date.getDate() - 1)
const d0 = date.toISOString().split('T')[0]
dates.push(d0)
data[0].date = d0
date.setDate(date.getDate() + 1)
const d1 = date.toISOString().split('T')[0]
dates.push(d1)
data[1].date = d1
date.setDate(date.getDate() + 1)
const d2 = date.toISOString().split('T')[0]
dates.push(d2)
data[2].date = d2

date = new Date()
date.setHours(0, 0, 0, 0)

date.setDate(date.getDate() - 1)
const dd0 = date.toISOString().split('T')[0]
differentDates.push(dd0)
differentData[0].Date = dd0
date.setDate(date.getDate() + 1)
const dd1 = date.toISOString().split('T')[0]
differentDates.push(dd1)
differentData[1].Date = dd1
date.setDate(date.getDate() + 1)
const dd2 = date.toISOString().split('T')[0]
differentDates.push(dd2)
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

export const MOCK_CSV_RESPONSE = {data}
export const MOCK_DIFF_CSV_RESPONSE = {data: differentData}
export const MOCK_EVENTS = expected
export const MOCK_DIFF_EVENTS = differentExpected
