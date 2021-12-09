var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']; 
var daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var calendarParent;

var state = {
  month: new Date().getMonth(),
  year: new Date().getFullYear()
};

function isoDate(date) {
  return new Date(date.key).toISOString().split('T')[0];
};

function getMonth(date) {
  return isoDate(date).split('-')[1] * 1;
};

function getDate(date) {
  return isoDate(date).split('-')[2] * 1;

};

function sameMonth(date1, date2) {
  return getMonth(date1) === getMonth(date2);
};

function addWeek(month) {
  var week = $('<div class="week"></div>');
  month.append(week);
  return week;
};

function addDay(date, week) {
  var iso = isoDate(date);
  var day = $('<div class="day"></div>')
    .addClass(date.monthClass + '-mo')
    .html('<div class="date">' + getDate(date) + '</div>')
    .attr('id', iso);
  console.info(date);
  week.append(day);
};

function drawCalendar(dates) {
  var month = $('<div class="month"></div>');
  var week = addWeek(month);
  var endOfWeek1 = dates[6];
  var startOWeek6 = dates[35];
  calendarParent.append(month);
  $.each(dates, function(i, date) {
    addDay(date, week);
    if ((i + 1) % 7 === 0) {
      if (i === 34 && !sameMonth(endOfWeek1, startOWeek6)) {
        return false;
      }
      week = addWeek(month);
    }
  })
};

function createCalendar() {
  var dates = [];
  previousMonth(dates);
  currentMonth(dates);
  nextMonth(dates);
  drawCalendar(dates);
};

function previousMonth(dates) {
  var firstDay = new Date(state.year, state.month).getDay();
  var totalDaysInPrevMonth = new Date(state.year, state.month, 0).getDate();
  for (var i = 1; i <= firstDay; i++) {
    var prevMonthDate = totalDaysInPrevMonth - firstDay + i;
    var key = new Date(state.year, state.month -1, prevMonthDate).toLocaleString();    
    dates.push({key: key, date: prevMonthDate, monthClass: 'prev'});
  }
};

function currentMonth(dates) {
  var today = new Date();
  var totalDaysInMonth = new Date(state.year, state.month + 1, 0).getDate();
  for (var i = 1; i <= totalDaysInMonth; i++) {
    var key = new Date(state.year, state.month, i).toLocaleString();
    if(i === today.getDate() && state.month === today.getMonth() && state.year === today.getFullYear()) {
      dates.push({key: key, date: i, monthClass: 'current', todayClass: 'today'});
    } else{ 
      dates.push({key: key, date: i, monthClass: 'current'});
    }
  }  
};

function nextMonth(dates) {
  var gridsize = 42;
  if(dates.length < gridsize) {
    var count = gridsize - dates.length;
    for(var i = 1; i <= count; i++) {
      var key = new Date(state.year, state.month + 1, i).toLocaleString();
      dates.push({key: key, date: i, monthClass:'next'});
    }
  }
};

function populateCalendar(response) {
  var events = response.data;
  $.each(events, function(i, event) {

  })
};

function getCalendar(node, url) {
  calendarParent = node;
  createCalendar();
  Papa.parse(url, {
    download: true,
    header: true,
    complete: populateCalendar
  });
};

