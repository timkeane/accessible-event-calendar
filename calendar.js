/*
 *  Thanks to Amit Gupta for the calendar grid algorithm!
 *  https://dev.to/amitgupta15/create-a-responsive-calendar-with-vanilla-javascript-and-css-grid-35ih
 */

function CsvEventCalendar(options) {
  var me = this;

  this.eventsIndex = {};
  this.container = $(options.container).addClass('calendar');
  this.selectionChanged = options.selectionChanged || function() {};
  this.dayViewContainer = $(options.detail).addClass('day-view');
  this.today = new Date();

  this.state = {
    year: this.today.getFullYear(),
    month: this.today.getMonth(),
    date: this.today.getDate(),
    day: this.today.getDay(),
    view: 'month',
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
    this.state.year = options.year || this.state.year;
    this.state.month = options.month !== undefined ? options.month : this.state.month;
    this.state.date = options.date || this.state.date;
    this.state.view = options.view || this.state.view;
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
  };

  this.weekNavigate = function(delta) {
    var key = this.state.key();
    var date = this.dateFromKey(key);
    date.setDate(date.getDate() + (delta * 7));
    var newKey = this.dateKey(date);
    var dayNode = this.dayNode(newKey);
    this.updateState({key: newKey});
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
    var m = month.substr(0, 3);
    var date = this.dateNumber(key);
    var day = this.dayName(key);
    var d = day.substr(0, 3);
    var title = {
      month: {
        long: month + ' ' + year,
        short: m + ' ' + year
      },
      day: day + ' ' + month + ' ' + date + ', ' + year
    }
    $(options.node).find('.day').html(title.day);
    $(options.node).find('.month .long').html(title.month.long);
    $(options.node).find('.month .short').html(title.month.short);
    return title;
  };

  this.buildHeader = function() {
    var back = $('<button class="back" aria-label="previous month"><span>Previous</span></button>')
      .data('delta', -1)
      .on('click', this.navigate.bind(this));
    var fwd = $('<button class="fwd" aria-label="next month"><span>Next</span></button>')
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
      )
      .append('<span class="day"></span>');
    var div1 = $('<div></div>')
      .append(back)
      .append(h1)
      .append(fwd);
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
    var month = $('<table class="month-view"><thead><tr></tr></thead><tbody></tbody></table>');
    this.container.append(month);
    $.each(CsvEventCalendar.DAY_NAMES, function(d, dayName) {
      var th = $('<th></th>')
        .append('<span class="long">' + dayName + '</span>')
        .append('<span class="medium">' + dayName.substr(0, 3) + '</span>')
        .append('<span class="short">' + dayName.substr(0, 1) + '</span>')
      month.find('thead tr').append(th);
    });
    return month.find('tbody');
  };

  this.addWeek = function(month) {
    var week = $('<tr class="week"></tr>');
    month.append(week);
    return week;
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

  this.dayView = function() {
    var key = this.state.key();
    var dayNode = this.dayNode(key);
    if (!dayNode.length) {
      this.monthView();
      return this.dayView();
    }
    var close = $('<button class="close" aria-label="return to month view"></button>')
      .on('click', function() {
        me.view('month');
      });
    var events = dayNode.find('.content');
    this.dayViewContainer.empty()
      .append(events.html())
      .append(!events.find('.event').length && '<div class="no-events">no events scheduled</div>')
      .children().first().append(close);
  };

  this.weekView = function() {
    var key = this.state.key();
    var dayNode = this.dayNode(key);
    if (!dayNode.length) {
      this.monthView();
      return this.weekView();
    }
    var tr = dayNode.parent();
    var weekView = this.container.find('.week-view');
    this.container.find('.week-view').empty();
    tr.children().each(function(i, td) {
      var dayNode = $('<div></div>')
        .html($(td).html())
        .append(!$(td).hasClass('has-events') && '<div class="no-events">no events scheduled</div>')
        .addClass(td.className)
        .removeClass('selected');
      weekView.append(dayNode);
    });
  };

  this.view = function(view) {
    this.updateState({view: view});
    this[view + 'View']();
    this.title({node: this.container.find('.controls h1')});
    this.container.find('.month-view, .week-view, .day-view').removeClass('active').addClass('inactive');
    this.container.find('.' + view + '-view').removeClass('inactive').addClass('active');
    this.container.find('.controls .fwd').attr({
      'aria-label': 'next ' + view,
      title: 'next ' + view
    });
    this.container.find('.controls .back').attr({
      'aria-label': 'previous ' + view,
      title: 'previous ' + view
    });
    var h1 = this.container.find('.controls h1');
    if (view === 'month') {
      h1.css('visible', 'visible');
    } else {
      h1.css('visible', 'hidden');
    }
  };

  this.addDay = function(date, week) {
    var key = date.key;
    var title = this.title({key: key}).day;
    var h2 = $('<h2></h2>')
      .attr('aria-label', title)
      .append('<span class="long">' + title + '</span>')
      .append('<span class="short" aria-hidden="true">' + this.dateNumber(key) + '</span>');
    var day = $('<td class="day"></td>')
      .addClass(date.monthClass + '-mo')
      .attr('data-date-key', date.key)
      .append($($('<div class="content"></div>').append(h2)))
      .on('click', function() {
        me.updateState({key: key});
        me.view('day');
      });
    week.append(day);
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
    var week = this.addWeek(month);
    var endOfWeek1 = dates[6].key;
    var startOfWeek6 = dates[35].key;
    $.each(dates, function(i, date) {
      me.addDay(date, week);
      if ((i + 1) % 7 === 0) {
        if (i === 34 && !me.sameMonth(endOfWeek1, startOfWeek6)) {
          return false;
        }
        week = me.addWeek(month);
      }
    });
  };

  this.monthView = function() {
    var dates = [];
    var detail = this.container.find('.detail');
    if (detail.length) {
      detail.remove();
      this.dayViewContainer = [];
    }
    this.container.find('.month-view, .week-view').remove();
    this.previousMonth(dates);
    this.currentMonth(dates);
    this.nextMonth(dates);
    this.drawCalendar(dates);
    if (!this.dayViewContainer.length) {
      this.dayViewContainer = $('<div class="day-view"></div>');
      this.container.append(this.dayViewContainer);
    }
    this.container.append('<div class="week-view"></div>');
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
    var dayNodes = this.container.find('.month-view td.day');
    dayNodes.each(function(i, dayNode) {
      var key = $(dayNode).attr('data-date-key');
      var content = $(dayNode).find('.content');
      var events = me.eventsIndex[key];
      if (events) {
        calendarEvents[key] = events;
        $(dayNode).addClass('has-events');
        $.each(events, function(e, calEvent) {
          content.append(me.eventHtml(calEvent))
            .data('calendar-event', calEvent);
        });
      } else {
        var h2 = $(dayNode).find('h2');
        var title = me.title({key: key}).day;
        h2.attr('aria-label', title + ' (no events scheduled)');
      }
    });
    var dayNode = this.dayNode(this.state.key());
    this.container.find('.month-view .day').removeClass('selected');
    dayNode.addClass('selected');
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
    this.populateCalendar()
  };

  this.buildHeader();
  this.view('month');

  Papa.parse(options.url, {
    download: true,
    header: true,
    complete: function(response) {
      me.indexCalendarData(response);
    }
  });

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
  if (time.toUpperCase().indexOf('M') > -1) {
    if (parseInt(parts[0]) === 12) {
      parts[0] = '00';
    }
    if (time.toUpperCase().indexOf('P') > -1) {
      parts[0] = parseInt(parts[0]) + 12;
    }
  }
  if (parts[0].length === 1) {
    parts[0] = '0' + parts[0];
  }
  if (parts.length < 2) {
    parts.push('00');
  } else {
    parts[1] = parseInt(parts[1]);    
    if (parts[1].length === 1) {
      parts[1] = '0' + parts[1];
    }
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
