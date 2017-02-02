"use strict";

const Router = require('koa-router');
const internalAPI = new Router({
    prefix: '/api'
});

const { models, ErrorCodes, ModelsError } = require('models')
const { Phone } = models

internalAPI.post('/modification', async function (ctx, next) {
    const availableModels = {'Phone': Phone}
})