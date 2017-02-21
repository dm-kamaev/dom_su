"use strict";
const { models, ErrorCodes, ModelsError } = require('models');
const { City } = models;
const config = require('config');

const DEFAULT_CITY_KW = 'moscow';

let CITIES = { DICT : {}, URL: {}};

async function loadCities() {
    CITIES.LIST = await City.findAll({where:{active:true}})
    for (let city of CITIES.LIST){
        CITIES.DICT[city.keyword] = city
        if (city.keyword == DEFAULT_CITY_KW){
            CITIES.DICT.default = city
            CITIES.URL.default = config.serverPath.schema + '://' + city.domain + '.' + config.serverPath.domain.withoutCity
        }
        CITIES.URL[city.keyword] = config.serverPath.schema + '://' + city.domain + '.' + config.serverPath.domain.withoutCity
    }
    return CITIES.DICT
}

module.exports = {
    CITIES: CITIES,
    loadCities,
}

