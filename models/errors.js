'use strict';
var util = require('util')

const ErrorCodes = {
    QueryParamError: 'QueryParamError',
}


function ModelsError(code, message, status){
    this.name = 'ModelsError'
    this.code = code
    this.status = status || 500
    this.message = message || code

    Error.captureStackTrace(this, ModelsError)
}



util.inherits(ModelsError, Error)
ModelsError.prototype.name = 'ModelsError'

module.exports = {ModelsError: ModelsError, ErrorCodes: ErrorCodes}