'use strict';
var util = require('util')

function API1CError(code, token, message, status){
    this.name = 'API1CError'
    this.code = code
    this.status = status || 500
    this.message = message
    this.token = token

    Error.captureStackTrace(this, API1CError)
}
util.inherits(API1CError, Error)
API1CError.prototype.name = 'API1CError'

module.exports = {API1CError: API1CError}