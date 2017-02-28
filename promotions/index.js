"use strict";

const { promotionsRouter } = require('./router')
const { checkPromotionUrl } = require('./store')

module.exports = {
    promotionsRouter,
    checkPromotionUrl,
}