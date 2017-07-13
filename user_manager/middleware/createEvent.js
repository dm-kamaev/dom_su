"use strict";

const Router = require('koa-router');
const { eventType } = require('../event_type')
const createEvent = new Router();
const logger = require('logger')(module)

// createEventLiving.post('/living/', async function (ctx, next) {
//     ctx.state.pancakeUser.createEvent({type: eventType.Living, data: {url: ctx.path}})
//
//
//
//     ctx.body = JSON.stringify({ Success: true })
// })

createEvent.post('/event-handler', async function (ctx, next) {
    let type = ctx.request.body.type
    let data = ctx.request.body.data
    if (type == eventType.Living){
        ctx.state.pancakeUser.setGoogleId()
        ctx.set('Expires', '0')
    }
    ctx.state.pancakeUser.createEvent({type: type, data: data})
    ctx.type = 'application/json'
    ctx.body = JSON.stringify({ Success: true })
})


module.exports = {
    createEvent,
}