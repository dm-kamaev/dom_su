'use strict';
const { PancakeUser } = require('../pancakeUser');


async function initPancakeUser(ctx, next) {
  ctx.state.pancakeUser = new PancakeUser(ctx);
  const user = ctx.state.pancakeUser;
  await ctx.state.pancakeUser.sync();
  await ctx.state.pancakeUser.set_in_cookie_user_uuid();
  await ctx.state.pancakeUser.getAuth1CTask();
  ctx.state.pancakeUser.setLastAction();

  await user.save_client_id();

  await next();

  ctx.state.pancakeUser.runAsyncTask();
}

module.exports = {initPancakeUser: initPancakeUser};