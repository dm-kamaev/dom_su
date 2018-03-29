'use strict';
const { getUrlHost, getCityByDomain } = require('../utils');
const CONF = require('/p/pancake/settings/config.js');
const config = require('config');

let regexpString;
// new logic for dev machine
if (CONF.is_new_dev()) {
  // example: ^(:?\w+)-dev3\.domovenok\.su$
  regexpString = '^(:?\\w+)' + '-' + config.serverPath.domain.withoutCity.replace(/\./g,'\\\.') + '$';
} else { // old logic and for prod
  // example: ^(:?\w+)\.dev3\.domovenok\.su$
  regexpString = '^(:?\\w+)' + '\\\.' + config.serverPath.domain.withoutCity.replace(/\./g,'\\\.') + '$';
}

let regexp = new RegExp(regexpString, 'g');

function needChangeCity(ctx) {
  let newCity = ctx.state.pancakeUser.city;
  if (getUrlHost(ctx.state.pancakeUser.city.keyword) != ctx.request.host){
    regexp.lastIndex = 0;
    let match = regexp.exec(ctx.request.host);
    if (match === null) {
      newCity = ctx.cities.default;
    } else {
      newCity = getCityByDomain(match[1]);
    }
  }

  if (newCity !== ctx.state.pancakeUser.city){
    return { result: true, city: newCity};
  } else {
    return { result: false};
  }
}


async function accessSectionCity(ctx, next) {
  let needChange = needChangeCity(ctx);
  if (needChange.result == true){
    ctx.state.pancakeUser.changeCity(needChange.city);
  }
  await next();
}


module.exports = {
  accessSectionCity,
};