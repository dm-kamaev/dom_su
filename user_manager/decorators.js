'use strict';

function validateActionToken(typeAction, func, elseFunc) {
  return async function (ctx, next) {
    let access = await ctx.state.pancakeUser.checkActionToken(typeAction, ctx.query.action_token);
    if (access){
      return await func(ctx, next);
    } else {
      return await elseFunc(ctx, next);
    }
  };
}

function onlyUser(middleware) {
  return async function (ctx, next) {
    if (ctx.state.requestType.user){
      await middleware(ctx, next);
    } else {
      await next();
    }
  };
}

function onlyService(middleware) {
  return async function (ctx, next) {
    if (ctx.state.requestType.service){
      await middleware(ctx, next);
    } else {
      await next();
    }
  };
}

module.exports = {
  onlyUser,
  onlyService,
  validateActionToken,
};