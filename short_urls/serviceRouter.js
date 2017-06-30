'use strict'
const { models, ErrorCodes, ModelsError } = require('models')
const { ShortUrl } = models
const Router = require('koa-router');
const logger = require('logger')(module)
const config = require('config');

const serviceShortUrlRouter = new Router();
var crypto = require('crypto');

/** Sync */
function randomString(length, chars) {
  if (!chars) {
    throw new Error('Argument \'chars\' is undefined');
  }

  var charsLength = chars.length;
  if (charsLength > 256) {
    throw new Error('Argument \'chars\' should not have more than 256 characters'
      + ', otherwise unpredictability will be broken');
  }

  var randomBytes = crypto.randomBytes(length);
  var result = new Array(length);

  var cursor = 0;
  for (var i = 0; i < length; i++) {
    cursor += randomBytes[i];
    result[i] = chars[cursor % charsLength];
  }

  return result.join('');
}

/** Sync */
function randomAsciiString(length) {
  return randomString(length,
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
}

serviceShortUrlRouter.post('/short_urls/rest/generate', async function (ctx, next) {
    try {
        if (!ctx.request.body.Url){
            ctx.body = {Result: false}
            return
        }
        let key = randomAsciiString(6)
        let searchFreeKey = true
        while (searchFreeKey){
            let tempShortUrl = await ShortUrl.findOne({where: {key: key}})
            if (tempShortUrl){
                logger.error(`SHORT URL generate an existing key ${key}`)
            } else {
                searchFreeKey = false
            }
        }
        logger.info({url: ctx.request.body.Url.toString(), key: key.toString(), data: JSON.stringify(ctx.request.body.Data)})
        let shortUrl = await ShortUrl.create({url: ctx.request.body.Url, key: key, data: JSON.stringify(ctx.request.body.Data)})
        ctx.body = {Result: true, Key: key, ShortUrl: `https://${config.serverPath.domain.default}/s/${key}`}
    } catch (e){
        logger.error(e)
        ctx.body = {Result: false}
    }
})

module.exports = {
    serviceShortUrlRouter
}