"use strict";
const { PancakeService } = require('../../pancakeService')

async function initPancakeService(ctx, next){
    ctx.state.pancakeService = new PancakeService(ctx)
    console.log('123123')
    await next()
    ctx.state.pancakeService.runAsyncTask()
}

module.exports = {
    initPancakeService
}