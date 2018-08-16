'use strict';

// AJAX ROUTER FOR WORK WITH AUTH

const Router = require('koa-router');
const AuthApi = require('/p/pancake/auth/authApi.js');
const logger = require('/p/pancake/lib/logger.js');
// const Aj_error_phone_for_calltracking = require('/p/pancake/errors/Aj_error_phone_for_calltracking.js');
const logger_vue_client_pa = require('/p/pancake/lib/logger_vue_client_pa.js');

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
// router.get('/aj/calltracking', async function (ctx) {
//   const user = ctx.state.pancakeUser;
//   let client_phone;
//   let applicant_phone;

//   if (user._checkTrackNeed('v_id')) {
//     user.setTrackWaiting(true);
//     client_phone = await user.set_track_number_for_client();
//     applicant_phone = await user.set_track_number_for_applicant();
//     ctx.status = 200;
//     ctx.body = {
//       ok: true,
//       data: {
//         clientPhone: get_wrap(client_phone),
//         applicantPhone: get_wrap(applicant_phone),
//       }
//     };
//   } else {
//     ctx.status = 200;
//     ctx.body = {
//       ok: true,
//       data: {
//         clientPhone: get_wrap2(user.get_track_number_for_client()),
//         applicantPhone: get_wrap2(user.get_track_number_for_applicant()),
//       }
//     };
//     user.setTrackWaiting(false);
//   }

//   logger.info(ctx.body);
// });


// GET /aj/calltracking_client
// responce
// {
//   "ok": true,
//   "data": {
//      phone: '4957894810'
//   }
// }
// {
//   "ok": false,
//   "error": {
//     "text": "Over the phones"
//   }
router.get('/aj/calltracking_client', async function (ctx) {
  const user = ctx.state.pancakeUser;

  if (user.check_track_need_for_client()) {
    await user.setTrackWaiting(true);
    const client_phone = await user.set_track_number_for_client();
    ctx.status = 200;
    ctx.body = get_wrap(client_phone);
  } else {
    ctx.status = 200;
    ctx.body = get_wrap2(user.get_track_number_for_client());
    await user.setTrackWaiting(false);
  }

  logger.info(ctx.body);
});

// GET /aj/calltracking_applicant
// responce
// {
//   "ok": true,
//   "data": {
//    "applicantPhone": {
//       "ok": false,
//       "data": "Over the phones"
//     }
//   }
// }
// {
//   "ok": false,
//   "error": {
//     "text": "Not need tracking"
//   }
// }
router.get('/aj/calltracking_applicant', async function (ctx) {
  const user = ctx.state.pancakeUser;

  if (user.check_track_need_for_applicant()) {
    await user.set_track_waiting_applicant(true);
    const applicant_phone = await user.set_track_number_for_applicant();
    ctx.status = 200;
    ctx.body = get_wrap(applicant_phone);
  } else {
    ctx.status = 200;
    ctx.body = get_wrap2(user.get_track_number_for_applicant());
    await user.set_track_waiting_applicant(false);
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
  // order is important
  return phone.replace(/^\+/, '').replace(/^8{1}/, '').replace(/^7{1}/, '');
}

/**
 * get_wrap:
 * @param  {Object} data: { message: Number }
 * @return {Object}
 * {
    "ok": true,
    "data": {
      phone: "4957896228"
    }
  }
  {
    ok: false
    error: {
      text: 'Over the phones'
    }
  }
 */
function get_wrap(data) {
  if (data instanceof Error) {
    return {
      ok: false,
      error: {
        text: data.message
      }
    };
  } else {
    return {
      ok: true,
      data: {
        phone: format_phone(data)
      }
    };
  }
}

/**
 * get_wrap2: if  exist phone return or Not need tracking
 * @param  {Object} phone: String | Number
 * @return {Object}
 * {
    "ok": true,
    "data": {
      phone: "4957896228"
    }
  }
  {
    ok: false,
    error: {
      text: 'Not need tracking'
    }
  }
 */
function get_wrap2(phone) {
  if (!phone) {
    return {
      ok: false,
      error: {
        text: 'Not need tracking'
      }
    };
  } else {
    return {
      ok: true,
      data: {
        phone: format_phone(phone)
      }
    };
  }
}

// CLIENT LOGGER FOR vue client_pa
router.post('/aj/log_error_client_pa', async function (ctx) {
  const body = ctx.request.body;
  const headers = ctx.request.headers;
  logger_vue_client_pa.warn({
    headers,
    body: body,
  });
  ctx.status = 200;
});