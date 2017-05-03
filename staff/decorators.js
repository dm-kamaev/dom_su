'use strict';
const { staffUrl } = require('./utils')
const { Method1C, Request1C } = require('api1c')

function getEmployeeHeader(routerFunc) {
    return async function (ctx, next) {
        const request1C = new Request1C(ctx.state.pancakeUser.token.token, '', '', true);
        const GetEmployeeData = new Method1C('GetEmployeeData', {EmployeeID: ctx.params.EmployeeID || ctx.state.pancakeUser.token.employee_uuid});
        request1C.add(GetEmployeeData)
        let templateCtx = {
            itIsMe: !ctx.params.EmployeeID || ctx.params.EmployeeID == ctx.state.pancakeUser.token.employee_uuid,
            employeeId: ctx.params.EmployeeID || ctx.state.pancakeUser.token.employee_uuid,
            selfId: ctx.state.pancakeUser.token.employee_uuid,
            mobileDevice: ctx.userAgent.isMobile
        }
        await routerFunc(ctx, next, request1C, GetEmployeeData, templateCtx)
    }
}

function loginRequired(routerFunc) {
    return async function (ctx, next) {
        if (await ctx.state.pancakeUser.getToken() != null){
            await routerFunc(ctx,next)
        } else {
            ctx.status = 302
            ctx.redirect(staffUrl('login'))
        }
    }
}

module.exports = {
    loginRequired,
    getEmployeeHeader
}