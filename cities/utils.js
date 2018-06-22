'use strict';

const CONF = require('/p/pancake/settings/config.js');
const config = require('config');
const { CITIES } = require('./cities');

function getCityByDomain(domain) {
  for (let city_kw of Object.keys(CITIES.DICT)) {
    if (CITIES.DICT[city_kw].domain == domain) {
      return CITIES.DICT[city_kw];
    }
  }
}

function _getUrlSchemaHost(city) {
  if (CONF.is_dev) {
    return  config.serverPath.schema + '://' + city.domain + '-' + config.serverPath.domain.withoutCity;
  } else { // old logic
    return config.serverPath.schema + '://' + city.domain + '.' + config.serverPath.domain.withoutCity;
  }
}

function getUrlSchemaHost(cityKW) {
  let city = CITIES.DICT[cityKW];
  if (city === undefined) {
    throw new Error(`City keyword incorrect - ${cityKW}`);
  }
  let url = _getUrlSchemaHost(city);
  return url;
}

function getUrlHost(cityKW) {
  let city = CITIES.DICT[cityKW];
  if (city === undefined) {
    throw new Error(`City keyword incorrect - ${cityKW}`);
  }
  let url;
  if (CONF.is_dev) {
    url = city.domain + '-' + config.serverPath.domain.withoutCity;
  } else { // old logic
    url = city.domain + '.' + config.serverPath.domain.withoutCity;
  }
  // let url = city.domain + '.' + config.serverPath.domain.withoutCity;
  return url;
}

module.exports = {
  getUrlSchemaHost,
  getUrlHost,
  getCityByDomain,
};