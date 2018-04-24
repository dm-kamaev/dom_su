'use strict';

// MIDDLEWARe GOR HANDLER ERROR

const { getTemplate, loadTemplate } = require('utils');
const logger = require('/p/pancake/lib/logger.js');
const json = require('/p/pancake/my/json.js');
const AuthApi = require('/p/pancake/auth/authApi.js');
const Aj_error_internal = require('/p/pancake/errors/Aj_error_internal.js');
const staff_utils = require('/p/pancake/staff/utils.js');
const templates = require('/p/pancake/utils/templates.js');

let template404Opt = {
  path: 'templates/error/404.html',
  name: 'E404'
};

let template500Opt = {
  path: 'templates/error/500.html',
  name: 'E500'
};

loadTemplate(template404Opt);
loadTemplate(template500Opt);


async function errorMiddleware(ctx, next) {
  try {
    await next();
  } catch (err) {
    let errorHtml;
    if (err.status === 404) {
      logger.log('Not found 404 ' + err);
      //logger.error(`404 Path ${ctx.request.href} ${(ctx.headers.referer) ? '| referer ' + ctx.headers.referer : '' } `)
      ctx.type = 'text/html';
      ctx.status = 404;
      errorHtml = getTemplate(template404Opt);
      ctx.body = errorHtml(ctx.proc({}));
    } else {
      const url = ctx.request.url;
      const authApi = new AuthApi(ctx);
      // employee or client-employee
      if (await authApi.isLoginAsClientEmployee()) {
        await if_error_in_employee_pa(ctx, err, authApi.get_auth_data());
      // other: client or no auth
      } else {
        if (await authApi.isLoginAsClient()) {
          logger.warn('auth as client url="'+url+'" auth_data='+json.str(authApi.get_auth_data())+' '+err.stack);
        } else {
          logger.warn('url="'+url+'" '+err.stack);
        }
        ctx.type = 'text/html';
        ctx.status = 500;
        errorHtml = getTemplate(template500Opt);
        ctx.body = errorHtml(ctx.proc({}));
      }
    }
  }
}


// в личном кабинете сотрудника
// auth_data –– { uuid: 'user uuid', cleint_id: uuid, employee_id: uuid, token: uuid }
async function if_error_in_employee_pa(ctx, err, auth_data) {
  const url = ctx.request.url;
  const str_auth_data = json.str(auth_data);
  // if ajax method
  if (/^\/aj/.test(url)) {
    const { status, body } = new Aj_error_internal();
    ctx.status = status;
    ctx.body = body;
    logger.warn(err.stack+'\nAJAX FAILED url="'+url+'" auth_data='+str_auth_data+' ');
    // if html page
  } else {
    let name_template;
    // по идее еще надо проверит,что url начинается со /staff
    // а то клиент-сотрудник может оказаться в этой секции
    if (staff_utils.isMobileVersion(ctx)) {
      logger.warn(err.stack+'\nEMPLOYEE_PA MOBILE PAGE FAILED url="'+url+'" auth_data='+str_auth_data+' ');
      name_template = staff_utils.get_template('mobile', 'error');
    } else {
      logger.warn(err.stack+'\nEMPLOYEE_PA DESKTOP PAGE FAILED url="'+url+'" auth_data='+str_auth_data+' ');
      name_template = staff_utils.get_template('desktop', 'error');
    }
    ctx.type = 'text/html';
    ctx.status = 500;
    const templateCtx =  {
      itIsMe: !ctx.params.EmployeeID || ctx.params.EmployeeID == auth_data.employee_id,
      employeeId: ctx.params.EmployeeID || auth_data.employee_id,
      clientId: auth_data.client_id,
      selfId: auth_data.employee_id,
      mobileDevice: ctx.userAgent.isMobile,
    };
    ctx.body = templates.getTemplate(name_template)(ctx.proc(templateCtx, ctx));
  }
}


module.exports = {errorMiddleware: errorMiddleware};

