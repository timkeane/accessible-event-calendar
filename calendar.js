/*
 *  Thanks to Amit Gupta for the calendar grid algorithm!
 *  https://dev.to/amitgupta15/create-a-responsive-calendar-with-vanilla-javascript-and-css-grid-35ih
 */

function CsvEventCalendar(options) {
  var me = this;
  this.firstLoad = true;
  this.eventsIndex = {ready: false, noData: false};
  this.container = $(options.container).addClass('calendar');
  this.min = options.min;
  this.max = options.max;
  this.alertTimeout = null;
  this.eventHtml = options.eventHtml || this.eventHtml;
  this.selectionChanged = options.selectionChanged || function() {};
  this.today = new Date();

  this.state = {
    today: this.dateKey(this.today),
    year: this.today.getFullYear(),
    month: this.today.getMonth(),
    date: this.today.getDate(),
    day: this.today.getDay(),
    view: 'month',
    returnToView: 'month',
    key: function() {
      var m = this.month + 1;
      var d = this.date;
      if (m < 10) m = '0' + m;
      if (d < 10) d = '0' + d;
      return this.year + '-' + m + '-' + d;
    }
  };

  this.controls();
  this.view('month');
  this.resize();

  $(window).on('resize', this.resize.bind(this));

  if (options.url) {
    Papa.parse(options.url, {
      download: true,
      header: true,
      complete: function(response) {
        me.indexData(response);
        me.container.find('.controls h2').attr('aria-label', 
          me.title({key: me.state.key()}).month.long + 
          ' - showing ' + $('.view .event').length + ' events');
        }
    });
  } else {
    this.eventsIndex.noData = true;
    this.container.find('.view').get(0).className = 'view-wo-events';
    this.container.find('.controls').addClass('controls-wo-views');
    this.noCsvUrl = true;
  }

  return this;
};

CsvEventCalendar.prototype.updateState = function(options) {
  var before = JSON.stringify(this.state);
  var returnToView = this.state.view;
  this.state.view = options.view || this.state.view;
  this.state.year = options.year || this.state.year;
  this.state.month = options.month !== undefined ? options.month : this.state.month;
  var currentMonth = new Date(this.state.year, this.state.month + 1, 0);
  var lastDayOfMonth = currentMonth.getDate();
  this.state.date = options.date || this.state.date;
  if (this.state.date > lastDayOfMonth) {
    this.state.month = this.state.month;
    this.state.date = lastDayOfMonth;
  }
  if (this.state.view === 'day' && returnToView !== 'day') {
    this.state.returnToView = returnToView;
  }
  if (this.state.view === 'week') {
    this.state.returnToView = 'month';
  }
  if (options.key) {
    this.state.year = this.yearNumber(options.key);
    this.state.month = this.monthNumber(options.key) - 1;
    this.state.date = this.dateNumber(options.key);
  }
  if (this.state.key() > this.max) {
    this.updateState({key: this.max});
    this.alert('max');
    return;
  }
  if (this.state.key() < this.min) {
    this.updateState({key: this.min});
    this.alert('min');
    return;
  }
  var after = JSON.stringify(this.state);
  var key = this.state.key();
  this.container.find('.controls input').val(key);
  this.container.find('.controls select').val(this.state.view);
  if (after !== before) {
    this.week();
    this.selectionChanged({
      date: key,
      events: this.eventsIndex[key] || []
    });
  }
};

CsvEventCalendar.prototype.dateKey = function(date) {
  var parts =  date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).split('/');
  return parts[2] + '-' + parts[0] + '-' + parts[1];
};

CsvEventCalendar.prototype.dateFromKey = function(key) {
  return new Date(key + 'T00:00');
};

CsvEventCalendar.prototype.dateNumber = function(key) {
  return key.split('-')[2] * 1;
};

CsvEventCalendar.prototype.dayNumber = function(key) {
  var date = this.dateFromKey(key);
  return date.getDay();
};

CsvEventCalendar.prototype.dayName = function(key) {
  var day = this.dayNumber(key);
  return CsvEventCalendar.DAY_NAMES[day];
};

CsvEventCalendar.prototype.monthNumber = function(key) {
  return key.split('-')[1] * 1;
};

CsvEventCalendar.prototype.monthName = function(key) {
  var month = this.monthNumber(key);
  return CsvEventCalendar.MONTH_NAMES[month - 1];
};

CsvEventCalendar.prototype.sameMonth = function(key1, key2) {
  return this.monthNumber(key1) === this.monthNumber(key2);
};

CsvEventCalendar.prototype.yearNumber = function(key) {
  return key.split('-')[0] * 1;
};

CsvEventCalendar.prototype.sameYear = function(key1, key2) {
  return this.yearNumber(key1) === this.yearNumber(key2);
};

CsvEventCalendar.prototype.dayNode = function(key) {
  return this.container.find('[data-date-key="' + key + '"]')
};

CsvEventCalendar.prototype.title = function(options) {
  var key = options.key || this.state.key();
  var year = this.yearNumber(key);
  var month = this.monthName(key);
  var mo = month.substr(0, 3);
  var m = this.monthNumber(key);
  var date = this.dateNumber(key);
  var day = this.dayName(key);
  var d = day.substr(0, 3);
  var title = {
    month: {
      long: month + ' ' + year,
      short: mo + ' ' + year,
      abbr: m + '/' + year
    },
    day: {
      long: day + ' ' + month + ' ' + date + ', ' + year,
      medium: day.substr(0, 3) + ' ' + mo + ' ' + date + ', ' + year,
      short: date,
      abbr: m + '/' + date + '/' + year
    }
  }
  $(options.node).find('.month .long').html(title.month.long);
  $(options.node).find('.month .short').html(title.month.short);
  $(options.node).find('.month .abbr').html(title.month.abbr);
  return title;
};

CsvEventCalendar.prototype.previousMonth = function(dates) {
  var firstDay = new Date(this.state.year, this.state.month).getDay();
  var totalDaysInPrevMonth = new Date(this.state.year, this.state.month, 0).getDate();
  for (var i = 1; i <= firstDay; i++) {
    var prevMonthDate = totalDaysInPrevMonth - firstDay + i;
    var key = this.dateKey(new Date(this.state.year, this.state.month - 1, prevMonthDate));    
    dates.push({key: key, date: prevMonthDate, monthClass: 'prev'});
  }
};

CsvEventCalendar.prototype.currentMonth = function(dates) {
  var totalDaysInMonth = new Date(this.state.year, this.state.month + 1, 0).getDate();
  for (var i = 1; i <= totalDaysInMonth; i++) {
    var key = this.dateKey(new Date(this.state.year, this.state.month, i));
    dates.push({key: key, date: i, monthClass: 'current'});
  }  
};

CsvEventCalendar.prototype.nextMonth = function(dates) {
  var gridsize = 42;
  if(dates.length < gridsize) {
    var count = gridsize - dates.length;
    for(var i = 1; i <= count; i++) {
      var key = this.dateKey(new Date(this.state.year, this.state.month + 1, i));
      dates.push({key: key, date: i, monthClass: 'next'});
    }
  }
};

CsvEventCalendar.prototype.navigate = function(domEvent) {
  var delta =  $(domEvent.currentTarget).data('delta');
  var view = this.state.view;
  clearTimeout(this.alertTimeout);
  this.container.find('.controls .alert').hide();
  this.container.find('.controls .inputs').show();
  this.container.find('.controls button').removeAttr('disabled');
  this[view + 'Navigate'](delta);
  this.view(view);
};

CsvEventCalendar.prototype.monthNavigate = function(delta) {
  var before = this.state.month;
  var month = this.state.month;
  var year = this.state.year;
  if (before === 11 && delta === 1) {
    month = 0;
    year = this.state.year + 1;
  } else if (before === 0 && delta === -1) {
    month = 11;
    year = this.state.year - 1;
  } else {
    month = this.state.month + delta;
  }
  this.updateState({month: month, year: year})
};

CsvEventCalendar.prototype.weekNavigate = function(delta) {
  var key = this.state.key();
  var date = this.dateFromKey(key);
  date.setDate(date.getDate() + (delta * 7));
  this.updateState({key: this.dateKey(date)});
  var dayNode = this.dayNode(this.state.key())
  if (!dayNode.length) {
    this.monthView();
  }
  this.container.find('li.day').removeClass('selected');
  dayNode.addClass('selected');
  this.week();
};

CsvEventCalendar.prototype.dayNavigate = function(delta) {
  var key = this.state.key();
  var date = this.dateFromKey(key);
  date.setDate(date.getDate() + delta);

  var nextKey = this.dateKey(date);
  this.updateState({key: nextKey});

  var dayNode = this.dayNode(this.state.key())
  if (!dayNode.length) {
    this.monthView();
  }
  if (!dayNode.hasClass('has-events')) {
    this.dayNavigate(delta);
    return;
  }
  this.container.find('li.day').removeClass('selected');
  dayNode.addClass('selected');
};

CsvEventCalendar.prototype.controls = function() {
  var me = this;
  var back = $('<button class="btn back"><span class="long">Previous</span><span class="short">&lt;</span></button>')
    .data('delta', -1)
    .on('click', this.navigate.bind(this));
  var next = $('<button class="btn next"><span class="long">Next</span><span class="short">&gt;</span></button>')
    .data('delta', 1)
    .on('click', this.navigate.bind(this));
  var input = $('<input type="date">')
    .val(this.state.key())
    .on('change', function() {
      me.updateState({key: input.val()})
      me.view('day');
    });
  var select = $('<select></select>')
    .append('<option value="month">View by month</option>')
    .append('<option value="week">View by week</option>')
    .append('<option value="day">View by day</option>')
    .on('input', function() {
      me.view(select.val());
    });
  var h2 = $('<h2 aria-polite="assertive"></h2>')
    .append(
      $('<span class="month"></span>')
        .append('<span class="long"></span>')
        .append('<span class="short"></span>')
        .append('<span class="abbr"></span>')
    );
  var div1 = $('<div class="buttons"></div>')
    .append(back)
    .append(h2)
    .append(next);
  var div2 = $('<div class="inputs"></div>')
    .append(input)
    .append(select);
  var controls = $('<div class="controls"></div>')
    .append(div1)
    .append(div2)
    .append('<div class="alert" aria-live="assertive" tabindex="0"></div>');
  this.container.append(controls);
};

CsvEventCalendar.prototype.calendar = function(dates) {
  var me = this;
  var month = this.month();
  var endOfWeek1 = dates[6].key;
  var startOfWeek6 = dates[35].key;
  var weekOfMonth = 0;
  $.each(dates, function(i, date) {
    me.day(date, weekOfMonth, month);
    if ((i + 1) % 7 === 0) {
      weekOfMonth = weekOfMonth + 1;
      if (i === 34 && !me.sameMonth(endOfWeek1, startOfWeek6)) {
        return false;
      }
    }
  });
};

CsvEventCalendar.prototype.month = function() {
  var viewContainer = this.container.find('.view, .view-wo-events');
  var days = $('<ul class="day-names" aria-hidden="true"></ul>');
  var dates = $('<ol class="dates"></ol>');
  if (!viewContainer.length) {
    viewContainer = $('<div class="view month"></div>');
  }
  this.container.append(viewContainer.empty().append(days).append(dates));
  $.each(CsvEventCalendar.DAY_NAMES, function(d, name) {
    var li = $('<li></li>')
      .append('<span class="long">' + name + '</span>')
      .append('<span class="medium">' + name.substr(0, 3) + '</span>')
      .append('<span class="short">' + name.substr(0, 1) + '</span>')
      days.append(li);
  });
  return dates;
};

CsvEventCalendar.prototype.week = function() {
  var key = this.state.key();
  var dayNode = this.dayNode(key);
  this.container.find('li.day')
    .removeClass('start-of-week')
    .removeClass('selected-week');
  $('.week-' + dayNode.data('week'))
    .addClass('selected-week')
    .first().addClass('start-of-week');
};

CsvEventCalendar.prototype.day = function(date, week, month) {
  var me = this;
  var key = date.key;
  var title = this.title({key: key}).day;
  var close = $('<button class="close"></button>')
    .on('click', function(domEvent) {
      domEvent.stopImmediatePropagation();
      me.view(me.state.returnToView);
    });
  var h3 = $('<h3></h3>');
  var button = $('<button class="name"></button>');
  h3.append(button);
  button.append('<span class="long">' + title.long + '</span>')
    .append('<span class="medium">' + title.medium + '</span>')
    .append('<span class="abbr">' + title.abbr + '</span>')
    .append('<span class="short">' + title.short + '</span>');
  var day = $('<li class="day"></li>')
    .data('week', week)
    .addClass(date.monthClass + '-mo')
    .addClass( 'week-' + week)
    .attr('data-date-key', date.key)
    .append(h3)
    .append(close)
    .append('<div class="events"></div>')
    .on('click', function() {
      if (me.eventsIndex.noData || day.hasClass('has-events')) {
        me.updateState({key: key});
        me.view('day');
      }
    });
    month.append(day);
    return day;
};

CsvEventCalendar.prototype.view = function(view) {
  if (!view) return;
  this.updateState({view: view});
  var key = this.state.key();
  var dayNode = this.dayNode(key);
  if (!dayNode.length) {
    this.monthView();
    return this.view(view);
  }
  this.container.find('.view')
    .removeClass('month')
    .removeClass('week')
    .removeClass('day')
    .addClass(view);
  this.title({node: this.container.find('.controls h2')});
  this.container.find('.controls .next').attr({
    'aria-label': 'next ' + view,
    title: 'next ' + view
  });
  this.container.find('.controls .back').attr({
    'aria-label': 'previous ' + view,
    title: 'previous ' + view
  });
  this.container.find('.day button.name').removeAttr('aria-live');
  this.container.find('.day button[data-old-label]').each(function(i, btn) {
    $(btn).attr('aria-label', $(btn).attr('data-old-label'))
      .removeAttr('data-old-label');
  });
  this.container.find('.day button.close')
    .attr('aria-label', 'return to ' + this.state.returnToView + ' view');
  this[view + 'View']();
  this.container.find('.view .day[data-date-key="' + this.state.today + '"]').addClass('today');
  this.focus();
};

CsvEventCalendar.prototype.monthView = function() {
  var dates = [];
  this.previousMonth(dates);
  this.currentMonth(dates);
  this.nextMonth(dates);
  this.calendar(dates);
  this.populate();
  this.container.find('.controls h2').attr('aria-label', 
    this.title({key: this.state.key()}).month.long + 
    ' - showing ' + $('.view .event').length + ' events');
};

CsvEventCalendar.prototype.weekView = function() {
  var key = this.container.find('.day.start-of-week').attr('data-date-key');
  this.container.find('.view').attr('aria-label', 
    'week of ' + this.title({key: key}).day.long + ' - showing ' + this.container.find('.selected-week .event').length + ' events'
  );
};

CsvEventCalendar.prototype.dayView = function() {
  var key = this.state.key();
  var dayNode = this.dayNode(key);
  var eventCount = this.eventsIndex[key] && this.eventsIndex[key].length || 0;
  var button = dayNode.find('h3 button.name');
  this.container.find('li.day').removeClass('selected');
  var title = this.title({key: key}).day.long;
  var label = title + ' - there no scheduled events to show';
  if (eventCount) {
    label = title + ' - showing ' + eventCount + ' scheduled ' + (eventCount === 1 ? 'event' : 'events');
  }
  dayNode.addClass('selected');
  button.attr('aria-live', 'assertive')
    .attr('data-old-label', button.attr('aria-label'))
    .attr('aria-label', label);
};

CsvEventCalendar.prototype.populate = function() {
  var me = this;
  var calendarEvents = {};
  var dayNodes = this.container.find('.view li.day');
  dayNodes.each(function(i, dayNode) {
    var key = $(dayNode).attr('data-date-key');
    var title = me.title({key: key}).day.long;
    var events = me.eventsIndex[key];
    var eventCount = events && events.length || 0;
    var eventsNode = $(dayNode).find('.events');
    var button = $(dayNode).find('h3 button');
    $(dayNode).append(eventsNode);
    if (me.eventsIndex.ready) {
      if (events) {
        calendarEvents[key] = events;
        $(dayNode).addClass('has-events');
        $.each(events, function(e, calEvent) {
          eventsNode.append(me.eventHtml(calEvent));
        });
        button.attr('aria-label', title + ' (' + eventCount + (eventCount === 1 ? ' event' : ' events') + ' scheduled');
      } else {
        $(dayNode).attr('aria-hidden', 'true');
        button.attr('aria-label', title + ' (no events scheduled)')
          .attr('tabindex', -1);
        eventsNode.html('<div class="no-events">no events scheduled</div>');
      }
    }
  });
  var dayNode = this.dayNode(this.state.key());
  this.container.find('.view.month .day').removeClass('selected');
  dayNode.addClass('selected');
  this.week();
};

CsvEventCalendar.prototype.indexData = function(response) {
  var me = this;
  var calEvents = response.data;
  this.sortByDate(calEvents);
  if (!this.min) {
    this.min = calEvents[0].date;
    this.container.find('.controls input').attr('min', this.min);
  }
  if (!this.max) {
    this.max = calEvents[calEvents.length - 1].date;
    this.container.find('.controls input').attr('max', this.max);
  }
  $.each(calEvents, function(i, calEvent) {
    var key = calEvent.date;
    me.eventsIndex[key] = me.eventsIndex[key] || [];
    me.eventsIndex[key].push(calEvent);
    me.sortByStartTime(me.eventsIndex[key]);
  });
  this.eventsIndex.ready = true;
  this.populate();
};

CsvEventCalendar.prototype.alert = function(minMax) {
  var message = 'No events scheduled ' + (minMax === 'min' ? 'before ' : 'after ') +
    this.title({key: this[minMax]}).day.long;
  var inputs = this.container.find('.controls .inputs').hide();
  var alert = this.container.find('.controls .alert')
    .html(message)
    .attr('aria-label', message)
    .show()
    .focus();
  this.container.find('.controls button.' +
    (minMax === 'min' ? 'back' : 'next'))
    .attr('disabled', true);
  this.alertTimeout = setTimeout(function() {
    alert.hide();
    inputs.show();
  }, 5000);
};

CsvEventCalendar.prototype.focus = function() {
  var me = this;
  console.warn(this.container.find('.controls .alert').is(':visible'));
  if (!this.firstLoad && !this.container.find('.controls .alert').is(':visible')) {
    var scroll = $(document).scrollTop();
    setTimeout(function() {
      var view = me.state.view;
      var container = me.container;
      if (view === 'month') {
        container.find('.controls h2').attr('tabindex', 0).focus();
      } else if (view === 'week') {
        container.find('.view').attr('tabindex', 0).focus();
        container.scrollTop(0);
        $(document).scrollTop(scroll);
      } else {
        container.find('.view .day.selected button.name').focus();
      }
    }, 300);
  }
  this.firstLoad = false;
};

CsvEventCalendar.prototype.sortByStartTime = function(events) {
  var fmt = CsvEventCalendar.timeFormat;
  events.sort(function(event1, event2) {
    var time1 = fmt(event1.start);
    var time2 = fmt(event2.start);
    if (time1 < time2) {
      return -1;
    } else if (time1 < time2) {
      return 1;
    }
    return 0;
  });
};

CsvEventCalendar.prototype.sortByDate = function(events) {
  events.sort(function(event1, event2) {
    var date1 = event1.date;
    var date2 = event2.date;
    if (date1 < date2) {
      return -1;
    } else if (date1 < date2) {
      return 1;
    }
    return 0;
  });
  while(!events[0].date) {
    events.shift();
  }
};

CsvEventCalendar.prototype.resize = function() {
  var container = this.container;
  var changes = [645, 500, 480, 380, 340, 310];
  var width = container.width();
  for (var i = 0; i < changes.length; i++) {
    var w = changes[i];
    container.removeClass('w-' + w);
    if (width <= w) {
      container.addClass('w-' + w);
    }
  }
};

CsvEventCalendar.prototype.eventHtml = function(calEvent) {
  var fmt = CsvEventCalendar.timeFormat;
  var time = $('<div class="time"></div>')
    .append('<strong>Start:</strong>')
    .append('<span>' + fmt(calEvent.start, true) + '</span>');
  var about = $('<div class="about"></div>')
    .append(calEvent.about);
  if (calEvent.end) {
    time.append('<strong>End:</strong>')
      .append('<span>' + fmt(calEvent.end, true) + '</span>');
  }
  return $('<div class="event"></div>')
    .append('<h4>' + calEvent.name + '</h4>')
    .append(time)
    .append(about);
};

CsvEventCalendar.MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']; 
CsvEventCalendar.DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

CsvEventCalendar.timeFormat = function(time, ampm) {
  if (time.trim().length === 0) return ''; 
  var parts = time.split(':');
  for (var i = 0; i < parts.length; i++) {
    parts[i] = parseInt(parts[i]);
    if (('' + parts[i]).length === 1) {
      parts[i] = '0' + parts[i];
    }
  }
  if (time.toUpperCase().indexOf('M') > -1) {
    if (parseInt(parts[0]) === 12) {
      parts[0] = '00';
    }
    if (time.toUpperCase().indexOf('P') > -1) {
      parts[0] = parseInt(parts[0]) + 12;
    }
  }
  if (parts.length < 2) {
    parts.push('00');
  }
  var hh24 = parts.join(':');
  var suffix = ' AM';
  if (!ampm) return hh24;
  if (parseInt(parts[0]) > 12) {
    suffix = ' PM';
    parts[0] = parts[0] - 12;
  } else if (parseInt(parts[0]) === 12) {
    suffix = ' PM';
  }
  return parts.join(':') + suffix;
};
