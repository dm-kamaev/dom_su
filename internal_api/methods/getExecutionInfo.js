"use strict";
const { SingleRequest1C } = require('api1c')

async function GetExecutionInfo(ctx) {
    let param = ctx.request.body.Param
    param.city = ctx.state.pancakeUser.city.keyword
    let singleRequest = new SingleRequest1C('Client.GetExecutionInfo', param, null, ctx.state.pancakeUser.uuid)
    let response1C = await singleRequest.do()
    ctx.body = {
        'Data': response1C.data,
        'Success': true
    }
}

module.exports = {
    GetExecutionInfo
}