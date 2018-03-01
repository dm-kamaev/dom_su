'use strict';

const { models } = require('models');
const { City } = models;
const CONF = require('/p/pancake/settings/config.js');
const config = require('config');

const DEFAULT_CITY_KW = 'moscow';

const CITIES = { DICT : {}, URL: {}};
// CITIES.URL: {
//     spb: 'https://spb.dev2.domovenok.su',
//     nn: 'https://nn.dev2.domovenok.su',
//     default: 'https://www.dev2.domovenok.su',
//     moscow: 'https://www.dev2.domovenok.su'
// }

async function loadCities() {
  CITIES.LIST = await City.findAll({
    where: {
      active: true
    }
  });
  for (let city of CITIES.LIST) {
    CITIES.DICT[city.keyword] = city;
    if (city.keyword == DEFAULT_CITY_KW) {
      CITIES.DICT.default = city;
      CITIES.URL.default = config.serverPath.schema + '://' + city.domain + '.' + config.serverPath.domain.withoutCity;
    }
    CITIES.URL[city.keyword] = config.serverPath.schema + '://' + city.domain + '.' + config.serverPath.domain.withoutCity;
  }
  return CITIES.DICT;
}

// CITIES.loadCities_new => {
//  spb: 'https://spb-dev2.domovenok.su',
//  nn: 'https://nn-dev2.domovenok.su',
//  default: 'https://www-dev2.domovenok.su',
//  moscow: 'https://www-dev2.domovenok.su'
// }
async function loadCities_new() {
  CITIES.LIST = await City.findAll({
    where: {
      active: true
    }
  });
  for (let city of CITIES.LIST) {
    CITIES.DICT[city.keyword] = city;
    if (city.keyword == DEFAULT_CITY_KW) {
      CITIES.DICT.default = city;
      CITIES.URL.default = config.serverPath.schema + '://' + city.domain + '-' + config.serverPath.domain.withoutCity;
    }
    CITIES.URL[city.keyword] = config.serverPath.schema + '://' + city.domain + '-' + config.serverPath.domain.withoutCity;
  }
  return CITIES.DICT;
}


module.exports = {
  CITIES,
  loadCities: (CONF.env === 'dev3' ? loadCities_new : loadCities),
};

