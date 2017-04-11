"use strict";

const { internalServiceAPI } = require('internal_api')
const { userManagerServiceRouter } = require('user_manager')

module.exports = {applyServiceRouters: applyServiceRouters}

function applyServiceRouters(app) {
    // Internal Service API
    app.use(internalServiceAPI.routes())

    // Call tracking
    app.use(userManagerServiceRouter.routes())
}