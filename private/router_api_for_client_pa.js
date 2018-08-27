'use strict';

const Router = require('koa-router');
// const CONF = require('/p/pancake/settings/config.js');
const qs = require('querystring');
// const wf = require('/p/clientPA/my/wf.js');
// const mstch = require('mustache');
// const time = require('/p/clientPA/my/time.js');
const logger = require('/p/pancake/lib/logger.js');
const AuthApi = require('/p/pancake/auth/authApi.js');
const Magic_url = require('/p/pancake/private/Magic_url.js');
// const Request1Cv3 = require('/p/pancake/api1c/request1Cv3.js');
const Action_link = require('/p/pancake/private/mongo_models/Action_link.js');

const router_api = module.exports = new Router({
  prefix: '/api'
});

// /api/quick_auth
// request –– {
//   "client_id": "6ed99ac9-9657-11e2-beb6-1078d2da50b0", // optional
//   "employee_id": "f82270ac-e9b0-11e5-80de-00155d594900", //optional
// }
// responce error –– {
//   "success": false,
//   "error": "Not valid request body: {}"
// }
// responce success –– {
//   "success": true,
//   "data": {
//     "link": "/private/set_cookies/?action=qa&u_uuid=ee91b57d-f9fb-4f76-a78c-f03a81cc9ac3&session_uid_dom_dev=ee91b57d-f9fb-4f76-a78c-f03a81cc9ac3&A=ee91b57d-f9fb-4f76-a78c-f03a81cc9ac3LIamcspfjB1516263739720&B=ae7b122a4f9df6f552584aa4083607a6fa3eebf8abad25594020883b77284fd1e3773eb0eef178519d7e449a71a8e36100c841fef0ed79e811a535a504e5815d&status=2"
//   }
// }
// ВАЖНО, для выставить:
//  пользователь должен хотя бы раз авторизоваться
//  если переключил базу 1С, то надо заново авторизоваться в ручную, ибо invalid token
router_api.post('/quick_auth', check_access, async function(ctx){
  const authApi = new AuthApi(ctx);
  const body = ctx.request.body;
  const { client_id, employee_id } = body || {};
  try {
    if (client_id || employee_id) {
      const cookie = (employee_id) ? await authApi.login_by_employee_id(employee_id) : await authApi.login_by_client_id(client_id);
      if (cookie instanceof Error) {
        throw cookie;
      }
      const link = '/private/set_cookies/?action=qa&' + Object.keys(cookie).map(name => `${name}=${qs.escape(cookie[name])}`).join('&');
      ctx.status = 200;
      ctx.body = {
        success: true,
        data: {
          link,
        }
      };
    } else {
      logger.warn('Not valid request body: '+JSON.stringify(body));
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: 'Not valid request body: ' + JSON.stringify(body)
      };
    }
  } catch (err) {
    logger.warn(err);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Internal error',
    };
  }
});


// request ---
// {
//   "action": {
//     "Сообщение": "\"¦ref¦46c58fc3-cfbf-47b5-8d52-ca19a21bc640÷4781×81e3073ecde09a8c49a63cfadfb948f5¦\"",
//     "ИдентификаторОтписки": "7e497071-e163-4181-895b-9ff647789ece",
//     "Контакт": "\"¦ref¦fe4a54a4-c11a-4b32-83e4-94332dc968b0÷35×80e400155d59490011e6c6bb8ae77c1d¦\"",
//     "Подписчик": "\"¦ref¦5515dced-1066-4436-b377-6c5bd5b05e6c÷33×80e400155d59490011e6c6bac424bc57¦\"",
//     "ВидУведомления": "\"¦ref¦310eec49-7cda-4bbe-bc07-b0c6ab86f481÷5498×80e200155d59490011e65d9ea5f76d16¦\"",
//     "action": "unsubscribe"
//   },
//   "content": "<h1>Вы успешно отписались от рассылки</h1>",
//   "headers": "<title>Вы успешно отписались от рассылки</title>"
// }
// responce ––
// {
//   "success": true,
//   "data": {
//     "url": "https://www.domovenok.su/action/46870466f1aa4145a45a0e2c9244792c"
//   }
// }
router_api.post('/action_link', check_access, async function(ctx){
  const body = ctx.request.body;
  try {
    const key = await Action_link.generate(body.content, JSON.stringify(body.action), body.headers);
    const fullActionLink = new Magic_url().getActionLink(key);
    ctx.status =200;
    ctx.body = {
      success: true,
      data: {
        url: fullActionLink
      }
    };
  } catch (err) {
    logger.warn(err);
    ctx.status = 200;
    ctx.body = {
      success: false,
      error: err.stack.toString()
    };
  }
});



async function check_access(ctx, next) {
  if (ctx.request.headers.authorization === 'Bearer 1FGf34hYZ5L2EgXBdpip8QJhKxPIEscBSuEilpmu') {
    await next();
  } else {
    ctx.status = 404;
  }
}
