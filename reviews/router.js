'use strict';

const Router = require('koa-router');
const router = new Router();
const fs = require('fs-promise')
const fsSync = require('fs')
const Handlebars = require('handlebars');
const { getReview, getReviewListScroll } = require('./store')
const logger = require('logger')(module)


const reviewsRouter = new Router();

// function readTemplate () {
//     let html = fsSync.readFileSync('templates/articles/articles.html', 'utf-8')
//     return Handlebars.compile(html)
// }
//
// let template = readTemplate()

reviewsRouter.post('reviewsFormHandler', /^\/otzivi\/form\/$/, async function (ctx, next) {
    ctx.type = 'application/json'
    ctx.body = JSON.stringify({ Success: true })
})

reviewsRouter.get('reviewsList', /^\/otzivi\/$/, async function (ctx, next) {
    const {modelList, begin, end} = await getReviewListScroll()
    const html = await fs.readFile('templates/reviews/reviews.html', 'utf-8')
    const template = Handlebars.compile(html)
    ctx.body = template({ItemList: modelList, Begin: begin, End: end, RightForm: false, HasRightSide: false})
})

reviewsRouter.get('reviewItem', /^\/otzivi\/([0-9a-zA-Z_\-]+)\/$/, async function (ctx, next) {
    let review, RightForm;
    if (ctx.params[0] === 'form'){
        review = { id: null }
        RightForm = true
    } else {
        review = await getReview(ctx.params[0])
        RightForm = false
    }
    const {modelList, begin, end}= await getReviewListScroll({direction: 0, keyValue: review.id})
    const html = await fs.readFile('templates/reviews/reviews.html', 'utf-8')
    const template = Handlebars.compile(html)
    ctx.body = template({ItemList: modelList, Item: review, Begin: begin, End: end, RightForm: RightForm, HasRightSide: true})
})

reviewsRouter.get('reviewListAjax', /^\/m\/otzivi\/$/, async function (ctx, next) {
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

reviewsRouter.get('reviewItemAjax', /^\/m\/otzivi\/([0-9a-zA-Z_\-]+)\/$/, async function (ctx, next) {
    try {
        const review = await getReview(ctx.params[0])
        let response = { Success: true, Data: { Item: review} }
        ctx.type = 'application/json'
        ctx.body = response
    } catch (e){
        logger.info(e)
        ctx.type = 'application/json'
        ctx.body = JSON.stringify({ Success: false })
    }
})

module.exports = { reviewsRouter: reviewsRouter}