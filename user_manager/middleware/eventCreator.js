"use strict";

const {taskEventCreate} = require('../task')

async function createEventRequest(ctx, next) {
    let task = taskEventCreate({data: {url: ctx.path}, type: 'Request'})
    ctx.state.queue.push(task)

    await next()
}

module.exports = {createEventRequest: createEventRequest}