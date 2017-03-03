"use strict";

const logger = require('logger')(module)
const Router = require('koa-router');
const internalAPI = new Router();

const Secret = "1Ac0uGgbLLA6eUpkV4gh"

const { models, ErrorCodes, ModelsError } = require('models')
const { Phone } = models

internalAPI.post('/service/modification', async function (ctx, next) {
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
    const availableModels = {'Phone': Phone}
    let successActionID = {'ActionID': []}
    let methods = ctx.request.body.filter((method)=>{if(Object.keys(availableModels).indexOf(method.Model) >= 0) {return true} else {return false}})
    for (let method of methods){
        try {
            let model = availableModels[method.Model]
            if (method.Action == 'GetAll'){
                if (!successActionID[method.Action]){
                    successActionID[method.Action] = {}
                }
                let result = await model.findAll({attributes: model.attributesInternalAPI(), include: model.includeInternalAPI()})
                let formatResult = model.formatResultIntenralAPI(result)
                successActionID[method.Action][method.Model] = formatResult
                successActionID.ActionID.push(method.ActionID)
                continue
            } if (method.Action == 'CreateOrUpdate'){
                let item = null;
                if (method.Key !== false){
                    let where = {}
                    where[model.primaryKeyField] = method.Key
                    item = await model.findOne({where:where})
                }
                if (item == null){
                    await model.createInternalAPI(method.Key, method.Data)
                    successActionID.ActionID.push(method.ActionID)
                } else {
                    await item.updateInternalAPI(method.Data)
                    successActionID.ActionID.push(method.ActionID)
                }
                continue
            } if (method.Action == 'Delete'){
                let where = {}
                where[model.primaryKeyField] = method.Key
                model.destroy({where:where})
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