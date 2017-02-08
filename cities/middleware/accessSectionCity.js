"use strict";
const { getUrlHost, getCityByDomain } = require('../utils')
const config = require('config')
const { models, ErrorCodes, ModelsError } = require('models');
const { User } = models;

let regexpString = '^(:?\\w+)' + '\\\.' + config.serverPath.domain.withoutCity.replace(/\./g,"\\\.") + '$'

let regexp = new RegExp(regexpString, 'g');


function needChangeCity(ctx) {
    let newCity = ctx.state.dom_user.city;
    if (getUrlHost(ctx.state.dom_user.city.keyword) != ctx.request.host){
        let match = regexp.exec(ctx.request.host)
        if (match === null) {
            newCity = ctx.cities.default
        } else {
            newCity = getCityByDomain(match[1])
        }
    }
    if (newCity !== ctx.state.dom_user.city){
        return { result: true, city: newCity}
    } else {
        return { result: false}
    }
}

async function accessSectionCity(ctx, next) {
    let needChange = needChangeCity(ctx)
    if (needChange.result == true){
        ctx.state.dom_user.city = needChange.city
        ctx.state.queue.push(async function () {
            let user = await User.findOne({where: {uuid: ctx.state.dom_user.user_uuid}})
            user.set('data.city', needChange.city.keyword);
            await user.save()
        })
    }
    await next();
}

module.exports = {
    accessSectionCity,
}