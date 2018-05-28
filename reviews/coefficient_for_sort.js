'use strict';

// MODULE FOR CALC coefficient_for_sort

const time = require('/p/pancake/my/time.js');

const coefficient_for_sort = exports;


/**
 * get_coefficient_for_sort convert date to
 * @param  {Date | String} date   new Date | String for new Date
 * @param  {Number} rating: 1 || 2 || 3 || 4 || 5
 * @return {Object} time
 */
coefficient_for_sort.get = function(date, rating) {
  date = time.get(date);
  let res;
  switch (rating) {
    case 1:
      res = minus_n_month(date, 6);
      break;
    case 2:
      res = minus_n_month(date, 4);
      break;
    case 3:
      res = minus_n_month(date, 2);
      break;
    default:
      res = date;
  }
  return res;
};


/**
 * minus_n_month:
 * @param  {Object} date   time
 * @param  {NUmber} number_month
 * @return {time}   time
 */
function minus_n_month(date, number_month) {
  for (var i = 0, l = number_month; i < l; i++) {
    date = time.minus_month(date);
  }
  return date;
};