'use strict';

const {articlesRouterAjax, articlesRouter} = require('articles')
const {newsRouterAjax, newsRouter} = require('news')
const {FAQRouterAjax, FAQRouter} = require('faq')
const {reviewsRouterAjax, reviewsRouter} = require('reviews')
const {adminRouter: adminRouter} = require('admin')

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

    // Admin
    app.use(adminRouter.routes())
}


