'use strict';

const { getTemplate, loadTemplate } = require('utils');
const logger = require('/p/pancake/lib/logger.js');

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
      logger.warn(err);
      ctx.type = 'text/html';
      ctx.status = 500;
      errorHtml = getTemplate(template500Opt);
      ctx.body = errorHtml(ctx.proc({}));
    }
  }
}

module.exports = {errorMiddleware: errorMiddleware};

