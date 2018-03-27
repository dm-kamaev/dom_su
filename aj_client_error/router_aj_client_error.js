#!/usr/local/bin/node

'use strict';

// CLIENT LOGGER FOR vue client_pa

const Router = require('koa-router');
const AuthApi = require('/p/pancake/auth/authApi.js');
const logger_vue_client_pa = require('/p/pancake/lib/logger_vue_client_pa.js');

const router = module.exports = new Router();

router.post('/aj/log_error_client_pa', async function (ctx) {
  const body = ctx.request.body;
  const headers = ctx.request.headers;
  logger_vue_client_pa.warn({
    headers,
    body: body,
  });
  ctx.status = 200;
});
