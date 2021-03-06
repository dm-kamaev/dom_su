'use strict';

const http = require('http');
const errors = require('./errors');
const json = require('/p/pancake/my/json.js');
const uap = require('node-uap');
const detect_client_or_employee_method = require('/p/pancake/api1c/detect_client_or_employee_method.js');
const logger = require('/p/pancake/lib/logger.js');
const CONF = require('/p/pancake/settings/config.js');

const server = CONF.api1C;


module.exports = class Request1Cv3 {

  // option? –– { ip, userAgent, oldAPI }
  constructor(token, userUUID, option, ctx) {
    if (!ctx) {
      logger.warn('Incorrect call pancake Request1Cv3, without ctx');
    }
    let { ip, userAgent, oldAPI } = option || {};
    ctx = ctx || { state: {} };
    const app_version = ctx.state.app_version || null;
    const is_mobile = Boolean(ctx.state.is_mobile);
    userUUID = userUUID || null;

    if (!userUUID) {
      logger.warn(json.str({
        error: 'Not exist user_id '+userUUID,
        url: ctx.request.url,
        headers: ctx.request.headers
      }));
    }

    oldAPI = oldAPI || false;
    this.methods = [];
    this.response = null;
    this.token = token;
    const { ua, os, device, userAgent: Original } = uap.parse(userAgent);
    this.ip = ip;
    this.userAgent = userAgent;
    this.type_request = (is_mobile) ? 'app' : 'web';
    this.Type = this.type_request+'.client';
    this.body = {
      Methods: [],
      user_id: userUUID,
      Token: token,
      ClientData: {
        Type: this.Type,
        Version: app_version,
        IP: ip,
        UserAgent: {
          Original: Original,
          Soft: ua,
          OS: os,
          Device: device
        }
      }
    };
    this.connectParam = {
      hostname: server.ip,
      port: server.port,
      path: (oldAPI) ? server.oldAPI : server.url,
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        'Authorization': 'Basic ' + new Buffer('site' + ':' + 'asASDFdfs23').toString('base64')
      }
    };
  }

  routing_response() {
    // console.log('BEFORE this.response = ', this.response);
    this.response.forEach((item) => {
      if (!item.ErrorCode) {
        this.methods[item.ActionID].response = item.Data;
      } else
        this.methods[item.ActionID].error = {
          code: item.ErrorCode,
          text: item.ErrorText
        };
    });
    // console.log('AFTER this.response =', this.response);
  }


  add(methodName, data) {
    const dataFor1C = createTemplateForData(methodName, data);
    const count = this.methods.length;
    this.methods.push(dataFor1C);
    this.body.Methods.push({
      'Method': dataFor1C.name,
      'Param': dataFor1C.param,
      'ActionID': count,
    });
    this.body.ClientData.Type = this.type_request+'.'+detect_client_or_employee_method(dataFor1C.name);
    return this;
  }


  do() {
    const { hostname, port, path } = this.connectParam;
    logger.log(`${hostname} ${port} ${path}`);
    logger.info('Request1C request => \n' + JSON.stringify(this.body, null, 2));
    this.body = JSON.stringify(this.body);

    // log.debug('\n --- start request\n', this.body, '\n --- end request');
    this.connectParam.headers['Content-length'] = Buffer.from(this.body).length;
    let response_json = '';

    let promiseRequest = new Promise((reslove, reject) => {
      // let startDateRequest = Date.now();
      let req = http.request(this.connectParam, (res) => {
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          response_json += chunk;
        });
        res.on('end', () => {
          // let endDate = Date.now();
          // log.debug('\n --- start response\n', response_json, '\n --- end response', '\nRequest Time -', Date.now() - startDateRequest, 'ms')
          try {
            const for_log = ((response_json) ? JSON.parse(response_json) : '');
            logger.info('Request1C response => \n ' + JSON.stringify(for_log, null, 2));
            this.response = JSON.parse(response_json);
          } catch (e) {
            reject(e);
            logger.warn(response_json);
            // log.error('Parse JSON error response - ', response_json)
            return;
          }
          this.routing_response();
          reslove(this.response);
        });
      });
      req.setTimeout(1000 * 30, function() {
        reject(new errors.API1CError('The request ended in failure', this.token, 'Timeout response', 500));
      });
      req.on('error', (e) => {
        // log.error(e);
        logger.warn(e);
        reject(new errors.API1CError('The request ended in failure', this.token, 'The request ended in failure', 500));
      });
      req.write(this.body);
      req.end();
    });
    return promiseRequest;
  }

  // get result after request in 1C
  // response ––
  // [{
  //     'Data': {...},
  //     'Method': 'Client.CalculateOrder',
  //     'ActionID': 0
  // }] OR
  // [{
  //     'ErrorText': 'Invalid service ID',
  //     'Method': 'Client.CalculateOrder',
  //     'ErrorCode': 43,
  //     'ActionID': 0
  // }]
  // return –– { 'ok': true/false, 'data': ..., 'error': {'code': ..., 'text': '...'}
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

  // return  { method_name : data_from_1C }
  get_all() {
    const response = this.response;
    const hash = {};
    for (var i = 0, l = this.response.length; i < l; i++) {
      const el = response[i];
      const { method_name, res } = this._get(el);
      hash[method_name] = res;
    }
    return hash;
  }

  // wrapper and extractor for data form 1C
  _get(el) {
    let res;
    try {
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
      logger.warn(err);
      res = {
        ok: false,
        error: {
          code: -2,
          text: 'Internal error',
        }
      };
    }
    // return res;
    return { method_name: el.Method, res };
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
