'use strict';

// WORK WITH TIME

const time = exports;

// ны вход, ms, строка в нужном формате
// console.log(time.get());
time.get = function (data) {
  const now = (data) ? new Date(data) : new Date();
  const
    sec   = now.getSeconds(),   // Секунды
    min   = now.getMinutes(),   // Минуты
    hour  = now.getHours(),     // Часы
    day   = now.getDate(),      // День
    month = now.getMonth() + 1, // Месяц
    year  = now.getFullYear(),  // Год

    double_sec   = addPrefixZero(now.getSeconds()),   // Секунды c префиксным 0
    double_min   = addPrefixZero(now.getMinutes()),   // Минуты c префиксным  0
    double_hour  = addPrefixZero(now.getHours()),     // Часы c префиксным    0
    double_day   = addPrefixZero(now.getDate()),      // День c префиксным    0
    double_month = addPrefixZero(now.getMonth() + 1), // Месяц c префиксным   0

    in_ms = now.getTime(),         // время в ms
    in_s  = now.getTime() / 1000; // время в s

  return new Time({
    new_Date: now, // instanse object new Date
    sec  : sec,
    min  : min,
    hour : hour,
    day  : day,
    month: month,
    year : year,

    double_sec  : double_sec,
    double_min  : double_min,
    double_hour : double_hour,
    double_day  : double_day,
    double_month: double_month,

    in_ms: in_ms,
    in_s : in_s,
    // __its_me: 'time.js',
  });
};


class Time {
  constructor(params) {
    // instanse object new Date
    this.new_Date = params.new_Date;
    this.sec = params.sec;
    this.min = params.min;
    this.hour = params.hour;
    this.day = params.day;
    this.month = params.month;
    this.year = params.year;

    this.double_sec = params.double_sec;
    this.double_min = params.double_min;
    this.double_hour = params.double_hour;
    this.double_day = params.double_day;
    this.double_month = params.double_month;

    this.in_ms = params.in_ms;
    this.in_s = params.in_s;
  }

  /**
   * format: format time
   * @param  {String} format: YYY-MM-DD hh:mm:ss
   * @return {String} YYY-MM-DD hh:mm:ss
   */
  format(format) {
    return time.format(format, this);
  }
}


// sec, min, hour, day, month,
function addPrefixZero(el) {
  el = el.toString();
  if (el && el < 10)  {el = '0' + el;}
  return el;
}

function its_me(object) {
  return object instanceof Time;
}

time.format = function(str, data) {
  const date = data instanceof Time ? data : time.get(data || null);
  // console.log('FORMAT', str, data, );
  return str.replace(/YYYY/g, date.year)
    .replace(/MM/g, date.double_month)
    .replace(/DD/g, date.double_day)

  .replace(/hh/g, date.double_hour)
    .replace(/mm/g, date.double_min)
    .replace(/ss/g, date.double_sec)
    .replace(/in_ms/g, date.in_ms)

  .replace(/month_name/g, time.getMonthName(date.month));
};

// number_month –– string
time.get_month_name = time.getMonthName = function (numberMonth) {
  numberMonth = parseInt(numberMonth, 10);
  const listMonthName = [
    null,
    'января',
    'февраля',
    'марта',
    'апреля',
    'мая',
    'июня',
    'июля',
    'августа',
    'сентября',
    'октября',
    'ноября',
    'декабря',
  ];
  return listMonthName[numberMonth];
};




/**
 * minus_month: делаем месяц назад с учетом дня
 * если дей в текущем месяце больше, чем в предыдущем то берем последнийй предыдущего месяца
 * @param  {time}  time.get() || time.get('2018-04-05')
 * @return {time}
 */
time.minus_month = function(date) {
  var current = (its_me(date)) ? date.new_Date : time.get().new_Date;

  var prev;
  var month = current.getMonth();
  var year = current.getFullYear();

  var days_in_prev_month = calc_days_in_month(year, month - 1);
  var num_date = current.getDate();
  // если день текущего месяца больше кол-во дней в предыдущем месяце, то выставляем последний день предыдущего месяца
  if (current.getDate() > days_in_prev_month) {
    num_date = days_in_prev_month;
  }

  if (month === 0) {
    prev = new Date(year - 1, 11, current.getDate(), current.getHours(), current.getMinutes(), current.getSeconds(), current.getMilliseconds());
  } else {
    // console.log(year, month - 1, num_date);
    prev = new Date(year, month - 1, num_date, current.getHours(), current.getMinutes(), current.getSeconds(), current.getMilliseconds());
  }

  return time.get(prev);
};


/**
 * calc_days_in_month
 * @param  {Number} year:  1970 || 2017 and etc
 * @param  {Number} month: 0-11
 * @return {Number} 29 || 30 || 31
 */
function calc_days_in_month(year, month) {
  // create next month and set 0 for get last day previous month
  var last_day_in_month = new Date(year, (month+1), 0);
  return last_day_in_month.getDate();
}