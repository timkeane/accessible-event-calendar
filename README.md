# accessible-event-calendar

[About](#about)

[Build](#build)

[Usage](#usage)

[CSV Format Requirements](#csv-format-requirements)

## About

This project was built to deliver a simple, light weight and low tech event calendar for use within the nyc.gov web site. Among the requirements were ease of updating events by non programmers, as well as accessible screen reader performance and keyboard navigation. The event data is created as simple CSV in a spreadsheet or text editor. Screen reader performance and keyboard navigation were acheived through a series of agile accessible design working sessions with visually impaired screen reader users.

## Now with OSM event location maps!

![Now with OSM event location maps!](./screenshot.png)

## Build

### Build the deployable javascript and example implementation

  * Clone `git clone https://github.com/timkeane/accessible-event-calendar`
  * Run `npm install`
  * Run `npm run build`
  * Deployable files will be located in the `dist` folder

## Usage

### Generate the calendar data

#### Example CSV

|date|name|start|end|
|---|---|---|---|
|2023-01-01|New Year's Day Brunch|11am|3:30PM|
|2023-01-16|MLK Day Event|1200|1700|
|2023-03-17|St. Patrick's Day Parade|9a|5p|

#### Know the time zone for the data
  * Run `Intl.supportedValuesOf('timeZone')` in the browser console to get a list of all time zones
  * Run `Intl.DateTimeFormat().resolvedOptions().timeZone` in the browser console to get the system time zone

### Basic javascript usage

#### [Build](#build) or [download the latest release](https://github.com/timkeane/accessible-event-calendar/releases)

#### Example page

```html
<!DOCTYPE html>
<html>
  <head>
    <title>calendar-demo</title>
    <!-- 
      Include javascript dependencies
    -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.2/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js"></script>
    <!-- 
      Include the accessible-event-calendar javascript and css
    -->
    <script src="./calendar.min.js"></script>
    <link href="./calendar.min.css" rel="stylesheet">
  </head>
  <body>
    <!-- 
      Create a target DIV on the page 
      into which the calendar will be rendered
    -->
    <div id="calendar-demo"></div>
    <script>
      /* Instantiate the calendar */
      var calendar = new CsvEventCalendar({
        target: '#calendar-demo',
        url: './calendar.csv',
        timeZone: 'America/New_York'
      });
    </script>
  </body>
</html>
```

### Node.js

#### package.json

```json
{
  ...
    "dependencies": {
      "accessible-event-calendar": "latest",
      "jquery": "^3.6.2",
      "papaparse": "^5.3.2",
      ...
    }
  ...
}
```

#### index.js

```javascript
import CsvEventCalendar from 'accessible-event-calendar/CsvEventCalendar';

const calendar = new CsvEventCalendar({
  target: '#calendar-demo',
  url: './calendar.csv',
  timeZone: 'America/New_York'
});
```

#### Change the time zone and the country for geocoding

```javascript
import CsvEventCalendar from 'accessible-event-calendar/CsvEventCalendar';
import OsmGeocoder from 'nyc-lib/nyc/OsmGeocoder';

const calendar = new CsvEventCalendar({
  target: '#calendar-demo',
  url: './calendar.csv',
  timeZone: 'Europe/London',
  geocoder: new OsmGeocoder({countryCodes: ['gb']})
});
```

## CSV Format Requirements

### File must include a header row with column names for the following event properties:
* Event date
  * Recommended column name `date`
  * Required format: `yyyy-mm-dd`
* Event name
  * Recommended column name `name`
* Event start time
  * Recommended column name `start`
  * 12 hr or 24 hr format
* Event end time
  * Recommended column name `end`
  * 12 hr or 24 hr format

#### Example CSV

|date|name|start|end|
|---|---|---|---|
|2023-01-01|New Year's Day Brunch|11am|3:30PM|
|2023-01-16|MLK Day Event|1200|1700|
|2023-03-17|St. Patrick's Day Parade|9a|5p|

### File may contain optional column names for the following event properties:
* Event sponsor
  * Recommended column name `sponsor`
* Event location
  * Recommended column name `location`
* Event description
  * Recommended column name `about`

#### Example CSV

|date|name|start|end|location|sponsor|about
|---|---|---|---|---|---|---|
|2023-01-01|New Year's Day Brunch|11am|3:30PM|Someplace fancy|The New Year Committee|Green eggs and ham
|2023-01-16|MLK Day Event|1200|1700|Central Park|Parks Department|Many speakers
|2023-03-17|St. Patrick's Day Parade|9a|5p|5th Ave|Guinness|Long walk

### CSV columns may alternatively be mapped to the required format

  * Use the [`CsvEventCalendar.Options.csvColumns`](./src/js/CsvEventCalendar.js#L1467) constructor option when creating an instance of [`CsvEventCalendar`](./src/js/CsvEventCalendar.js#L1)

#### Example CSV

|Event date|Title|Begins|Ends|Address|Sponsor|Description
|---|---|---|---|---|---|---|
|2023-01-01|New Year's Day Brunch|11am|3:30PM|Someplace fancy|The New Year Committee|Green eggs and ham
|2023-01-16|MLK Day Event|1200|1700|Central Park|Parks Department|Many speakers
|2023-03-17|St. Patrick's Day Parade|9a|5p|5th Ave|Guinness|Long walk

#### Column mappings

```javascript
var calendar = new CsvEventCalendar({
  target: '#calendar-demo',
  url: './calendar.csv',
  timeZone: 'America/New_York',
  csvColumns: {
    date: 'Event date',
    name: 'Title',
    about: 'Description',
    start: 'Begins',
    end: 'Ends',
    location: 'Address',
    sponsor: 'Sponsor'
  }
});
```

### File may contain additional column names as necessary for the specific implementation
  * All additional CSV columns will become [`CalendarEvent`](./src/js/CalendarEvent.js#L67-L72) properties
  * Use the [`CsvEventCalendar.Options.eventHtml`](./src/js/CalendarEvent.js#L235) constructor option when creating an instance of [`CsvEventCalendar`](./src/js/CalendarEvent.js#L1) to alter the HTML rendering of events

#### Example CSV

|date|name|start|end|url
|---|---|---|---|---|
|2023-01-01|New Year's Day Brunch|11am|3:30PM|https://new.year.day/
|2023-01-16|MLK Day Event|1200|1700|https://mlk.2023.day/
|2023-03-17|St. Patrick's Day Parade|9a|5p|https://weargreen.org

#### Specify an `eventHtml` function

```javascript
var calendar = new CsvEventCalendar({
  target: '#calendar-demo', 
  url: './calendar.csv',
  timeZone: 'America/New_York',
  eventHtml: function() {
    var html = CalendarEvent.prototype.html.call(this);
    var a = $('<a></a>')
      .html('Find out more...')
      .attr('href', this.url);
    return html.append(a);
  }
});
```
