"use strict";

const {taskEventCreate} = require('../task')
const { eventType } = require('../event_type')

async function createEventRequest(ctx, next) {
    let task = taskEventCreate({data: {url: ctx.path}, type: eventType.Request})
    ctx.state.queue.push(task)

    await next()
}

module.exports = {createEventRequest: createEventRequest}