'use strict';

// AJAX ROUTER FOR WORK WITH AUTH

const Router = require('koa-router');
const AuthApi = require('/p/pancake/auth/authApi.js');
const logger = require('/p/pancake/lib/logger.js');

const router = module.exports = new Router();


// logout
// GET /aj/logout
router.get('/aj/logout', async function (ctx) {
  new AuthApi(ctx).logout();
  ctx.status = 200;
  ctx.body = {
    ok: true,
    data: {
      Result: true
    }
  };
});