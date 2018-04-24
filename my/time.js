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

  return {
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
    __its_me: 'time.js',
  };
};


// sec, min, hour, day, month,
function addPrefixZero(el) {
  el = el.toString();
  if (el && el < 10)  {el = '0' + el;}
  return el;
}

function is_me(object) {
  return (object && typeof object === 'object' && object.__its_me === 'time.js') ? true : false;
}

time.format = function(str, data) {
  const date = is_me(data) ? data : time.get(data || null);
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
time.getMonthName = function (numberMonth) {
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