'use strict';
const {accessLogger} = require('./accessLogger');
const {errorMiddleware} = require('./error');
const {throw404} = require('./404');
const {applyRouters} = require('./router')
const {applyServiceRouters} = require('./serviceRouter')
const {checkSlashEnd} = require('./checkSlashEnd')


module.exports = {
    errorMiddleware,
    throw404,
    accessLogger,
    applyRouters,
    checkSlashEnd,
    applyServiceRouters,
}

