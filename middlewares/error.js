'use strict';
const fs = require('fs-promise')
const logger = require('logger')(module)


async function errorMiddleware(ctx, next) {
        try {
            await next()
        } catch (err) {
            logger.error(err)
            if (err.status === 404) {
                ctx.type = 'text/html'
                ctx.status = 404
                ctx.body = await fs.readFile('templates/error/404.html')
            } else {
                ctx.type = 'text/html'
                ctx.status = 500
                ctx.body = await fs.readFile('templates/error/500.html')
            }
        }
}

module.exports = {errorMiddleware: errorMiddleware}

