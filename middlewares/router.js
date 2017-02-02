'use strict';

const {articlesRouterAjax, articlesRouter} = require('articles')
const {adminRouter: adminRouter} = require('admin')

module.exports = {applyRouters: applyRouters}

function applyRouters(app) {
    // Articles
    app.use(articlesRouter.routes())
    app.use(articlesRouterAjax.routes())

    // Admin
    app.use(adminRouter.routes())
}


