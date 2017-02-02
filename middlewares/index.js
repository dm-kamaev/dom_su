'use strict';
const {accessLogger} = require('./accessLogger');
const {errorMiddleware} = require('./error');
const {throw404} = require('./404');
const {applyRouters} = require('./router')


module.exports = {
    errorMiddleware: errorMiddleware,
    throw404: throw404,
    accessLogger: accessLogger,
    applyRouters: applyRouters,
}

