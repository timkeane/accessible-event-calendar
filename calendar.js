/*
 *  Thanks to Amit Gupta for the calendar grid algorithm!
 *  https://dev.to/amitgupta15/create-a-responsive-calendar-with-vanilla-javascript-and-css-grid-35ih
 */

function CsvEventCalendar(options) {
  var me = this;
  this.firstView = true;
  this.eventsIndex = {ready: false, noData: false};
  this.container = $('<div class="calendar"></div>')
  this.min = options.min;
  this.max = options.max;
  this.eventHtml = options.eventHtml || this.eventHtml;
  this.selectionChanged = options.selectionChanged || function() {};
  this.today = new Date();
  $(options.target).append(this.container);

  this.state = {
    today: CsvEventCalendar.dateKey(this.today),
    year: this.today.getFullYear(),
    month: this.today.getMonth(),
    date: this.today.getDate(),
    day: this.today.getDay(),
    view: 'month',
    previousView: 'month',
    key: function() {
      var m = this.month + 1;
      var d = this.date;
      if (m < 10) m = '0' + m;
      if (d < 10) d = '0' + d;
      return this.year + '-' + m + '-' + d;
    }
  };

  this.container.attr('id', CsvEventCalendar.nextId('calendar'));
  this.controls();

  if (options.url) {
    Papa.parse(options.url, {
      download: true,
      header: true,
      complete: function(response) {
        me.indexData(response);
      }
    });
  } else {
    this.eventsIndex.noData = true;
    this.view('month');
    this.container.find('.view').get(0).className = 'view-wo-events';
    this.container.find('.controls').addClass('controls-wo-views');
  }

  $(document).on('keyup', function(domEvent) {
    if (domEvent.key === 'Escape') {
      window.location.hash = me.state.previousView + '/' + me.state.key();
    }
  });

  $(window).on('resize', this.resize.bind(this));

  $(window).on('hashchange', this.hashChanged.bind(this));

  this.resize();

  return this;
};

CsvEventCalendar.prototype.hashChanged = function() {
  var values = window.location.hash.substr(1).split('/');
  if (values[0] === this.container.attr('id') && values.length === 3) {
    this.updateState({
      view: values[1],
      key: values[2]
    });
    this.view(values[1]);
  } else if (this.firstView) {
    this.view('month');
  }
  this.firstView = false;
};

CsvEventCalendar.prototype.updateState = function(options) {
  var before = JSON.stringify(this.state);
  if (options.view === 'week') {
    this.state.previousView = 'month';
  } else if (this.state.view !== 'day') {
    this.state.previousView = this.state.view;
  }
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
  if (options.key) {
    this.state.year = CsvEventCalendar.yearNumber(options.key);
    this.state.month = CsvEventCalendar.monthNumber(options.key) - 1;
    this.state.date = CsvEventCalendar.dateNumber(options.key);
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
  var view = this.state.view;
  this.container.find('.controls input[type="date"]').val(key);
  this.container.find('.controls fieldset input')
    .attr('aria-checked', false)
    .prop('checked', false);
  this.container.find('.controls fieldset button')
    .attr('aria-label', 'showing ' + view + ' view');
  this.container.find('.controls fieldset input[value="' + view + '"]')
    .attr('aria-checked', true)
    .prop('checked', true);
  this.container.find('.controls fieldset button.btn').html('View by ' + view);
  if (after !== before) {
    this.week();
    this.selectionChanged({
      date: key,
      events: this.eventsIndex[key] || []
    });
  }
};

CsvEventCalendar.prototype.dayNode = function(key) {
  return this.container.find('[data-date-key="' + key + '"]')
};

CsvEventCalendar.prototype.title = function(options) {
  var key = options.key || this.state.key();
  var year = CsvEventCalendar.yearNumber(key);
  var month = CsvEventCalendar.monthName(key);
  var mo = month.substr(0, 3);
  var m = CsvEventCalendar.monthNumber(key);
  var date = CsvEventCalendar.dateNumber(key);
  var day = CsvEventCalendar.dayName(key);
  var d = day.substr(0, 3);
  var title = {
    month: {
      long: month + ' ' + year,
      medium: mo + ' ' + year,
      abbr: m + '/' + year
    },
    day: {
      long: day + ' ' + month + ' ' + date + ', ' + year,
      medium: d + ' ' + mo + ' ' + date + ', ' + year,
      short: date,
      abbr: d + ' ' + m + '/' + date + '/' + year
    }
  }
  $(options.node).find('.month .long').html(title.month.long);
  $(options.node).find('.month .short').html(title.month.medium);
  $(options.node).find('.month .abbr').html(title.month.abbr);
  $(options.node).attr('aria-label', title.month.long);
  return title;
};

CsvEventCalendar.prototype.previousMonth = function(dates) {
  var firstDay = new Date(this.state.year, this.state.month).getDay();
  var totalDaysInPrevMonth = new Date(this.state.year, this.state.month, 0).getDate();
  for (var i = 1; i <= firstDay; i++) {
    var prevMonthDate = totalDaysInPrevMonth - firstDay + i;
    var key = CsvEventCalendar.dateKey(new Date(this.state.year, this.state.month - 1, prevMonthDate));    
    dates.push({key: key, date: prevMonthDate, monthClass: 'prev'});
  }
};

CsvEventCalendar.prototype.currentMonth = function(dates) {
  var totalDaysInMonth = new Date(this.state.year, this.state.month + 1, 0).getDate();
  for (var i = 1; i <= totalDaysInMonth; i++) {
    var key = CsvEventCalendar.dateKey(new Date(this.state.year, this.state.month, i));
    dates.push({key: key, date: i, monthClass: 'current'});
  }  
};

CsvEventCalendar.prototype.nextMonth = function(dates) {
  var gridsize = 42;
  if(dates.length < gridsize) {
    var count = gridsize - dates.length;
    for(var i = 1; i <= count; i++) {
      var key = CsvEventCalendar.dateKey(new Date(this.state.year, this.state.month + 1, i));
      dates.push({key: key, date: i, monthClass: 'next'});
    }
  }
};

CsvEventCalendar.prototype.navigate = function(domEvent) {
  var delta =  $(domEvent.currentTarget).data('delta');
  var view = this.state.view;
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
  this.updateState({month: month, year: year});
  window.location.hash = '#' + this.container.attr('id') + '/month/' + this.state.key();
};

CsvEventCalendar.prototype.weekNavigate = function(delta) {
  var key = this.state.key();
  var date = CsvEventCalendar.dateFromKey(key);
  date.setDate(date.getDate() + (delta * 7));
  this.updateState({key: CsvEventCalendar.dateKey(date)});
  var dayNode = this.dayNode(this.state.key())
  if (!dayNode.length) {
    this.monthView();
  }
  this.container.find('li.day').removeClass('selected');
  dayNode.addClass('selected');
  this.week();
  window.location.hash = '#' + this.container.attr('id') + '/week/' + this.state.key();
};

CsvEventCalendar.prototype.dayNavigate = function(delta) {
  var key = this.state.key();
  var date = CsvEventCalendar.dateFromKey(key);
  date.setDate(date.getDate() + delta);

  var nextKey = CsvEventCalendar.dateKey(date);
  this.updateState({key: nextKey});

  var dayNode = this.dayNode(this.state.key());
  if (!dayNode.length) {
    this.monthView();
  }
  if (!dayNode.hasClass('has-events')) {
    this.dayNavigate(delta);
    return;
  }
  this.container.find('li.day').removeClass('selected');
  dayNode.addClass('selected');
  window.location.hash = '#' + this.container.attr('id') + '/day/' + this.state.key();
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
      var key = input.val();
      if (me.eventsIndex[key]) {
        window.location.hash = '#' + me.container.attr('id') + '/day/' + key; 
      } else {
        me.alert(key);
      }
    });
  var views = ['Month', 'Week', 'Day'];
  var fieldset = $('<fieldset></fieldset>')
    .append('<button class="btn" aria-label="showing month view - click to choose a view" aria-expanded="false">View by month</button>');
  for (var i = 0; i < views.length; i++) {
    var id = CsvEventCalendar.nextId('view');
    var view = views[i].toLocaleLowerCase();
    var radio = $('<input name="view-choice" type="radio">')
      .attr({
        id: id,
        value: view,
        'aria-checked': i === 0,
        'aria-label': 'View by ' + view
      }).prop('checked', i === 0);
    var label = $('<label aria-hidden="true"></label>')
      .html(views[i])
      .attr({
        for: id,
        'aria-label': 'View by ' + view
      });
    fieldset.append($('<div class="view-choice"></div>').append(radio).append(label));
  }
  var activeateBtn = fieldset.find('button.btn');
  activeateBtn.on('click keyup', function(domEvent) {
    if (domEvent.type === 'click' || domEvent.key === 'ArrowDown') {
      var open = activeateBtn.attr('aria-expanded') === true;
      activeateBtn.attr('aria-expanded', !open);
      fieldset[!open ? 'addClass' : 'removeClass']('expanded');
      setTimeout(function() {
        fieldset.find('input[aria-checked="true"]').focus();
      }, 200);
    }
  });
  fieldset.find('input').on('click keyup', function(domEvent) {
    if ((domEvent.type === 'click' && domEvent.clientX > 0) || (domEvent.key === ' ' || domEvent.key === 'Enter')) {
      fieldset.removeClass('expanded');
      activeateBtn.attr('aria-expanded', false);
      activeateBtn.focus();
      window.location.hash = '#' + me.container.attr('id') + '/' + $(domEvent.target).val() + '/' + me.state.key();
    }
  });
  $(this.container).on('click', function(domEvent) {
    var next = domEvent.target;
    if (next && !$.contains(fieldset.get(0), next)) {
      fieldset.attr('aria-expanded', false);
    }
  });
  fieldset.find('button, input').on('blur', function(domEvent) {
    var next = domEvent.relatedTarget;
    if (next && !$.contains(fieldset.get(0), next)) {
      fieldset.attr('aria-expanded', false);
    }
  });
  var h2 = $('<h2 aria-live="assertive"></h2>')
    .append(
      $('<span class="month"></span>')
        .append('<span class="long"></span>')
        .append('<span class="short"></span>')
        .append('<span class="abbr"></span>')
    );
  var controls = $('<div class="controls"></div>')
    .append(back)
    .append(h2)
    .append(next)
    .append(input)
    .append(fieldset);
  this.container.append(controls);
  var alert = $('<div class="alert" aria-live="assertive"><div><p></p><button class="btn ok">OK</button></div></div></div>');
  alert.find('.ok').on('click', function() {
    alert.hide();
    controls.removeAttr('aria-hidden');
    me.container.find('.view').removeAttr('aria-hidden');
  });
  this.container.append(alert);
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
      if (i === 34 && !CsvEventCalendar.sameMonth(endOfWeek1, startOfWeek6)) {
        return false;
      }
    }
  });
};

CsvEventCalendar.prototype.month = function() {
  var viewContainer = this.container.find('.view, .view-wo-events');
  var days = $('<ul class="day-names" aria-hidden="true"></ul>');
  var dates = $('<ol class="dates"></ol>');
  var viewDesc = $('<div class="view-desc"><a tabindex="0"><span class="long"></span><span class="medium"></span><span class="abbr"></span></a></a>');
  if (!viewContainer.length) {
    viewContainer = $('<div class="view month"></div>');
  }
  this.container.append(viewContainer.empty().append(viewDesc).append(days).append(dates));
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
  var prevView = $('<a class="prev-view"></a>');
  var h3 = $('<h3></h3>');
  var a = $('<a class="name"></a>');
  h3.append(a);
  a.append('<span class="long">' + title.long + '</span>')
    .append('<span class="medium">' + title.medium + '</span>')
    .append('<span class="abbr">' + title.abbr + '</span>')
    .append('<span class="short">' + title.short + '</span>')
    .attr('href', '#' + this.container.attr('id') + '/day/' + key);
  var day = $('<li class="day"></li>')
    .data('week', week)
    .addClass(date.monthClass + '-mo')
    .addClass( 'week-' + week)
    .attr('data-date-key', date.key)
    .append(h3)
    .append(prevView)
    .append('<div class="events"></div>')
    .on('click', function() {
      if ($(this).hasClass('has-events'))
        window.location = $(this).find('a.name').attr('href');
    });
    month.append(day);
    return day;
};

CsvEventCalendar.prototype.view = function(view) {
  if (!view) return;
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
  this.container.find('.view').removeAttr('aria-label');
  this.container.find('.day a.name').removeAttr('aria-live');
  this.container.find('.day a[data-old-label]').each(function(i, btn) {
    $(btn).attr('aria-label', $(btn).attr('data-old-label'))
      .removeAttr('data-old-label');
  });
  this.container.find('.day a.prev-view')
    .attr({
      'aria-label': 'return to ' + this.state.previousView + ' view',
      title: 'return to ' + this.state.previousView + ' view',
      href: '#'  + this.container.attr('id') + '/' + this.state.previousView + '/' + key
    });
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
  this.container.find('.view-desc a .long').html( 
    this.title({key: this.state.key()}).month.long + 
    ' - showing ' + $('.view .event').length + ' scheduled events');
  this.container.find('.view-desc a .medium').html( 
    this.title({key: this.state.key()}).month.medium + 
    ' - showing ' + $('.view .event').length + ' scheduled events');
  this.container.find('.view-desc a .abbr').html( 
    this.title({key: this.state.key()}).month.medium + 
    ' - showing ' + $('.view .event').length + ' events');
};

CsvEventCalendar.prototype.weekView = function() {
  var key = this.container.find('.day.start-of-week').attr('data-date-key');
  this.container.find('.view-desc a .long').html( 
    'Week of ' + this.title({key: key}).day.long + ' - showing ' + this.container.find('.selected-week .event').length + ' events'
  );
  this.container.find('.view-desc a .medium').html( 
    'Week of ' + this.title({key: key}).day.medium + ' - showing ' + this.container.find('.selected-week .event').length + ' events'
  );
  this.container.find('.view-desc a .abbr').html( 
    'Week of ' + this.title({key: key}).day.abbr.substr(4) + ' - ' + this.container.find('.selected-week .event').length + ' events'
  );
};

CsvEventCalendar.prototype.dayView = function() {
  var key = this.state.key();
  var dayNode = this.dayNode(key);
  var eventCount = this.eventsIndex[key] && this.eventsIndex[key].length || 0;
  var a = dayNode.find('h3 a.name');
  this.container.find('li.day').removeClass('selected');
  dayNode.addClass('selected');
  var title = this.title({key: key}).day;
  if (eventCount) {
    this.container.find('.view-desc a .long').html(
      title.long + ' - showing ' + eventCount + ' scheduled ' + (eventCount === 1 ? 'event' : 'events')
    );
    this.container.find('.view-desc a .medium').html(
      title.medium + ' - showing ' + eventCount + ' scheduled ' + (eventCount === 1 ? ' event' : ' events')
    );
    this.container.find('.view-desc a .abbr').html(
      title.abbr + ' - ' + eventCount + (eventCount === 1 ? ' event' : ' events')
    );
  } else {
    this.container.find('.view-desc a .long').html(
      title.long + ' - there no scheduled events to show'
    );
    this.container.find('.view-desc a .medium').html(
      title.medium + ' - no scheduled events'
    );
    this.container.find('.view-desc a .abbr').html(
      title.abbr + ' - no events'
    );
  }
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
    var a = $(dayNode).find('h3 a');
    $(dayNode).append(eventsNode);
    if (me.eventsIndex.ready) {
      if (events) {
        calendarEvents[key] = events;
        $(dayNode).addClass('has-events');
        $.each(events, function(_, calEvent) {
          eventsNode.append(me.eventHtml(calEvent));
        });
        a.attr('href', '#' + me.container.attr('id') + '/day/' + key)
          .attr('aria-label', title + ' (' + eventCount +
          (eventCount === 1 ? ' event' : ' events') + ' scheduled');
      } else {
        $(dayNode).attr('aria-hidden', 'true');
        a.removeAttr('href')
          .attr('aria-label', title + ' (no events scheduled)');
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
  CsvEventCalendar.sortByDate(calEvents);
  if (!this.min) {
    this.min = calEvents[0].date;
    this.container.find('.controls input[type="date"]').attr('min', this.min);
  }
  if (!this.max) {
    this.max = calEvents[calEvents.length - 1].date;
    this.container.find('.controls input[type="date"]').attr('max', this.max);
  }
  $.each(calEvents, function(i, calEvent) {
    var key = calEvent.date;
    me.eventsIndex[key] = me.eventsIndex[key] || [];
    me.eventsIndex[key].push(calEvent);
    CsvEventCalendar.sortByStartTime(me.eventsIndex[key]);
  });
  this.eventsIndex.ready = true;
  this.hashChanged();
};

CsvEventCalendar.prototype.alert = function(minMaxKey) {
  var message;
  if (['min', 'max'].indexOf(minMaxKey) > -1) {
    this.container.find('.controls button.' + (minMaxKey === 'min' ? 'back' : 'next'))
      .attr('disabled', true);
    message = 'No events scheduled ' + (minMaxKey === 'min' ? 'before ' : 'after ') +
      this.title({key: this[minMaxKey]}).day.long;
  } else {
    message = 'No events scheduled on ' + this.title({key: minMaxKey}).day.long;
  }
  this.container.find('.controls').attr('aria-hidden', true);
  this.container.find('.view').attr('aria-hidden', true);
  this.container.find('.alert p').html(message);
  var alert = this.container.find('.alert')
    .attr({'aria-label': message, tabindex: 0})
    .show()
    .focus();
  var ok = alert.find('button.ok')
  var timeout = setTimeout(function() {
    ok.focus();
  }, 6500);
  ok.on('click', function() {
    clearTimeout(timeout);
  });
};

CsvEventCalendar.prototype.focus = function() {
  var me = this;
  if (!this.container.find('.alert').is(':visible')) {
    var scroll = $(document).scrollTop();
    setTimeout(function() {
      me.container.find('.view-desc a').focus();
      me.container.scrollTop(0);
      $(document).scrollTop(scroll);
    }, 200);
  }
};

CsvEventCalendar.prototype.resize = function() {
  var container = this.container;
  var changes = [645, 500, 400, 375, 340, 300, 280];
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

CsvEventCalendar.dateKey = function(date) {
  var parts =  date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).split('/');
  return parts[2] + '-' + parts[0] + '-' + parts[1];
};

CsvEventCalendar.dateFromKey = function(key) {
  return new Date(key + 'T00:00');
};

CsvEventCalendar.dateNumber = function(key) {
  return key.split('-')[2] * 1;
};

CsvEventCalendar.dayNumber = function(key) {
  var date = CsvEventCalendar.dateFromKey(key);
  return date.getDay();
};

CsvEventCalendar.dayName = function(key) {
  var day = CsvEventCalendar.dayNumber(key);
  return CsvEventCalendar.DAY_NAMES[day];
};

CsvEventCalendar.monthNumber = function(key) {
  return key.split('-')[1] * 1;
};

CsvEventCalendar.monthName = function(key) {
  var month = CsvEventCalendar.monthNumber(key);
  return CsvEventCalendar.MONTH_NAMES[month - 1];
};

CsvEventCalendar.sameMonth = function(key1, key2) {
  return CsvEventCalendar.monthNumber(key1) === CsvEventCalendar.monthNumber(key2);
};

CsvEventCalendar.yearNumber = function(key) {
  return key.split('-')[0] * 1;
};

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

CsvEventCalendar.sortByStartTime = function(events) {
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

CsvEventCalendar.sortByDate = function(events) {
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

CsvEventCalendar.nextId = function(prefix) {
  CsvEventCalendar[prefix] = CsvEventCalendar[prefix] || {};
  CsvEventCalendar[prefix].id = CsvEventCalendar[prefix].id || 0;
  CsvEventCalendar[prefix].id = CsvEventCalendar[prefix].id + 1;
  return prefix + CsvEventCalendar[prefix].id;
};
