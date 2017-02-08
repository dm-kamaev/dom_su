'use strict';

const Router = require('koa-router');
const router = new Router();
const fs = require('fs-promise')
const fsSync = require('fs')
const Handlebars = require('handlebars');
const { getFAQ, getFAQListScroll } = require('./store')
const logger = require('logger')(module)


const FAQRouter = new Router({
  prefix: '/faq'
});

const FAQRouterAjax = new Router({
    prefix: '/m/faq'
})

// function readTemplate () {
//     let html = fsSync.readFileSync('templates/articles/articles.html', 'utf-8')
//     return Handlebars.compile(html)
// }
//
// let template = readTemplate()

FAQRouter.post('FAQFormHandler', '/form/', async function (ctx, next) {
    ctx.type = 'application/json'
    ctx.body = JSON.stringify({ Success: true })
})

FAQRouter.get('FAQList', '/', async function (ctx, next) {
    const {modelList, begin, end} = await getFAQListScroll()
    const html = await fs.readFile('templates/faq/faq.html', 'utf-8')
    const template = Handlebars.compile(html)
    ctx.body = template({ItemList: modelList, Begin: begin, End: end, RightForm: false, HasRightSide: false})
})

FAQRouter.get('FAQItem', '/:key/', async function (ctx, next) {
    let faq, RightForm;
    if (ctx.params.key === 'form'){
        RightForm = true;
        faq = {id: null}
    } else {
        faq = await getFAQ(ctx.params.key)
        RightForm = false;
    }
    const {modelList, begin, end}= await getFAQListScroll({direction: 0, keyValue: faq.id})
    const html = await fs.readFile('templates/faq/faq.html', 'utf-8')
    const template = Handlebars.compile(html)
    ctx.body = template({ItemList: modelList, Item: faq, Begin: begin, End: end, RightForm: RightForm, HasRightSide: true})
})

FAQRouterAjax.get('FAQListAjax', '/', async function (ctx, next) {
    try {
        const direction = ctx.query.direction;
        const {modelList, begin, end} = await getFAQListScroll({keyValue: ctx.query.key, direction: direction})
        const response = { Success: true, Data: {ItemList: modelList, Begin: begin, End: end }}
        ctx.type = 'application/json'
        ctx.body = JSON.stringify(response)
    } catch (e) {
        logger.info(e)
        ctx.type = 'application/json'
        ctx.body = JSON.stringify({ Success: false })
    }
})

FAQRouterAjax.get('FAQItemAjax', '/:key/', async function (ctx, next) {
    try {
        const faq = await getFAQ(ctx.params.key)
        let response = { Success: true, Data: { Item: faq} }
        ctx.type = 'application/json'
        ctx.body = response
    } catch (e){
        logger.info(e)
        ctx.type = 'application/json'
        ctx.body = JSON.stringify({ Success: false })
    }
})

module.exports = { FAQRouter: FAQRouter, FAQRouterAjax: FAQRouterAjax}