"use strict";

const logger = require('logger')(module)
const Router = require('koa-router');
const internalAPI = new Router({
    prefix: '/api'
});

const Secret = "1Ac0uGgbLLA6eUpkV4gh"

const { models, ErrorCodes, ModelsError } = require('models')
const { Phone, User, Visit, Event, Token } = models
const { eventType } = require('user_manager')

internalAPI.post('/modification', async function (ctx, next) {
    /*
    [
        {
            'Model': 'Phone',
            'Action': 'CreateOrUpdate',
            'Key': '3696054',
            'ActionID': 23,
            'Data': {
                'Param1': 'Value1',
                'Param2': 'Value2'
            }
        }
    ]
    */
    const availableModels = {'Phone': PhonesTracking}
    let successActionID = {'ActionID': []}
    let methods = ctx.request.body.filter((method)=>{if(Object.keys(availableModels).indexOf(method.Model) >= 0) {return true} else {return false}})
    for (let method of methods){
        try {
            let model = availableModels[method.Model]
            if (method.Action == 'GetAll'){
                if (!successActionID[method.ActionID]){
                    successActionID[method.ActionID] = []
                }
                let result = JSON.stringify(model.findAll({attributes: model.attributesInternalAPI(), include: model.includeInternalAPI()}))
                successActionID[method.Action][method.Model] = result
                successActionID.ActionID.push(method.ActionID)
            }
        } catch (e){
            logger.error(`Error execute method in Internal API ${JSON.stringify(method)}`)
            logger.error(e)
        }
    }
    ctx.type = 'application/json'
    ctx.body = successActionID
})


module.exports = { internalAPI }