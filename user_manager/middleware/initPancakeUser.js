'use strict';
const { PancakeUser } = require('../pancakeUser')


async function initPancakeUser(ctx, next) {
    ctx.state.pancakeUser = new PancakeUser(ctx)
    await ctx.state.pancakeUser.sync()
    await ctx.state.pancakeUser.getAuth1CTask()
    ctx.state.pancakeUser.setLastAction()

    await next();

    ctx.state.pancakeUser.runAsyncTask()
}

module.exports = {initPancakeUser: initPancakeUser}