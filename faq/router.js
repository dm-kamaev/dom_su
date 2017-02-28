'use strict';

const Router = require('koa-router');
const router = new Router();
const { getFAQ, getFAQListScroll, saveFAQ } = require('./store')
const logger = require('logger')(module)
const { getTemplate, loadTemplate } = require('utils')

const FAQTemplateOpts = {
    path: 'templates/faq/faq.html',
    name: 'faq'
}

const menu = {
    main: true,
    faq: true
}

const FAQRouter = new Router();
loadTemplate(FAQTemplateOpts)



FAQRouter.post('FAQFormHandler', /^\/faq\/form\/$/, async function (ctx, next) {
    ctx.type = 'application/json'
    let response = { Success: false }
    // Validation
    if (ctx.request.body){
        if (typeof ctx.request.body.name == 'string' && ctx.request.body.name.length > 0)
        if (typeof ctx.request.body.mail == 'string' && ctx.request.body.mail.length > 0)
        if (typeof ctx.request.body.question == 'string' && ctx.request.body.question.length > 0){
            await saveFAQ(ctx.request.body.name, ctx.request.body.mail, ctx.request.body.question)
            response.Success = true
            // ctx.state.pancakeUser.sendTicket("Review", {
            //     rating: ctx.request.body.rating,
            //     name: ctx.request.body.name,
            //     mail: ctx.request.body.mail,
            //     review: ctx.request.body.review
            // })
        }
    }
    ctx.body = JSON.stringify(response)
})

FAQRouter.get('FAQList', /^\/faq\/$/, async function (ctx, next) {
    const {modelList, begin, end} = await getFAQListScroll()
    const template = getTemplate(FAQTemplateOpts)
    ctx.body = template(ctx.proc({ItemList: modelList, Begin: begin, End: end, RightForm: false, HasRightSide: false, menu: menu}))
})

FAQRouter.get('FAQItem', /^\/faq\/([0-9a-zA-Z_\-]+)\/$/, async function (ctx, next) {
    let faq, RightForm;
    if (ctx.params[0] === 'form'){
        RightForm = true;
        faq = {id: null}
    } else {
        if (isNaN(ctx.params[0])){
            await next()
            return
        }
        faq = await getFAQ(ctx.params[0])
        RightForm = false;
        if (faq === null){
            await next()
            return
        }
    }
    const {modelList, begin, end}= await getFAQListScroll({direction: 0, keyValue: faq.id})
    const template = getTemplate(FAQTemplateOpts)
    ctx.body = template(ctx.proc({ItemList: modelList, Item: faq, Begin: begin, End: end, RightForm: RightForm, HasRightSide: true, menu: menu}))
})

FAQRouter.get('FAQListAjax', /^\/m\/faq$/, async function (ctx, next) {
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

FAQRouter.get('FAQItemAjax', /^\/m\/faq\/([0-9a-zA-Z_\-]+)$/, async function (ctx, next) {
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