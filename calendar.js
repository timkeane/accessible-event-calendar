/*
 *  Thanks to Amit Gupta for the calendar grid algorithm!
 *  https://dev.to/amitgupta15/create-a-responsive-calendar-with-vanilla-javascript-and-css-grid-35ih
 */

function CsvEventCalendar(options) {
  var me = this;

  this.eventsIndex = {ready: false};
  this.container = $(options.container)
    .addClass('calendar');
  this.selectionChanged = options.selectionChanged || function() {};
  this.today = new Date();
  this.state = {
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

  this.dayNode = function(key) {
    return this.container.find('[data-date-key="' + key + '"]')
  };

  this.dateKey = function(date) {
    var parts =  date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).split('/');
    return parts[2] + '-' + parts[0] + '-' + parts[1];
  };

  this.updateState = function(options) {
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

  this.monthNavigate = function(delta) {
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

  this.dayNavigate = function(delta) {
    var key = this.state.key();
    var date = this.dateFromKey(key);
    date.setDate(date.getDate() + delta);
    this.updateState({key: this.dateKey(date)});
    var dayNode = this.dayNode(this.state.key())
    if (!dayNode.length) {
      this.monthView();
    }
    this.container.find('li.day').removeClass('selected');
    dayNode.addClass('selected');
  };

  this.weekNavigate = function(delta) {
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

  this.navigate = function(domEvent) {
    var delta =  $(domEvent.currentTarget).data('delta');
    var view = this.state.view;
    this[view + 'Navigate'](delta);
    this.view(view);
  };

  this.title = function(options) {
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

  this.buildHeader = function() {
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
      .on('change', function() {
        me.view(select.val());
      });
    var h1 = $('<h1></h1>')
      .append(
        $('<span class="month"></span>')
          .append('<span class="long"></span>')
          .append('<span class="short"></span>')
          .append('<span class="abbr"></span>')
      )
      .append('<span class="day"></span>');
    var div1 = $('<div></div>')
      .append(back)
      .append(h1)
      .append(next);
    var div2 = $('<div></div>')
      .append(input)
      .append(select);
    var controls = $('<div class="controls"></div>')
      .append(div1)
      .append(div2);
    this.container.append(controls);
  };

  this.previousMonth = function(dates) {
    var firstDay = new Date(this.state.year, this.state.month).getDay();
    var totalDaysInPrevMonth = new Date(this.state.year, this.state.month, 0).getDate();
    for (var i = 1; i <= firstDay; i++) {
      var prevMonthDate = totalDaysInPrevMonth - firstDay + i;
      var key = this.dateKey(new Date(this.state.year, this.state.month - 1, prevMonthDate));    
      dates.push({key: key, date: prevMonthDate, monthClass: 'prev'});
    }
  };

  this.currentMonth = function(dates) {
    var totalDaysInMonth = new Date(this.state.year, this.state.month + 1, 0).getDate();
    for (var i = 1; i <= totalDaysInMonth; i++) {
      var key = this.dateKey(new Date(this.state.year, this.state.month, i));
      dates.push({key: key, date: i, monthClass: 'current'});
    }  
  };

  this.nextMonth = function(dates) {
    var gridsize = 42;
    if(dates.length < gridsize) {
      var count = gridsize - dates.length;
      for(var i = 1; i <= count; i++) {
        var key = this.dateKey(new Date(this.state.year, this.state.month + 1, i));
        dates.push({key: key, date: i, monthClass: 'next'});
      }
    }
  };

  this.buildMonth = function() {
    var viewContainer = this.container.find('.view, .view-wo-events');
    var days = $('<ul class="day-names" aria-hidden="true"></ul>');
    var dates = $('<ol class="dates"></ol>');
    if (!viewContainer.length) viewContainer = $('<div class="view month"></div>');
    this.container.append(viewContainer.empty().append(days).append(dates));
    $.each(CsvEventCalendar.DAY_NAMES, function(d, dayName) {
      var li = $('<li></li>')
        .append('<span class="long">' + dayName + '</span>')
        .append('<span class="medium">' + dayName.substr(0, 3) + '</span>')
        .append('<span class="short">' + dayName.substr(0, 1) + '</span>')
        days.append(li);
    });
    return dates;
  };

  this.stateChange = function(key) {
    var month = this.state.month + 1;
    if (month < 10) month = '0' + month;
    var state = this.state.key();
    if (!this.sameMonth(state, key) ||
      !this.sameYear(state, key)) {
        this.state.year = this.yearNumber(key);
        this.state.month = this.monthNumber(key) - 1;
        return true;
      }
  };

  this.week = function() {
    var key = this.state.key();
    var dayNode = this.dayNode(key);
    this.container.find('li.day')
      .removeClass('start-of-week')
      .removeClass('selected-week');
    $('.week-' + dayNode.data('week'))
      .addClass('selected-week')
      .first()
      .addClass('start-of-week');
  };

  this.dayView = function() {
    var key = this.state.key();
    var dayNode = this.dayNode(key);
    var eventCount = this.eventsIndex[key] && this.eventsIndex[key].length || 0;
    var button = dayNode.find('h2 button.name');
    this.container.find('li.day').removeClass('selected');
    var title = this.title({key: key}).day.long;
    dayNode.addClass('selected');
    button.attr('aria-live', 'assertive')
      .attr('data-old-label', button.attr('aria-label'))
      .attr('aria-label', 'showing ' + eventCount + 
        (eventCount === 1 ? ' event' : ' events') + 
        ' for ' + title)
      .focus();
  };

  this.weekView = function() {
    this.container.find('.day.selected-week button.name')
      .get(0).focus();
  };

  this.view = function(view) {
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
    this.title({node: this.container.find('.controls h1')});
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
    this.container.find('.controls select').blur();
  };

  this.tabindex = function() {return;
    var container = this.container;
    var i = 0;
    container.find('.controls').attr('tabindex', 0);
    container.find('button.back').attr('tabindex', 1);
    container.find('button.next').attr('tabindex', 2);
    container.find('.controls input').attr('tabindex', 3);
    container.find('.controls select').attr('tabindex', 4);
    container.find('li.day').each(function(_, li) {
      $(li).find('button.name').attr('tabindex', i + 5);
      i = i + 1;
      $(li).find('button.close').attr('tabindex', i + 5);
      i = i + 1;
    });
  };

  this.addDay = function(date, week, month) {
    var key = date.key;
    var title = this.title({key: key}).day;
    var close = $('<button class="close"></button>')
      .on('click', function(domEvent) {
        domEvent.stopImmediatePropagation();
        me.view(me.state.returnToView);
      });
    var h2 = $('<h2></h2>');
    var button = $('<button class="name"></button>');
    h2.append(button);
    button.append('<span class="long">' + title.long + '</span>')
      .append('<span class="medium">' + title.medium + '</span>')
      .append('<span class="abbr">' + title.abbr + '</span>')
      .append('<span class="short">' + title.short + '</span>');
    var day = $('<li class="day"></li>')
      .data('week', week)
      .addClass(date.monthClass + '-mo')
      .addClass( 'week-' + week)
      .attr('data-date-key', date.key)
      .append(h2)
      .append(close)
      .on('click', function() {
        me.updateState({key: key});
        me.view('day');
      });
      month.append(day);
      return day;
  };

  this.dateNumber = function(key) {
    return key.split('-')[2] * 1;
  };

  this.dateFromKey = function(key) {
    return new Date(key + 'T00:00');
  };

  this.dayNumber = function(key) {
    var date = this.dateFromKey(key);
    return date.getDay();
  };

  this.dayName = function(key) {
    var day = this.dayNumber(key);
    return CsvEventCalendar.DAY_NAMES[day];
  };

  this.monthNumber = function(key) {
    return key.split('-')[1] * 1;
  };

  this.monthName = function(key) {
    var month = this.monthNumber(key);
    return CsvEventCalendar.MONTH_NAMES[month - 1];
  };

  this.yearNumber = function(key) {
    return key.split('-')[0] * 1;
  };

  this.sameMonth = function(key1, key2) {
    return this.monthNumber(key1) === this.monthNumber(key2);
  };

  this.sameYear = function(key1, key2) {
    return this.yearNumber(key1) === this.yearNumber(key2);
  };

  this.drawCalendar = function(dates) {
    var month = this.buildMonth();
    var endOfWeek1 = dates[6].key;
    var startOfWeek6 = dates[35].key;
    var weekOfMonth = 0;
    $.each(dates, function(i, date) {
      me.addDay(date, weekOfMonth, month);
      if ((i + 1) % 7 === 0) {
        weekOfMonth = weekOfMonth + 1;
        if (i === 34 && !me.sameMonth(endOfWeek1, startOfWeek6)) {
          return false;
        }
      }
    });
  };

  this.monthView = function() {
    var dates = [];
    this.previousMonth(dates);
    this.currentMonth(dates);
    this.nextMonth(dates);
    this.drawCalendar(dates);
    this.populateCalendar();
  };

  this.sortByStartTime = function(events) {
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

  this.sortByDate = function(events) {
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

  this.populateCalendar = function() {
    var calendarEvents = {};
    var dayNodes = this.container.find('.view li.day');
    dayNodes.each(function(i, dayNode) {
      var key = $(dayNode).attr('data-date-key');
      var title = me.title({key: key}).day.long;
      var events = me.eventsIndex[key];
      var eventsNode = $('<div class="events"></div>');
      var button = $(dayNode).find('h2 button');
      $(dayNode).append(eventsNode);
      if (me.eventsIndex.ready) {
        if (events) {
          calendarEvents[key] = events;
          $(dayNode).addClass('has-events');
          $.each(events, function(e, calEvent) {
            eventsNode.append(me.eventHtml(calEvent));
          });
          button.attr('aria-label', title + ' (tap or press enter for a detailed view of events on this day)')
        } else {
          button.attr('aria-label', title + ' (no events scheduled)');
          eventsNode.html('<div class="no-events">no events scheduled</div>');
        }
      }
    });
    var dayNode = this.dayNode(this.state.key());
    this.container.find('.view.month .day').removeClass('selected');
    dayNode.addClass('selected');
    this.week();
    this.tabindex();
    return calendarEvents;
  };

  this.indexCalendarData = function(response) {
    var calEvents = response.data;
    this.sortByDate(calEvents);
    $.each(calEvents, function(i, calEvent) {
      var key = calEvent.date;
      me.eventsIndex[key] = me.eventsIndex[key] || [];
      me.eventsIndex[key].push(calEvent);
      me.sortByStartTime(me.eventsIndex[key]);
    });
    me.eventsIndex.ready = true;
    this.populateCalendar()
  };

  this.buildHeader();
  this.view('month');

  if (options.url) {
    Papa.parse(options.url, {
      download: true,
      header: true,
      complete: function(response) {
        me.indexCalendarData(response);
      }
    });
  } else {
    this.container.find('.view').get(0).className = 'view-wo-events';
    this.container.find('.controls').addClass('controls-wo-views');
  }

  return this;
};

CsvEventCalendar.prototype.eventHtml = function(calEvent) {
  var fmt = CsvEventCalendar.timeFormat;
  var time = $('<div class="time"></div>')
    .append('<strong>Start:</strong>')
    .append('<span>' + fmt(calEvent.start, true) + '</span>');
  var about = $('<div class="about"></div>')
    .append(calEvent.detail);
  if (calEvent.end) {
    time.append('<strong>End:</strong>')
      .append('<span>' + fmt(calEvent.end, true) + '</span>');
  }
  return $('<div class="event"></div>')
    .append('<h3>' + calEvent.name + '</h3>')
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
