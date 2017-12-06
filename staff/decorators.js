'use strict';
const { staffUrl } = require('./utils');
const { Method1C, Request1C } = require('api1c');
const logger = require('/p/pancake/lib/logger.js');
const AuthApi = require('/p/pancake/auth/authApi.js');

const decorators = exports;

decorators.getEmployeeHeader = function(routerFunc) {
    return async function (ctx, next) {
        const request1C = new Request1C(ctx.state.pancakeUser.auth1C.token, ctx.state.pancakeUser.uuid, '', '', true);
        const GetEmployeeData = new Method1C('GetEmployeeData', {EmployeeID: ctx.params.EmployeeID || ctx.state.pancakeUser.auth1C.employee_uuid});
        request1C.add(GetEmployeeData)
        let templateCtx = {
            itIsMe: !ctx.params.EmployeeID || ctx.params.EmployeeID == ctx.state.pancakeUser.auth1C.employee_uuid,
            employeeId: ctx.params.EmployeeID || ctx.state.pancakeUser.auth1C.employee_uuid,
            clientId:  ctx.state.pancakeUser.auth1C.client_uuid,
            selfId: ctx.state.pancakeUser.auth1C.employee_uuid,
            mobileDevice: ctx.userAgent.isMobile,
        }
        await routerFunc(ctx, next, request1C, GetEmployeeData, templateCtx)
    }
};


decorators.loginRequired = function (routerFunc) {
    return async function (ctx, next) {
        const authApi = new AuthApi(ctx);
        let authData;
        logger.log(' === STAFF ===');
        const is_login_employee = await authApi.isLoginAsClientEmployee();
        logger.log('isLoginAsClientEmployee= '+await authApi.isLoginAsClientEmployee());
        if (is_login_employee) {
          authData = authApi.getAuthData();
        }
        const user = ctx.state.pancakeUser;
        let auth1C = await user.getAuth1C();
        if (!auth1C.token && authData) {
          await user.setAuth1C(authData);
        }
        if (is_login_employee && auth1C.token != null){
            await routerFunc(ctx, next);
        } else {
            ctx.status = 302;
            ctx.redirect(staffUrl('login'));
        }
    }
};


