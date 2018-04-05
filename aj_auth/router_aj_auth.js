'use strict';

// AJAX ROUTER FOR WORK WITH AUTH

const Router = require('koa-router');
const AuthApi = require('/p/pancake/auth/authApi.js');
const logger = require('/p/pancake/lib/logger.js');

const router = module.exports = new Router();

// check user is login or not
// GET /aj/logged_in
/* return ––
{
  "ok": true,
  "data": {
    loggedIn: true
  }
}*/
router.get('/aj/logged_in', async function (ctx) {
  try {
    const authApi = new AuthApi(ctx);
    const loggedIn = await authApi.isLoginAsClient() || await authApi.isLoginAsClientEmployee();
    ctx.status = 200;
    ctx.body = {
      ok: true,
      data: {
        loggedIn
      }
    };
  } catch (err) {
    logger.warn(err);
    ctx.status = 200;
    ctx.body = {
      ok: false,
      error: {
        code: -2,
        text: 'Internal error',
      }
    };
  }
});


// logout
// GET /aj/logout
router.get('/aj/logout', async function (ctx) {
  try {
    new AuthApi(ctx).logout();
    ctx.status = 200;
    ctx.body = {
      ok: true,
      data: null
    };
  } catch (err) {
    logger.warn(err);
    ctx.status = 200;
    ctx.body = {
      ok: false,
      error: {
        code: -2,
        text: 'Internal error',
      }
    };
  }
});