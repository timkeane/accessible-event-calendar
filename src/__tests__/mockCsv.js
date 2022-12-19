const data = [
  {name: 'event 1', about: 'about 1', start: '2pm', end: '3pm', sponsor: 'sponsor 1', location: 'location 1'},
  {name: 'event 2', about: 'about 2', start: '11am', end: '1pm', sponsor: 'sponsor 2', location: 'location 2'},
  {name: 'event 3', about: 'about 3', start: '12pm', end: '1pm', sponsor: 'sponsor 3', location: 'location 3'},
  {}
]
const differentData = [
  {'Event name': 'event 1', 'Event description': 'about 1', 'Start time': '2pm', 'End time': '3pm', 'Event sponsor': 'sponsor 1', 'Event address': 'location 1'},
  {'Event name': 'event 2', 'Event description': 'about 2', 'Start time': '11am', 'End time': '1pm', 'Event sponsor': 'sponsor 2', 'Event address': 'location 2'},
  {'Event name': 'event 3', 'Event description': 'about 3', 'Start time': '12pm', 'End time': '1pm', 'Event sponsor': 'sponsor 3', 'Event address': 'location 3'},
  {}
]

let date = new Date()
date.setHours(0, 0, 0, 0)

date.setDate(date.getDate() - 1)
data[0].date = date.toISOString().split('T')[0]
date.setDate(date.getDate() + 1)
data[1].date = date.toISOString().split('T')[0]
date.setDate(date.getDate() + 1)
data[2].date = date.toISOString().split('T')[0]

date = new Date()
date.setHours(0, 0, 0, 0)

date.setDate(date.getDate() - 1)
data[0].date = date.toISOString().split('T')[0]
date.setDate(date.getDate() + 1)
data[1].date = date.toISOString().split('T')[0]
date.setDate(date.getDate() + 1)
data[2].date = date.toISOString().split('T')[0]


export const MOCK_CSV_RESPONSE = {data}
export const MOCK_DIFF_CSV_RESPONSE = {data: differentData}