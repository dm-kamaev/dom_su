"use strict";

const { internalAPI } = require('internal_api')
const { userManagerServiceRouter } = require('user_manager')

module.exports = {applyServiceRouters: applyServiceRouters}

function applyServiceRouters(app) {
    // Internal API
    app.use(internalAPI.routes())

    // Calltracking
    app.use(userManagerServiceRouter.routes())
}