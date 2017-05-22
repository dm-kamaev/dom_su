"use strict";

const { internalServiceAPI } = require('internal_api')
const { userManagerServiceRouter } = require('user_manager')
const { staffServiceRouter } = require('staff')

module.exports = {applyServiceRouters: applyServiceRouters}

function applyServiceRouters(app) {
    // Internal Service API
    app.use(internalServiceAPI.routes())

    // Call tracking
    app.use(userManagerServiceRouter.routes())

    // Staff service (pending token)
    app.use(staffServiceRouter.routes())
}