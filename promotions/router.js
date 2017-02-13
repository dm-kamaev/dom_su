"use strict";

const Router = require('koa-router');
const { getPromotion, getPromotionList } = require('./store')
const fs = require('fs-promise')
const Handlebars = require('handlebars');

const promotionsRouter = new Router();


promotionsRouter.get('promotionsList', /^\/skidki_akcii\/$/, async function (ctx, next) {
    const modelList = getPromotionList(ctx.state.pancakeUser.city)
    const html = await fs.readFile('templates/promotions/promotions.html', 'utf-8')
    const template = Handlebars.compile(html)
    ctx.body = template({ItemList: modelList, Begin: true, End: true, HasRightSide: false})
})

promotionsRouter.get('promotionsItem', /^\/skidki_akcii\/([0-9a-zA-Z_\-]+)\/$/, async function (ctx, next) {
    const modelList = getPromotionList(ctx.state.pancakeUser.city)
    const promotion = getPromotion(ctx.state.pancakeUser.city, ctx.params[0])
    const html = await fs.readFile('templates/promotions/promotions.html', 'utf-8')
    const template = Handlebars.compile(html)
    ctx.body = template({ItemList: modelList, Item: promotion, Begin: true, End: true, HasRightSide: true})
})

promotionsRouter.get('promotionsListAjax', /^\/m\/skidki_akcii\/$/, async function (ctx, next) {
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

promotionsRouter.get('promotionsItemAjax', /^\/m\/skidki_akcii\/([0-9a-zA-Z_\-]+)\/$/, async function (ctx, next) {
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