'use strict';

const {articlesRouter} = require('articles')
const {statpagesRouter} = require('statpages')
const {newsRouter} = require('news')
const {FAQRouter} = require('faq')
const {reviewsRouter} = require('reviews')
const {promotionsRouter} = require('promotions')
const {adminRouter: adminRouter} = require('admin')
const { ticketRouter } = require('tickets')
const { internalAPI } = require('internalApi')

module.exports = {applyRouters: applyRouters}

function applyRouters(app) {
    // Articles
    app.use(articlesRouter.routes())

    // Tickets
    app.use(ticketRouter.routes())

    // News
    app.use(newsRouter.routes())

    // FAQ
    app.use(FAQRouter.routes())

    // Reviews
    app.use(reviewsRouter.routes())

    // Promotions
    app.use(promotionsRouter.routes())

    // Statpages
    app.use(statpagesRouter.routes())

    // Internal API
    app.use(internalAPI.routes())

    // Admin
    app.use(adminRouter.routes())
}


