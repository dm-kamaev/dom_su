'use strict';
let http = require('http');
let querystring = require('querystring');
let log = require('logger')(module, 'staff.log')
let errors = require('./errors')
const config = require('config')
const uap = require('node-uap');


let server = config.api1C


class Method1C{
    constructor(name, param){
        this.name = name;
        this.param = param;
        this.response = null;
        this.error = null;
    }
}

class Request1C {

    constructor(token, ip, userAgent, oldAPI){
        oldAPI = oldAPI || false
        this.methods = [];
        this.response = null;
        this.token = token
        const {ua, os, device, userAgent: Original } = uap.parse(userAgent);
        this.ip = ip
        this.userAgent = userAgent
        this.body = {
            Methods: [], Token: token, ClientData: {
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

    routing_response(){
        this.response.forEach((item) => {
            if (!item.ErrorCode){
                this.methods[item.ActionID].response = item.Data
            } else
                this.methods[item.ActionID].error = {code: item.ErrorCode, text: item.ErrorText}
        })
    }

    add(){
        for (let i = 0; i < arguments.length; i++) {
            let count = this.methods.length;
            this.methods.push(arguments[i]);
            this.body.Methods.push({"Method": arguments[i].name, "Param": arguments[i].param, "ActionID": count})
        }
    }

    do(){
        this.body = JSON.stringify(this.body);

        log.debug('\n --- start request\n',this.body, '\n --- end request');
        this.connectParam.headers['Content-length'] = Buffer.from(this.body).length;
        let response_json= "";

        let promiseRequest = new Promise((reslove, reject) => {
            let startDateRequest = Date.now();
            let req = http.request(this.connectParam, (res) => {
                res.setEncoding('utf8')
                res.on('data', (chunk) => {
                    response_json += chunk
                });
                res.on('end', () => {
                    let endDate = Date.now();
                    log.debug('\n --- start response\n',response_json, '\n --- end response', '\nRequest Time -', Date.now()-startDateRequest, 'ms')
                    try {
                        this.response = JSON.parse(response_json)
                    } catch (e) {
                        reject(e)
                        log.error('Parse JSON error response - ', response_json )
                        return
                    }
                    this.routing_response()
                    reslove(this.response);
                });
            })
            req.setTimeout(1000 * 20, function(){reject(new errors.API1CError('The request ended in failure', this.token, 'Timeout response', 500))})
            req.on('error', (e) => {
                reject(new errors.API1CError('The request ended in failure', this.token, 'The request ended in failure', 500))
            })
            req.write(this.body)
            req.end()
        })
        return promiseRequest
    }
};

class SingleRequest1C{

    constructor (name, param, token, ip, userAgent){
        token = token || null
        ip = ip || null
        userAgent = userAgent || null
        this.request1C = new Request1C(token, ip, userAgent);
        this.singleMethod = new Method1C(name, param);
        this.request1C.add(this.singleMethod)
    }

    async do (){
        await this.request1C.do()
        if (this.singleMethod.error){
            throw new Error(`API 1C error ${JSON.stringify(this.singleMethod.error)}`)
        }
        return this.singleMethod.response
    }

}

module.exports = {
    Method1C,
    Request1C,
    SingleRequest1C
}
