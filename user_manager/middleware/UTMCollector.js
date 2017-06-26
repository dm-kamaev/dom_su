"use strict";

const UTMS_NAME = ['utm_medium', 'utm_source', 'utm_campaign', 'utm_term', 'utm_content']

async function UTMCollector(ctx, next) {
    let UTM = {}
    // Google UTMS
    if (ctx.query.campaignid){
        UTM['utm_medium'] = 'cpc'
        UTM['utm_source'] = 'google'
        UTM['utm_campaign'] = ctx.query.campaignid
        if (ctx.query['utm_term']){
            UTM['utm_term'] = ctx.query['utm_term']
        }
        if (ctx.query['utm_content']){
            UTM['utm_content'] = ctx.query['utm_content']
        }
    } else {
        for (let name of UTMS_NAME){
            if (ctx.query[name]){
                UTM[name] = ctx.query[name]
            }
        }
    }
    if (Object.keys(UTM).length !== 0){
        ctx.state.pancakeUser.saveUTMS(UTM)
    }
    await next()
}

module.exports = {
    UTMCollector
}