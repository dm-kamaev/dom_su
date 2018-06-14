'use strict';

// AJAX ROUTER FOR WORK WITH AUTH

const Router = require('koa-router');
const AuthApi = require('/p/pancake/auth/authApi.js');
const logger = require('/p/pancake/lib/logger.js');
const Aj_error_phone_for_calltracking = require('/p/pancake/errors/Aj_error_phone_for_calltracking.js');

const router = module.exports = new Router();
// 5.101.61.62

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

// GET /aj/calltracking
// responce –– {
//   ok: true,
//   data: {
//     clientPhone: '74957893224',
//     applicantPhone: '7495666666666'
//   }
// }
router.get('/aj/calltracking', async function (ctx) {
  let client_phone;
  let applicant_phone;

  const user = ctx.state.pancakeUser;
  const track_need = user.checkTrackNeed();
  if (track_need) {
    user.setTrackWaiting(true);
    client_phone = await user.set_track_number_for_client();
    applicant_phone = await user.set_track_number_for_applicant();
  } else {
    user.setTrackWaiting(false);
  }

  let status;
  let body;
  if (!track_need) {
    const aj_error = new Aj_error_phone_for_calltracking('Not need tracking');
    status = aj_error.status;
    body = aj_error.get_body();
  } else if (client_phone instanceof Error || applicant_phone instanceof Error) {
    const error = client_phone instanceof Error ? client_phone : applicant_phone;
    const aj_error = new Aj_error_phone_for_calltracking(error.message);
    status = aj_error.status;
    body = aj_error.get_body();
  } else {
    status = 200;
    body = {
      ok: true,
      data: {
        clientPhone: format_phone(client_phone),
        applicantPhone: format_phone(applicant_phone),
      }
    };
  }

  ctx.status = status;
  ctx.body = body;

  logger.info(ctx.body);
});


/**
 * format_phone:
 * @param  {String | Number} phone +79069234132 || 89069234132
 * @return {String} 9069234132
 */
function format_phone(phone) {
  phone = phone+'';
  // order is imortant
  return phone.replace(/^8{1}/, '').replace(/\+7/, '');
}

