'use strict';
var util = require('util')

const ErrorCodes = {
    DuplicateModelName: 'DuplicateModelName',
    ModelIsEmpty: 'ModelIsEmpty',
    NeedAdminModelType: 'NeedAdminModelType',
    ReferencesModelError: 'ReferencesModelError',
    PrimaryKeyNotFound: 'PrimaryKeyNotFound',
    ModelIsNotFound: 'ModelIsNotFound',
}


function AdminPanelError(code, message, status){
    this.name = 'AdminPanelError'
    this.code = code
    this.status = status || 500
    this.message = message || code

    Error.captureStackTrace(this, AdminPanelError)
}



util.inherits(AdminPanelError, Error)
AdminPanelError.prototype.name = 'AdminPanelError'

module.exports = {AdminPanelError: AdminPanelError, ErrorCodes: ErrorCodes}