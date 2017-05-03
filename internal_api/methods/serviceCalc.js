"use strict";
const { SingleRequest1C } = require('api1c')
const uuid4 = require('uuid/v4')


async function GetDate(ctx) {

    let param = ctx.request.body.Param || {}
    //param.city = 'moscow'
    param.city = ctx.state.pancakeUser.city.keyword
    let singleRequest = new SingleRequest1C('Common.GetTimeInfo', param)
    let response1C = await singleRequest.do()
    ctx.body = {
        "Data": {
            "date": response1C.date,
            "timezone": response1C.timezone
        },
        'Success': true
    }
}

module.exports = {
    GetDate,
}