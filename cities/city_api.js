#!/usr/local/bin/node

'use strict';

// WORK WITH CITY

const db = require('/p/pancake/my/db.js');

const city_api = exports;

city_api.get_via_host = function(ctx) {
  const host = ctx.headers.host || '';
  const cities = ctx.cities;
  if (/^nn\./.test(host)) {
    return cities.nn;
  } else if (/^spb\./.test(host)) {
    return cities.spb;
  } else {
    return cities.default;
  }
};

// TEST
/*console.log(city_api.get_via_host({
  headers: {
    host: 'www.domovenok.su',
    // host: 'spb.domovenok.su',
    // host: 'nn.domovenok.su',
  },
  cities: {
    default: 'moscow',
    spb: 'spb',
    nn: 'nn',
  }
}));*/

// Нижний Новгород
city_api.is_nn = function (ctx) {
  const host = ctx.headers.host || '';
  return host && /^nn\./.test(host);
};



