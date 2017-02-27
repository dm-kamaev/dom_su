'use strict';
const fs = require('fs-promise')
const logger = require('logger')(module)
const Handlebars = require('handlebars');
const { getTemplate, loadTemplate } = require('utils')

let template404Opt = {
    path: 'templates/error/404.html',
    name: 'E404'
}

let template500Opt = {
    path: 'templates/error/500.html',
    name: 'E500'
}

loadTemplate(template404Opt)
loadTemplate(template500Opt)


async function errorMiddleware(ctx, next) {
        try {
            await next()
        } catch (err) {
            logger.error(ctx.path)
            logger.error(err)
            let errorHtml
            if (err.status === 404) {
                ctx.type = 'text/html'
                ctx.status = 404
                errorHtml = getTemplate(template404Opt)
                ctx.body = errorHtml(ctx.proc({}))
            } else {
                ctx.type = 'text/html'
                ctx.status = 500
                errorHtml = getTemplate(template500Opt)
                ctx.body = errorHtml(ctx.proc({}))
            }
        }
}

module.exports = {errorMiddleware: errorMiddleware}

