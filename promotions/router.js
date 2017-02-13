"use strict";

const Router = require('koa-router');
const { getPromotion, getPromotionList } = require('./store')
const fs = require('fs-promise')
const Handlebars = require('handlebars');

const promotionsRouter = new Router({
  prefix: '/skidki_akcii'
});

const promotionsRouterAjax = new Router({
    prefix: '/m/skidki_akcii'
})

promotionsRouter.get('promotionsList', '/', async function (ctx, next) {
    const modelList = getPromotionList(ctx.state.pancakeUser.city)
    const html = await fs.readFile('templates/promotions/promotions.html', 'utf-8')
    const template = Handlebars.compile(html)
    ctx.body = template({ItemList: modelList, Begin: true, End: true, HasRightSide: false})
})

promotionsRouter.get('promotionsItem', '/:key/', async function (ctx, next) {
    const modelList = getPromotionList(ctx.state.pancakeUser.city)
    const promotion = getPromotion(ctx.state.pancakeUser.city, ctx.params.key)
    const html = await fs.readFile('templates/promotions/promotions.html', 'utf-8')
    const template = Handlebars.compile(html)
    ctx.body = template({ItemList: modelList, Item: promotion, Begin: true, End: true, HasRightSide: true})
})

promotionsRouterAjax.get('promotionsListAjax', '/', async function (ctx, next) {
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

promotionsRouterAjax.get('promotionsItemAjax', '/:key/', async function (ctx, next) {
    try {
        const promotion = getPromotion(ctx.state.pancakeUser.city, ctx.params.key)
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
    promotionsRouterAjax,
}