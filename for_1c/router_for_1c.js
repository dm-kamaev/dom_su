'use strict';

const Router = require('koa-router');
const logger = require('/p/pancake/lib/logger.js');
const db = require('/p/pancake/my/db.js');
const Aj_error_access_denied = require('/p/pancake/errors/Aj_error_access_denied.js');
const Aj_error_not_valid_param = require('/p/pancake/errors/Aj_error_not_valid_param.js');
const Aj_error_internal = require('/p/pancake/errors/Aj_error_internal.js');

const router = module.exports = new Router();

// POST /for_1c/replace_client_id
// {
//   ClientID: uuid,
//   OldClientID: uuid,
// }
router.post('/for_1c/replace_client_id', is_from_1C, async function(ctx){
  const body = ctx.request.body;
  const { ClientID: client_id, OldClientID: client_id_old } = body;
  if (!client_id || !client_id_old) {
    const { body, status } = new Aj_error_not_valid_param('Not exist ClientID or OldClientID');
    ctx.status = status;
    ctx.body = body;
    return;
  }
  let res_update;
  res_update = await db.edit('UPDATE auth_data SET client_id=$1 WHERE client_id=$2 ', [ client_id, client_id_old ]);
  if (res_update instanceof Error) {
    const { body, status } = new Aj_error_internal();
    ctx.status = status;
    ctx.body = body;
    return;
  }
  res_update = await db.edit('UPDATE users SET last_client_id=$1 WHERE last_client_id=$2 ', [ client_id, client_id_old ]);
  if (res_update instanceof Error) {
    const { body, status } = new Aj_error_internal();
    ctx.status = status;
    ctx.body = body;
    return;
  }
  ctx.status = 200;
  ctx.body = {
    ok: true,
  };
});


// check request from 1C
async function is_from_1C(ctx, next) {
  if (ctx.request.headers.authorization === 'Bearer 1FGf34hYZ5L2EgXBdpip8QJhKxPIEscBSuEilpmu') {
    await next(ctx, next);
  } else {
    const { status, body } = new Aj_error_access_denied();
    ctx.status = status;
    ctx.body = body;
  }
}