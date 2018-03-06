#!/usr/local/bin/node

'use strict';

// WORK WITH CITY
const CONF = require('/p/pancake/settings/config.js');
const city_api = exports;

city_api.get_via_host = function(ctx) {
  if (CONF.env === 'dev3') {
    const host = ctx.headers.host || '';
    const cities = ctx.cities;
    if (/^nn-/.test(host)) {
      return cities.nn;
    } else if (/^spb-/.test(host)) {
      return cities.spb;
    } else {
      return cities.default;
    }
  } else { // old logic for dev machine and for prod
    const host = ctx.headers.host || '';
    const cities = ctx.cities;
    if (/^nn\./.test(host)) {
      return cities.nn;
    } else if (/^spb\./.test(host)) {
      return cities.spb;
    } else {
      return cities.default;
    }
  }
};

// TEST
// console.log('HERE', city_api.get_via_host({
//   headers: {
//     // host: 'www.domovenok.su',
//     // host: 'spb.domovenok.su',
//     // host: 'nn.domovenok.su',
//     host: 'www-dev3.domovenoks.su',
//   },
//   cities: {
//     default: 'moscow',
//     spb: 'spb',
//     nn: 'nn',
//   }
// }));

// Нижний Новгород
city_api.is_nn = function (ctx) {
  const host = ctx.headers.host || '';
  if (CONF.env === 'dev3') {
    return host && /^nn-/.test(host);
  } else { // old logic for dev machine and for prod
    return host && /^nn\./.test(host);
  }
};


// Питер
city_api.is_spb = function (ctx) {
  const host = ctx.headers.host || '';
  if (CONF.env === 'dev3') {
    return host && /^spb-/.test(host);
  } else { // old logic for dev machine and for prod
    return host && /^spb\./.test(host);
  }
};