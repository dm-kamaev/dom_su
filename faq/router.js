'use strict';

const Router = require('koa-router');
const router = new Router();
const fs = require('fs-promise')
const fsSync = require('fs')
const Handlebars = require('handlebars');
const { getFAQ, getFAQListScroll } = require('./store')
const logger = require('logger')(module)


const FAQRouter = new Router();


// function readTemplate () {
//     let html = fsSync.readFileSync('templates/articles/articles.html', 'utf-8')
//     return Handlebars.compile(html)
// }
//
// let template = readTemplate()

FAQRouter.post('FAQFormHandler', /^\/faq\/form\/$/, async function (ctx, next) {
    ctx.type = 'application/json'
    ctx.body = JSON.stringify({ Success: true })
})

FAQRouter.get('FAQList', /^\/faq\/$/, async function (ctx, next) {
    const {modelList, begin, end} = await getFAQListScroll()
    const html = await fs.readFile('templates/faq/faq.html', 'utf-8')
    const template = Handlebars.compile(html)
    ctx.body = template({ItemList: modelList, Begin: begin, End: end, RightForm: false, HasRightSide: false})
})

FAQRouter.get('FAQItem', /^\/faq\/([0-9a-zA-Z_\-]+)\/$/, async function (ctx, next) {
    let faq, RightForm;
    if (ctx.params[0] === 'form'){
        RightForm = true;
        faq = {id: null}
    } else {
        faq = await getFAQ(ctx.params[0])
        RightForm = false;
    }
    const {modelList, begin, end}= await getFAQListScroll({direction: 0, keyValue: faq.id})
    const html = await fs.readFile('templates/faq/faq.html', 'utf-8')
    const template = Handlebars.compile(html)
    ctx.body = template({ItemList: modelList, Item: faq, Begin: begin, End: end, RightForm: RightForm, HasRightSide: true})
})

FAQRouter.get('FAQListAjax', /^\/m\/faq\/$/, async function (ctx, next) {
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

FAQRouter.get('FAQItemAjax', /^\/m\/faq\/([0-9a-zA-Z_\-]+)\/$/, async function (ctx, next) {
    try {
        const faq = await getFAQ(ctx.params[0])
        let response = { Success: true, Data: { Item: faq} }
        ctx.type = 'application/json'
        ctx.body = response
    } catch (e){
        logger.info(e)
        ctx.type = 'application/json'
        ctx.body = JSON.stringify({ Success: false })
    }
})

module.exports = { FAQRouter: FAQRouter}