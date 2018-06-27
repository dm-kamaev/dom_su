'use strict';
const { models } = require('models');
const { ShortUrl } = models;
const Router = require('koa-router');
const logger = require('/p/pancake/lib/logger.js');
const promise_api = require('/p/pancake/my/promise_api.js');
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

serviceShortUrlRouter.post('/short_urls/rest/generate', async function (ctx) {
  const body = ctx.request.body;
  try {
    if (!body.Url){
      ctx.body = {
        Result: false
      };
      return;
    }

    let key = randomAsciiString(6);
    let searchFreeKey = true;
    let count_try = 0;
    await promise_api.while(function () {
      return searchFreeKey === true;
    }, async function() {
      let tempShortUrl = await ShortUrl.findOne({
        where: {
          key
        }
      });
      if (tempShortUrl) {
        logger.info(`SHORT URL generate an existing key ${key}, try=${count_try++}`);
      } else {
        searchFreeKey = false;
      }
    });

    // while (searchFreeKey){
    //   let tempShortUrl = await ShortUrl.findOne({
    //     where: {
    //       key
    //     }
    //   });
    //   if (tempShortUrl){
    //     logger.warn(`SHORT URL generate an existing key ${key}`);
    //   } else {
    //     searchFreeKey = false;
    //   }
    // }
    await ShortUrl.create({
      url: body.Url,
      key,
      data: JSON.stringify(body.Data)
    });
    ctx.body = {
      Result: true,
      Key: key,
      ShortUrl: `https://${config.serverPath.domain.default}/s/${key}`
    };
  } catch (error){
    logger.warn(error);
    ctx.status = 500;
    ctx.body = {
      Result: false
    };
  }
});

module.exports = {
  serviceShortUrlRouter
};