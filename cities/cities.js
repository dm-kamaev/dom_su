"use strict";
const { models, ErrorCodes, ModelsError } = require('models');
const { City } = models;

const DEFAULT_CITY_KW = 'moscow';

let CITIES = { DICT : {}};

async function loadCities() {
    CITIES.LIST = await City.findAll({where:{active:true}})
    for (let city of CITIES.LIST){
        CITIES.DICT[city.keyword] = city
        if (city.keyword == DEFAULT_CITY_KW)
            CITIES.DICT.default = city
    }
    return CITIES.DICT
}

module.exports = {
    CITIES_DICT: CITIES.DICT,
    loadCities,
}

