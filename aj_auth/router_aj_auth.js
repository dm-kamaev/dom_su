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
// responce
// {
//   "ok": true,
//   "data": {
//     "clientPhone": {
//       "ok": true,
//       "data": "4957899010"
//     },
//     "applicantPhone": {
//       "ok": false,
//       "data": "Over the phones"
//     }
//   }
// }
// {
//   "ok": false,
//   "error": {
//     "code": -6,
//     "text": "Not need tracking"
//   }
// }

router.get('/aj/calltracking', async function (ctx) {
  const user = ctx.state.pancakeUser;
  let client_phone;
  let applicant_phone;

  if (user.checkTrackNeed()) {
    user.setTrackWaiting(true);
    client_phone = await user.set_track_number_for_client();
    applicant_phone = await user.set_track_number_for_applicant();
    ctx.status = 200;
    ctx.body = {
      ok: true,
      data: {
        clientPhone: get_wrap(client_phone),
        applicantPhone: get_wrap(applicant_phone),
      }
    };
  } else {
    ctx.status = 200;
    ctx.body = {
      ok: true,
      data: {
        clientPhone: get_wrap2(user.get_track_number_for_client()),
        applicantPhone: get_wrap2(user.get_track_number_for_applicant()),
      }
    };
    user.setTrackWaiting(false);
  }

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
  return phone.replace(/^\+/, '').replace(/^8{1}/, '').replace(/^7{1}/, '');
}


function get_wrap(data) {
  if (data instanceof Error) {
    return {
      ok: false,
      data: data.message
    }
  } else {
    return {
      ok: true,
      data: format_phone(data)
    }
  }
}


function get_wrap2(data) {
  if (!data) {
    return {
      ok: false,
      data: 'Not need tracking'
    }
  } else {
    return {
      ok: true,
      data: format_phone(data)
    }
  }
}

// first visit
// |
// V go the base


// second visit
// |
// V
// check in db || return track ||

