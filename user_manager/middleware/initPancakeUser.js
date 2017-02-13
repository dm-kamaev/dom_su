'use strict';
const { PancakeUser } = require('../pancakeUser')


async function initPancakeUser(ctx, next) {
    console.log(ctx.headers)
    ctx.state.pancakeUser = new PancakeUser(ctx)
    await ctx.state.pancakeUser.sync()

    await next();

    ctx.state.pancakeUser.runAsyncTask()
}

module.exports = {initPancakeUser: initPancakeUser}