'use strict';

// LOG INPUT REQEUST FOR AUTH USER

const logger_for_auth_user = require('/p/pancake/lib/logger_for_auth_user.js');
const time = require('/p/pancake/my/time.js');

module.exports = async function (ctx, next) {
  await logger_for_auth_user.init(ctx);
  const sep = ' | ';
  const state = ctx.state || {};
  const user = state.pancakeUser || {};
  const context = state.context;
  const request = ctx.request;

  const text = [
    time.format('[YYYY/MM/DD hh:mm:ss]'),
    user.uuid,
    context.get('hit_id'),
    request.method,
    request.url,
    JSON.stringify(request.body),
    JSON.stringify(request.cookies),
    JSON.stringify(request.headers),
  ].join(sep);

  logger_for_auth_user.log(text);
  await next();
};