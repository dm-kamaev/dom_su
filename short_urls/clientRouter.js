'use strict'
const { models, ErrorCodes, ModelsError } = require('models')
const { ShortUrl } = models
const Router = require('koa-router');
const logger = require('logger')(module)

const clientShortUrlRouter = new Router();

clientShortUrlRouter.get('/s/:key', async function (ctx, next) {
    const shortUrl = await ShortUrl.findOne({where: {key: ctx.params.key}})
    if (shortUrl){
        if (shortUrl.data){
            let parseData = JSON.parse(shortUrl.data)
            if (parseData.Luid){
                ctx.state.pancakeUser.sendTicket('ClientConnect', {'luid': parseData.Luid})
            }
        }
        if (shortUrl.url && shortUrl.url.startsWith('e1c')){
            let iframe = `<iframe src="${shortUrl.url}"></iframe><script>close();</script>`
            ctx.type = 'text/html; charset=utf-8'
            ctx.body = `<html><head></head><body>${iframe}</body></html>`
        } else {
            ctx.status = 301
            ctx.redirect(shortUrl.url)
        }
    }
    await next()
})

module.exports = {
    clientShortUrlRouter
}