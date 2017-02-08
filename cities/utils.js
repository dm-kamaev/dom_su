"use strict";


const config = require('config');
const { CITIES_DICT } = require('./cities')

function getCityByDomain(domain) {
    for (let city_kw of Object.keys(CITIES_DICT)){
        if (CITIES_DICT[city_kw].domain == domain){
            return CITIES_DICT[city_kw]
        }
    }
}

function getUrlSchemaHost(cityKW) {
    let city = CITIES_DICT[cityKW]
    if (city === undefined)
        throw new Error(`City keyword incorrect - ${cityKW}`)
    let url = config.serverPath.schema + '://' + city.domain + '.' + config.serverPath.domain.withoutCity
    return url
}

function getUrlHost(cityKW) {
    let city = CITIES_DICT[cityKW]
    if (city === undefined)
        throw new Error(`City keyword incorrect - ${cityKW}`)
    let url = city.domain + '.' + config.serverPath.domain.withoutCity
    return url
}

module.exports = {
    getUrlSchemaHost,
    getUrlHost,
    getCityByDomain,
}