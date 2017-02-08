'use strict';

const {articlesRouterAjax, articlesRouter} = require('articles')
const {statpagesRouter} = require('statpages')
const {newsRouterAjax, newsRouter} = require('news')
const {FAQRouterAjax, FAQRouter} = require('faq')
const {reviewsRouterAjax, reviewsRouter} = require('reviews')
const {adminRouter: adminRouter} = require('admin')
const { internalAPI } = require('internal_api')

module.exports = {applyRouters: applyRouters}

function applyRouters(app) {
    // Articles
    app.use(articlesRouter.routes())
    app.use(articlesRouterAjax.routes())

    // News
    app.use(newsRouter.routes())
    app.use(newsRouterAjax.routes())

    // FAQ
    app.use(FAQRouter.routes())
    app.use(FAQRouterAjax.routes())

    // Reviews
    app.use(reviewsRouter.routes())
    app.use(reviewsRouterAjax.routes())

    // Statpages
    app.use(statpagesRouter.routes())

    // Internal API
    app.use(internalAPI.routes())

    // Admin
    app.use(adminRouter.routes())
}


