"use strict";

const Router = require('koa-router');
const { eventType } = require('../event_type')
const createEventLiving = new Router();

createEventLiving.post('/living/', async function (ctx, next) {
    ctx.state.pancakeUser.createEvent({type: eventType.Living, data: {url: ctx.path}})
    ctx.state.pancakeUser.setGoogleId()
    ctx.type = 'application/json'
    ctx.body = JSON.stringify({ Success: true })
})

module.exports = {
    createEventLiving,
}