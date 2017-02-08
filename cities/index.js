"use strict";

const { CITIES, loadCities } = require('./cities')
const { getUrlSchemaHost } = require('./utils')
const {accessSectionCity} = require('./middleware/accessSectionCity')

module.exports = {
    CITIES,
    getUrlSchemaHost,
    accessSectionCity,
    loadCities,
}