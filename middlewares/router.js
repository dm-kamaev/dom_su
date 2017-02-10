'use strict';

const {articlesRouterAjax, articlesRouter} = require('articles')
const {statpagesRouter} = require('statpages')
const {newsRouterAjax, newsRouter} = require('news')
const {FAQRouterAjax, FAQRouter} = require('faq')
const {reviewsRouterAjax, reviewsRouter} = require('reviews')
const {promotionsRouterAjax, promotionsRouter,} = require('promotions')
const {adminRouter: adminRouter} = require('admin')
const { ticketRouter } = require('tickets')
const { internalAPI } = require('internal_api')

module.exports = {applyRouters: applyRouters}

function applyRouters(app) {
    // Articles
    app.use(articlesRouter.routes())
    app.use(articlesRouterAjax.routes())

    // Tickets
    app.use(ticketRouter.routes())

    // News
    app.use(newsRouter.routes())
    app.use(newsRouterAjax.routes())

    // FAQ
    app.use(FAQRouter.routes())
    app.use(FAQRouterAjax.routes())

    // Reviews
    app.use(reviewsRouter.routes())
    app.use(reviewsRouterAjax.routes())

    // Promotions
    app.use(promotionsRouter.routes())
    app.use(promotionsRouterAjax.routes())

    // Statpages
    app.use(statpagesRouter.routes())

    // Internal API
    app.use(internalAPI.routes())

    // Admin
    app.use(adminRouter.routes())
}


