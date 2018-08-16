'use strict';

const Router = require('koa-router');
const internalServiceAPI = new Router();
const logger = require('/p/pancake/lib/logger.js');
const json = require('/p/pancake/my/json.js');

const { Phone } = require('models').models;

module.exports = { internalServiceAPI };

const hash_category_type = {
  client: 'client',
  applicant: 'applicant',
};

// request from 1C
// POST /service/modification
// http hedader {
//  x-dom-service: true
// }

// general structure
// [{
//   Action: 'CreateOrUpdate',
//   Model: 'Phone',
//   ActionID: 1,
//   Key: '3696054', // optional param, if exist then update else create
//     Data: {
//     number: '79153983012',
//     active: true,
//     city: 'spb' || 'nn' || 'moscow'
//     CategoryType: 'client' || 'applicant'
//   }
// }]

// exmaple update –– [
// [
//   {
//     "Action": "CreateOrUpdate",
//     "Model": "Phone",
//     "ActionID": 1,
//     "Key": "427",
//     "Data": {
//       "number": "74957880921",
//       "active": true,
//       "city": "moscow",
//       "CategoryType": "client"
//     }
//   }
// ]
// example create ––
// [
//   {
//     "Action": "CreateOrUpdate",
//     "Model": "Phone",
//     "ActionID": 1,
//     "Data": {
//       "number": "7495666666666",
//       "active": true,
//       "city": "nn",
//       "CategoryType": "applicant"
//     }
//   }
// ]
internalServiceAPI.post('/service/modification', async function (ctx) {
  const availableModels = { Phone };
  const successActionID = {'ActionID': []};
  let methods = ctx.request.body.filter((method) => {
    if (Object.keys(availableModels).indexOf(method.Model) >= 0) {
      return true;
    } else {
      return false;
    }
  });
  for (let method of methods) {
    try {
      let model = availableModels[method.Model];
      const action = method.Action;

      // get list all phone from table phones
      if (action == 'GetAll') {
        if (!successActionID[action]) {
          successActionID[action] = {};
        }
        let result = await model.findAll({
          attributes: model.attributesInternalAPI(),
          include: model.includeInternalAPI()
        });
        let formatResult = model.formatResultIntenralAPI(result);
        successActionID[action][method.Model] = formatResult;
        successActionID.ActionID.push(method.ActionID);
        continue;
      }

      // create or update data about phone
      if (action == 'CreateOrUpdate') {
        const data = method.Data;
        let item = null;
        if (method.Key !== false) {
          let where = {};
          where[model.primaryKeyField] = method.Key;
          item = await model.findOne({
            where
          });
        }
        // rename field
        data.category_type = data.CategoryType;
        // TODO: remove in future, when 1с will send category_type
        // |
        // |
        // V
        // if (!data.category_type) {
        //   data.category_type = hash_category_type.client;
        // }
        if (!hash_category_type[data.category_type]) {
          throw new Error_internal_service_api_error(`'${data.category_type}' is not valid. Valid list: ${Object.keys(hash_category_type).join(', ')}`);
        }
        if (item == null) { // create phone
          await model.createInternalAPI(data);
          successActionID.ActionID.push(method.ActionID);
        } else { // update phone
          await item.updateInternalAPI(data);
          successActionID.ActionID.push(method.ActionID);
        }
        continue;
      }

      // delete phone form table
      if (action == 'Delete') {
        let where = {};
        where[model.primaryKeyField] = method.Key;
        model.destroy({
          where
        });
        successActionID.ActionID.push(method.ActionID);
      }

    } catch (error) {
      logger.warn(`execute method in Internal API ${json.str(method)} ${error.stack}`);
    }
  }
  ctx.type = 'application/json';
  ctx.body = successActionID;
});


class Error_internal_service_api_error extends Error {
  constructor(msg) {
    super(msg);
  }
}