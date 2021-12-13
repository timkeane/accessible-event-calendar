/*
 *  Thanks to Amit Gupta for the calendar grid algorithm!
 *  https://dev.to/amitgupta15/create-a-responsive-calendar-with-vanilla-javascript-and-css-grid-35ih
 */

function CsvEventCalendar(options) {
  var me = this;

  this.eventsByDay = {};
  this.container = $(options.container).addClass('calendar');
  this.selectionChanged = options.selectionChanged || function() {};
  this.detail = $(options.detail).addClass('calendar-detail');
  this.today = new Date();

  this.state = {
    year: this.today.getFullYear(),
    month: this.today.getMonth(),
    day: this.today.getDate(),
    key: function() {
      var m = this.month + 1;
      var d = this.day;
      if (m < 10) m = '0' + m;
      if (d < 10) d = '0' + d;
      return this.year + '-' + m + '-' + d;
    }
  };

  this.monthChanged = function(change) {
    var month = CsvEventCalendar.MONTH_NAMES[this.state.month];
    this.select(this.state.key());
    this.container.find('.controls h2 .long').html(month + ' ' + this.state.year);
    this.container.find('.controls h2 .short').html(month.substr(0, 3) + ' ' + this.state.year);
    options.monthChanged && options.monthChanged(change);
  };

  this.dayNode = function(key) {
    return this.container.find('[data-date-key="' + key + '"].day ')
  };

  this.select = function(key) {
    var dayNode = this.dayNode(key);
    this.container.find('.day').removeClass('selected');
    dayNode.addClass('selected');
    this.container.find('input').val(key);
    this.selectionChanged({
      date: key,
      events: this.eventsByDay[key] || []
    });
  };

  this.dateKey = function(date) {
    var parts =  date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).split('/');
    return parts[2] + '-' + parts[0] + '-' + parts[1];
  };

  this.changeMonth = function(domEvent) {
    var delta =  $(domEvent.currentTarget).data('mo-delta');
    var month = this.state.month;
    if (month === 11 && delta === 1) {
      this.state.month = 0;
      this.state.year = this.state.year + 1;
    } else if (month === 0 && delta === -1) {
      this.state.month = 11;
      this.state.year = this.state.year - 1;
    } else {
      this.state.month = this.state.month + delta;
    }
    this.buildCalendar();
    this.monthChanged({
      year: this.state.year,
      month: CsvEventCalendar.MONTH_NAMES[this.state.month],
      events: this.populateCalendar()
    });
  };

  this.buildHeader = function() {
    var back = $('<button class="back-mo" aria-label="previous month"><span>Previous</span></button>')
      .data('mo-delta', -1)
      .on('click', this.changeMonth.bind(this));
    var fwd = $('<button class="fwd-mo" aria-label="next month"><span>Next</span></button>')
      .data('mo-delta', 1)
      .on('click', this.changeMonth.bind(this));
    var input = $('<input type="date">').val(this.state.key);
    var month = CsvEventCalendar.MONTH_NAMES[this.state.month];
    var moLong = $('<span class="long">' + month + '</span>');
    var moShort = $('<span class="short">' + month.substr(0, 3) + '</span>');
    var controls = $('<div class="controls"></div>')
      .append($('<h2></h2>').append([moLong, moShort]))
      .append(input)
      .append(back)
      .append(fwd);
    this.container.append(controls);
    input.on('change', function(domEvent) {
      me.showDetail($(domEvent.currentTarget).val());
    });
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
    var month = $('<table class="month"><thead><tr></tr></thead><tbody></tbody></table>');
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

  this. dateNumber = function(key) {
    return key.split('-')[2] * 1;
  };

  this.returnToCalendar = function() {
    this.detail.removeClass('active').addClass('inactive');
    this.container.find('.month, .controls').removeClass('inactive').addClass('active');
  };

  this.wordyDate = function(key, dayName) {
    var date = key.split('-');
    var dayName = dayName || this.dayNode(key).attr('data-name');
    var month = date[1] - 1;
    var dayNum = date[2] - 0;
    var year = date[0];
    return dayName + ' ' + 
      CsvEventCalendar.MONTH_NAMES[month] + ' ' + 
      dayNum + ', ' + year;
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

  this.showDetail = function(key) {
    if (this.stateChange(key)) {
      this.buildCalendar();
      this.monthChanged({
        year: this.state.year,
        month: CsvEventCalendar.MONTH_NAMES[this.state.month],
        events: this.populateCalendar()
      });
    }
    var dayNode = this.dayNode(key);
    var close = $('<button class="close" aria-label="return to calendar"></button>')
      .on('click', this.returnToCalendar.bind(this));
    var events = dayNode.find('.content');
    this.detail.empty()
      .append(close)
      .append(events.html())
      .append(!events.find('.event').length && 'No events on this day');
    this.state.day = this.dateNumber(key);
    this.select(key);
    this.container.find('.month, .controls').removeClass('active').addClass('inactive');
    this.detail.removeClass('inactive').addClass('active');
  };

  this.addDay = function(name, date, week) {
    var key = date.key;
    var h3 = $('<h3></h3>')
      .attr('aria-label', this.wordyDate(key, name))
      .append('<span class="long">' + this.wordyDate(key, name) + '</span>')
      .append('<span class="short" aria-hidden="true">' + this.dateNumber(key) + '</span>');
    var day = $('<td class="day"></td>')
      .addClass(date.monthClass + '-mo')
      .attr('data-date-key', date.key)
      .attr('data-name', name)
      .append($($('<div class="content"></div>').append(h3)))
      .on('click', function() {
        me.showDetail(key);
      });
    week.append(day);
  };

  this.monthNumber = function(key) {
    return key.split('-')[1] * 1;
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
    var dayIdx = 0;
    $.each(dates, function(i, date) {
      me.addDay(CsvEventCalendar.DAY_NAMES[dayIdx], date, week);
      dayIdx++;
      if ((i + 1) % 7 === 0) {
        dayIdx = 0;
        if (i === 34 && !me.sameMonth(endOfWeek1, startOfWeek6)) {
          return false;
        }
        week = me.addWeek(month);
      }
    });
    this.select(this.dateKey(this.today));
  };

  this.buildCalendar = function() {
    var dates = [];
    var detail = this.container.find('.detail');
    if (detail.length) {
      detail.remove();
      this.detail = [];
    }
    this.container.find('.month').remove();
    this.previousMonth(dates);
    this.currentMonth(dates);
    this.nextMonth(dates);
    this.drawCalendar(dates);
    if (!this.detail.length) {
      this.detail = $('<div class="calendar-detail"></div>');
      this.container.append(this.detail);
    }
    this.detail.addClass('inactive');
  }; 

  this.sortByTime = function(events) {
    var fmt = CsvEventCalendar.timeFormat
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

  this.populateCalendar = function() {
    var calendarEvents = {};
    $('.day').each(function(i, dayNode) {
      var key = $(dayNode).attr('data-date-key');
      var content = $(dayNode).find('.content');
      var events = me.eventsByDay[key];
      if (events.length) {
        calendarEvents[key] = events;
        $(dayNode).addClass('has-events');
        $.each(events, function(e, calEvent) {
          content.append(me.eventHtml(calEvent))
            .data('calendar-event', calEvent);
        });
      } else {
        var h3 = $(dayNode).find(h3);
        var label = h3.attr('aria-label');
        h3.attr('aria-label', label + ' has no events scheduled');
      }
    });
    return calendarEvents;
  };

  this.indexCalendarData = function(response) {
    $.each(response.data, function(i, calEvent) {
      var key = calEvent.date;
      me.eventsByDay[key] = me.eventsByDay[key] || [];
      me.eventsByDay[key].push(calEvent);
      me.sortByTime(me.eventsByDay[key]);
    });
    this.monthChanged({
      year: this.state.year,
      month: CsvEventCalendar.MONTH_NAMES[this.state.month],
      events: this.populateCalendar()
    });
  };

  this.buildHeader();
  this.buildCalendar(this.dateKey(this.today));

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
    .append('<h4>' + calEvent.name + '</h4>')
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
