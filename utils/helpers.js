"use strict";
const Handlebars = require('handlebars');
const moment = require('moment')
const { staffUrl } = require('staff')
const { buildUrl } = require('statpages')





// Генерация ссылки для города
Handlebars.registerHelper('buildUrl', buildUrl)


Handlebars.registerHelper('toMoney', function (amount) {
    return amount.toFixed(2)
})

Handlebars.registerHelper('staffUrl', staffUrl)

// Экранирование
Handlebars.registerHelper('raw', function(options) {
  return options.fn(this);
});

const TIMEZONE = "+03:00"

// Формат даты
Handlebars.registerHelper('formatDate', function (date) {
    return moment.parseZone(moment.utc(date).utcOffset(TIMEZONE).format()).format("DD.MM.YYYY")
})

Handlebars.registerHelper('formatPartDate', function (date, format) {
    return moment(date).format(format)
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
        case 'in':
            return (v2.indexOf(v1) >= 0) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
});