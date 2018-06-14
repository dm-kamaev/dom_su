'use strict';

// AJAX ROUTER FOR WORK WITH AUTH

const Router = require('koa-router');
const AuthApi = require('/p/pancake/auth/authApi.js');
const logger = require('/p/pancake/lib/logger.js');
const Aj_error_no_phone_for_calltracking = require('/p/pancake/errors/Aj_error_no_phone_for_calltracking.js');

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


router.get('/aj/calltracking', async function (ctx) {
  const error = null;

  let client_phone;
  let applicant_phone;

  const user = ctx.state.pancakeUser;
  if (user.checkTrackNeed()) {
    user.setTrackWaiting(true);
    client_phone = await user.set_track_number_for_client();
    applicant_phone = await user.set_track_number_for_applicant();
  } else {
    user.setTrackWaiting(false);
  }

  if (client_phone instanceof Aj_error_no_phone_for_calltracking) {
    status = client_phone.status;
    body = error.get_responce();
  } else if (applicant_phone instanceof Aj_error_no_phone_for_calltracking) {
    status = applicant_phone.status;
    body = applicant_phone.get_responce();
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

