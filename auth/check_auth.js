#!/usr/local/bin/node

'use strict';

// CHECK LOGIN

const AuthApi = require('/p/pancake/auth/authApi.js');
const logger = require('/p/pancake/lib/logger.js');

const check_auth = exports;

check_auth.ajax = function (routerFunc) {
  return async function(ctx, next) {
    const authApi = new AuthApi(ctx);
    let authData;
    const is_login = await authApi.isLoginAsClient() || await authApi.isLoginAsClientEmployee();
    if (is_login) {
      authData = authApi.getAuthData();
    }
    const user = ctx.state.pancakeUser;
    // auth1C –– {
    //   token: null,
    //   employee_uuid: null,
    //   client_uuid: null,
    //   uuid: null,
    //   model: null
    // }
    let auth1C = await user.getAuth1C();
    logger.log(' === loginRequiredWithoutRedirect === ');
    logger.log('ctx.state.pancakeUser.uuid = ' + user.uuid);
    logger.log('auth1C = ' + JSON.stringify(auth1C, null, 2));
    logger.log('authData= ', +JSON.stringify(authData, null, 2));
    logger.log('isLogint= '+is_login);
    await user.setAuth1C(authData);
    // if (!auth1C.token && authData) {
    //   await user.setAuth1C(authData);
    // }
    if (is_login && auth1C.token != null) {
      await routerFunc(ctx, next);
    } else {
      ctx.status = 200;
      ctx.body = {
        ok: false,
        error: {
          code: -3,
          text: 'Access denied',
        }
      };
    }
  };
};