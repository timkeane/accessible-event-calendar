# accessible-event-calendar

## Build

### To build the deployable javascript and example implementation:

  * Clone `git clone https://github.com/timkeane/accessible-event-calendar`
  * Run `npm install`
  * Run `npm run build`
  * Deployable files will be located in the `dist` folder

## CSV Format Requirements

### File must include a header row with column names for
* Event name (recommended column name `name`)
* Event date (recommended column name `date`)
* Event start time (recommended column name `start`)
* Event end time (recommended column name `end`)

### File may contain optional column names for
* Event sponsor (recommended column name `sponsor`)
* Event location (recommended column name `location`)
* Event description (recommended column name `about`)
