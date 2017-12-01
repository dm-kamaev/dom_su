'use strict';
let http = require('http');
let querystring = require('querystring');
// let log = require('logger')(module, 'staff.log')
let errors = require('./errors')
const config = require('config')
const uap = require('node-uap');
const logger = require('/p/pancake/lib/logger.js');

// const NODE_ENV = process.env.NODE_ENV;
let server = config.api1C;

module.exports = class Request1Cv3 {

  // option? –– { ip, userAgent, oldAPI }
  constructor(token, userUUID, option){
    let { ip, userAgent, oldAPI } = option || {};
    userUUID = userUUID || null
    oldAPI = oldAPI || false
    this.methods = [];
    this.response = null;
    this.token = token
    const {ua, os, device, userAgent: Original } = uap.parse(userAgent);
    this.ip = ip
    this.userAgent = userAgent
    this.body = {
      Methods: [],
      user_id: userUUID,
      Token: token,
      ClientData: {
          IP: ip,
          UserAgent: {
              "Original": Original,
              "Soft": ua,
              "OS": os,
              "Device": device
          }
      }
    };
    this.connectParam = {
      hostname: server.ip,
      port: server.port,
      path: (oldAPI) ? server.oldAPI : server.url,
      method: 'POST',
      headers: {
          'Content-type': "application/json",
          'Authorization': 'Basic ' + new Buffer('site' + ':' + 'asASDFdfs23').toString('base64')
      }
    };
  }

  routing_response() {
    // console.log('BEFORE this.response = ', this.response);
    this.response.forEach((item) => {
        if (!item.ErrorCode) {
          this.methods[item.ActionID].response = item.Data
        } else
          this.methods[item.ActionID].error = {
            code: item.ErrorCode,
            text: item.ErrorText
          }
      })
      // console.log('AFTER this.response =', this.response);
  }


  add(methodName, data) {
    const dataFor1C = createTemplateForData(methodName, data);
    const count = this.methods.length;
    this.methods.push(dataFor1C);
    this.body.Methods.push({
      "Method": dataFor1C.name,
      "Param": dataFor1C.param,
      "ActionID": count,
    });
    return this;
  }


  do() {
    logger.info('Request1C request => \n' + JSON.stringify(this.body, null, 2));
    this.body = JSON.stringify(this.body);

    // log.debug('\n --- start request\n', this.body, '\n --- end request');
    this.connectParam.headers['Content-length'] = Buffer.from(this.body).length;
    let response_json = "";

    let promiseRequest = new Promise((reslove, reject) => {
      let startDateRequest = Date.now();
      let req = http.request(this.connectParam, (res) => {
        res.setEncoding('utf8')
        res.on('data', (chunk) => {
          response_json += chunk
        });
        res.on('end', () => {
          let endDate = Date.now();
          // log.debug('\n --- start response\n', response_json, '\n --- end response', '\nRequest Time -', Date.now() - startDateRequest, 'ms')
          try {
            const for_log = ((response_json) ? JSON.parse(response_json) : '');
            logger.info('Request1C response => \n ' + JSON.stringify(for_log, null, 2));
            this.response = JSON.parse(response_json)
          } catch (e) {
            reject(e)
            logger.warn(response_json);
            // log.error('Parse JSON error response - ', response_json)
            return
          }
          this.routing_response()
          reslove(this.response);
        });
      })
      req.setTimeout(1000 * 20, function() {
        reject(new errors.API1CError('The request ended in failure', this.token, 'Timeout response', 500));
      })
      req.on('error', (e) => {
        // log.error(e);
        logger.warn(e);
        reject(new errors.API1CError('The request ended in failure', this.token, 'The request ended in failure', 500));
      })
      req.write(this.body);
      req.end();
    })
    return promiseRequest;
  }

  // get result after request in 1C
  // response ––
  // [{
  //     "Data": {...},
  //     "Method": "Client.CalculateOrder",
  //     "ActionID": 0
  // }] OR
  // [{
  //     "ErrorText": "Invalid service ID",
  //     "Method": "Client.CalculateOrder",
  //     "ErrorCode": 43,
  //     "ActionID": 0
  // }]
  // return –– { "ok": true/false, "data": ..., "error": {"code": ..., "text": "..."}
  get() {
    const response = this.response;
    let res;
    try {
      const el = response[0];
      if (el.ErrorCode) {
        res = {
          ok: false,
          error: {
            code: el.ErrorCode,
            text: el.ErrorText,
          }
        };
      } else {
        res = {
          ok: true,
          data: el.Data,
        };
      }
    } catch (err) {
      // log.error(err)
      logger.warn(err);
      res = {
        ok: false,
        error: {
          code: -2,
          text: 'Internal error',
        }
      };
    }
    return res;
  }
};



// Wrapper for data for request to 1C
function createTemplateForData(name, param) {
  return {
    name: name,
    param: param,
    response: null,
    error: null,
  };
}


// function logger1C() {
//   // TODO: write in file
//   if (NODE_ENV === 'development') {
//     try {
//       if (arguments.length === 2) {
//         var a = arguments[0];
//         var b = arguments[1];
//         if (a instanceof Object) {
//           a = JSON.stringify(a, null, 2);
//         }
//         if (b instanceof Object) {
//           b = JSON.stringify(b, null, 2);
//         }
//         console.log(a, b);
//       } else {
//         var a = arguments[0];
//         if (a instanceof Object) {
//           a = JSON.stringify(a, null, 2);
//         }
//         console.log(a);
//       }
//     } catch (err) {
//       console.log('logger1C =', err);
//     }
//   }
// }