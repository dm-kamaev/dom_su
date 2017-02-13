"use strict";
const { PancakeService } = require('../../pancakeService')

async function PancakeService(ctx, next){
    if (!ctx.headers['X-Dom-Service']){
        await next()
        return
    }
    ctx.state.pancakeService = new PancakeService()
    await next()
    ctx.state.pancakeService.runAsyncTask()
}