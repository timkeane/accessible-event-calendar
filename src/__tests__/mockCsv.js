const data = [
  {name: 'event 1', about: 'about 1', start: '2pm', end: '3pm', sponsor: 'sponsor 1', location: 'location 1'},
  {name: 'event 2', about: 'about 2', start: '11am', end: '1pm', sponsor: 'sponsor 2', location: 'location 2'},
  {name: 'event 3', about: 'about 3', start: '12pm', end: '1pm', sponsor: 'sponsor 3', location: 'location 3'},
  {}
]
const differentData = [
  {'Event Name': 'event 1', 'Description': 'about 1', 'Start Time': '2pm', 'End Time': '3pm', 'Sponsor': 'sponsor 1', 'SAddress': 'location 1'},
  {'Event Name': 'event 2', 'Description': 'about 2', 'Start Time': '11am', 'End Time': '1pm', 'Sponsor': 'sponsor 2', 'SAddress': 'location 2'},
  {'Event Name': 'event 3', 'Description': 'about 3', 'Start Time': '12pm', 'End Time': '1pm', 'Sponsor': 'sponsor 3', 'SAddress': 'location 3'},
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
