'use strict';

const Router = require('koa-router');
const router = new Router();
const fs = require('fs-promise')
const fsSync = require('fs')
const Handlebars = require('handlebars');
const { getReview, getReviewListScroll } = require('./store')
const logger = require('logger')(module)


const reviewsRouter = new Router({
  prefix: '/otzivi'
});

const reviewsRouterAjax = new Router({
    prefix: '/m/otzivi'
})

// function readTemplate () {
//     let html = fsSync.readFileSync('templates/articles/articles.html', 'utf-8')
//     return Handlebars.compile(html)
// }
//
// let template = readTemplate()

reviewsRouter.get('reviewsList', '/', async function (ctx, next) {
    const {modelList, begin, end} = await getReviewListScroll()
    const html = await fs.readFile('templates/reviews/reviews.html', 'utf-8')
    const template = Handlebars.compile(html)
    for (let i of modelList) {console.log(i.url)}
    ctx.body = template({ItemList: modelList, Begin: begin, End: end})
})

reviewsRouter.get('reviewItem', '/:key/', async function (ctx, next) {
    const review = await getReview(ctx.params.key)
    const {modelList, begin, end}= await getReviewListScroll({direction: 0, keyValue: review.id})
    const html = await fs.readFile('templates/reviews/reviews.html', 'utf-8')
    const template = Handlebars.compile(html)
    ctx.body = template({ItemList: modelList, Item: review, Begin: begin, End: end})
})

reviewsRouterAjax.get('reviewListAjax', '/', async function (ctx, next) {
    try {
        const direction = ctx.query.direction;
        const {modelList, begin, end} = await getReviewListScroll({keyValue: ctx.query.key, direction: direction})
        const response = { Success: true, Data: {ItemList: modelList, Begin: begin, End: end }}
        ctx.type = 'application/json'
        ctx.body = JSON.stringify(response)
    } catch (e) {
        logger.info(e)
        ctx.type = 'application/json'
        ctx.body = JSON.stringify({ Success: false })
    }
})

reviewsRouterAjax.get('reviewItemAjax', '/:key/', async function (ctx, next) {
    try {
        const review = await getReview(ctx.params.key)
        let response = { Success: true, Data: { Item: review} }
        ctx.type = 'application/json'
        ctx.body = response
    } catch (e){
        logger.info(e)
        ctx.type = 'application/json'
        ctx.body = JSON.stringify({ Success: false })
    }
})

module.exports = { reviewsRouter: reviewsRouter, reviewsRouterAjax: reviewsRouterAjax}