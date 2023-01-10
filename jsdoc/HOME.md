# accessible-event-calendar

<ul style="font-size:150%">
  <li><a href="#about">About</a></li>
  <li><a href="#build">Build</a></li>
  <li><a href="#usage">Usage</a></li>
  <li><a href="#csv-format-requirements">CSV Format Requirements</a></li>
</ul>

## About<a name="about"></a>

## Build<a name="build"></a>

### Build the deployable javascript and example implementation

  * Clone `git clone https://github.com/timkeane/accessible-event-calendar`
  * Run `npm install`
  * Run `npm run build`
  * Deployable files will be located in the `dist` folder

## Usage<a name="usage"></a>

### Generate your calendar data

#### Example CSV

|date|name|start|end|
|---|---|---|---|
|2023-01-01|New Year's Day Brunch|11am|3:30PM|
|2023-01-16|MLK Day Event|1200|1700|
|2023-03-17|St. Patrick's Day Parade|9a|5p|

<br>

### Basic javascript usage

#### [Build](#build) or [download the latest release](https://github.com/timkeane/accessible-event-calendar/releases)

```
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
        Include the javascript and css on your page
      -->
      <script src="./calendar.min.js"></script>
      <link href="./calendar.min.css" rel="stylesheet">
    </head>
    <body>
      <!-- 
        Create a target DIV on your page into which the
        calendar will be rendered
      -->
      <div id="calendar-demo"></div>
      <script>
        /* Instantiate the calendar */
        var calendar = new CsvEventCalendar({
          target: $('#calendar-demo'), 
          url: './calendar.csv'
        });
      </script>
    </body>
  </html>
```

### Node.js

#### package.json
```
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

```

import CsvEventCalendar from 'accessible-event-calendar/CsvEventCalendar'

const calendar = new CsvEventCalendar({
  target: '#calendar-demo',
  url: './calendar.csv'
})

```

## CSV Format Requirements<a name="csv-format-requirements"></a>

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

<br>

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

<br>

### CSV columns may alternatively be mapped to the required format

  * Use the [`CsvEventCalendar.Options.csvColumns`](module-CsvEventCalendar-CsvEventCalendar.html#.Options) constructor option when creating an instance of [`CsvEventCalendar`](module-CsvEventCalendar-CsvEventCalendar.html)

#### Example CSV

|Event date|Title|Begins|Ends|Address|Sponsor|Description
|---|---|---|---|---|---|---|
|2023-01-01|New Year's Day Brunch|11am|3:30PM|Someplace fancy|The New Year Committee|Green eggs and ham
|2023-01-16|MLK Day Event|1200|1700|Central Park|Parks Department|Many speakers
|2023-03-17|St. Patrick's Day Parade|9a|5p|5th Ave|Guinness|Long walk

<br>

#### Column mappings

```
  var calendar = new CsvEventCalendar({
    target: $('#calendar-demo'), 
    url: './calendar.csv',
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
  * All additional CSV columns will become [`CalendarEvent`](module-CalendarEvent-CalendarEvent.html) properties
  * Use the [`CsvEventCalendar.Options.eventHtml`](module-CsvEventCalendar-CsvEventCalendar.html#.Options) constructor option when creating an instance of [`CsvEventCalendar`](module-CsvEventCalendar-CsvEventCalendar.html) to alter the HTML rendering of events

#### Example CSV

|date|name|start|end|url
|---|---|---|---|---|
|2023-01-01|New Year's Day Brunch|11am|3:30PM|https://new.year.day/
|2023-01-16|MLK Day Event|1200|1700|https://mlk.2023.day/
|2023-03-17|St. Patrick's Day Parade|9a|5p|https://weargreen.org

<br>

#### Specify an `eventHtml` function

```
  var calendar = new CsvEventCalendar({
    target: $('#calendar-demo'), 
    url: './calendar.csv',
    eventHtml: function() {
      var html = CalendarEvent.prototype.html.call(this);
      var a = $('<a></a>')
        .html('Find out more...')
        .attr('href', this.url);
      return html.append(a);
    }
  });
```
