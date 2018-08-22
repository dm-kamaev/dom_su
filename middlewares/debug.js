'use strict';

// Debug

const my_debug = require('../my/db2.js');

module.exports = async function(ctx, next) {
  console.log('HERE', ctx.request.headers);
  if (/^\/aj\/my_debug/.test(ctx.request.url) && ctx.request.headers['my-debug-id'] === '8efskwnwqUqp2038Mv_1') {
  // if (/^\/aj\/my_debug/.test(ctx.request.url)) {
    ctx.status = 200;
    ctx.body = await debug(ctx);
  } else {
    await next();
  }
}

async function debug(ctx) {
  return await my_debug.read(ctx.query.query);
}