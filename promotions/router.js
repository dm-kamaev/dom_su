"use strict";

const Router = require('koa-router');
const { getPromotion, getPromotionList } = require('./store')
const { getTemplate, loadTemplate } = require('utils')

const promotionsTemplateOpts = {
    path: 'templates/promotions/promotions.html',
    name: 'promotions'
}

const menu = {
    main: true,
    skidki_akcii: true
}

loadTemplate(promotionsTemplateOpts)

const promotionsRouter = new Router();


promotionsRouter.get('promotionsList', /^\/skidki_akcii\/$/, async function (ctx, next) {
    const modelList = getPromotionList(ctx.state.pancakeUser.city)
    const template = getTemplate(promotionsTemplateOpts)
    ctx.body = template(ctx.proc({ItemList: modelList, Begin: true, End: true, HasRightSide: false, menu: menu}))
})

promotionsRouter.get('promotionsItem', /^\/skidki_akcii\/([0-9a-zA-Z_\-]+)\/$/, async function (ctx, next) {
    const modelList = getPromotionList(ctx.state.pancakeUser.city)
    const promotion = getPromotion(ctx.state.pancakeUser.city, ctx.params[0])
    if (promotion === undefined){
        await next()
        return
    }
    const template = getTemplate(promotionsTemplateOpts)
    ctx.body = template(ctx.proc({ItemList: modelList, Item: promotion, Begin: true, End: true, HasRightSide: true, menu: menu}))
})

promotionsRouter.get('promotionsListAjax', /^\/m\/skidki_akcii$/, async function (ctx, next) {
    try {
        const modelList = getPromotionList(ctx.state.pancakeUser.city)
        const response = { Success: true, Data: {ItemList: modelList, Begin: true, End: true }}
        ctx.type = 'application/json'
        ctx.body = JSON.stringify(response)
    } catch (e) {
        logger.info(e)
        ctx.type = 'application/json'
        ctx.body = JSON.stringify({ Success: false })
    }
})

promotionsRouter.get('promotionsItemAjax', /^\/m\/skidki_akcii\/([0-9a-zA-Z_\-]+)$/, async function (ctx, next) {
    try {
        const promotion = getPromotion(ctx.state.pancakeUser.city, ctx.params[0])
        let response = { Success: true, Data: { Item: promotion} }
        ctx.type = 'application/json'
        ctx.body = response
    } catch (e){
        logger.info(e)
        ctx.type = 'application/json'
        ctx.body = JSON.stringify({ Success: false })
    }
})

module.exports = {
    promotionsRouter,
}