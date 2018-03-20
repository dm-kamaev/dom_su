'use strict';

// ПРОВЕРКА ЧТО ПОЛЬЗОВАТЕЛЬ АВТОРИЗОВАН

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
    const is_login_as_client = await authApi.isLoginAsClient();
    ctx.status = 200;
    ctx.body = {
      ok: true,
      data: {
        loggedIn: is_login_as_client
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
