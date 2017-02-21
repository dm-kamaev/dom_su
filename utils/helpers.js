"use strict";
const Handlebars = require('handlebars');
const { checkExistUrl } = require('statpages')
const { CITIES } = require('cities')
const moment = require('moment')

// Генерация ссылки для города
Handlebars.registerHelper('buildUrl', function (cityKW, url) {
    if (typeof cityKW == 'object') {
        cityKW = cityKW.keyword
    }
    if (checkExistUrl(CITIES.DICT[cityKW], url)){
        return CITIES.URL[cityKW] + url
    } else {
        return CITIES.URL[cityKW]
    }
})

// Экранирование
Handlebars.registerHelper('raw', function(options) {
  return options.fn(this);
});

const TIMEZONE = "+03:00"

// Формат даты
Handlebars.registerHelper('formatDate', function (date) {
    return moment.parseZone(moment.utc(date).utcOffset(TIMEZONE).format()).format("DD.MM.YYYY")
})

// Сравнение
Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
    switch (operator) {
        case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!=':
            return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case '!==':
            return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
});