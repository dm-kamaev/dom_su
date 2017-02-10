"use strict";

const Router = require('koa-router');
const { getPromotion } = require('./store')
const fs = require('fs-promise')
const Handlebars = require('handlebars');

const promotionsRouter = new Router({
  prefix: '/skidki_akcii'
});

const promotionsRouterAjax = new Router({
    prefix: '/m/skidki_akcii'
})

promotionsRouter.get('promotionsList', '/', async function (ctx, next) {
    const html = await fs.readFile('templates/promotions/promotions.html', 'utf-8')
    const template = Handlebars.compile(html)
    ctx.body = template({ Begin: true, End: true, HasRightSide: false})
})

promotionsRouter.get('promotionsItem', '/:key/', async function (ctx, next) {
    const promotion = getPromotion(ctx.state.pancakeUser.city, ctx.params.key)
    const html = await fs.readFile('templates/promotions/promotions.html', 'utf-8')
    const template = Handlebars.compile(html)
    ctx.body = template({Item: promotion, Begin: true, End: true, HasRightSide: true})
})

promotionsRouterAjax.get('promotionsListAjax', '/', async function (ctx, next) {
    try {
        const response = { Success: true, Data: {ItemList: [], Begin: true, End: true }}
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