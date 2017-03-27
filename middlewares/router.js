'use strict';

const {articlesRouter} = require('articles')
const {statpagesRouter} = require('statpages')
const {newsRouter} = require('news')
const {FAQRouter} = require('faq')
const {reviewsRouter} = require('reviews')
const {promotionsRouter} = require('promotions')
const { ticketRouter } = require('tickets')
const { paymentsRouter } = require('payments')

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

    // Payments
    app.use(paymentsRouter.routes())

    // Statpages
    app.use(statpagesRouter.routes())
}


