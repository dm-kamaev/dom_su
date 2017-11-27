'use strict';

const http = require('http');
const config = require('config')
let log = require('logger')(module)

const connectParam = {
    hostname: config.api1C.ip,
    port: config.api1C.port,
    path: config.api1C.ticket_url,
    method: 'POST',
    headers: {
        'Content-type': "application/json",
        'Authorization': 'Basic ' + new Buffer('site' + ':' + 'asASDFdfs23').toString('base64')
    }
}

function sendTicket(ticket) {
    connectParam.headers['Content-length'] = Buffer.from(ticket).length;
    let response_json = "";
    let promiseRequest = new Promise((reslove, reject) => {
        const startDateRequest = Date.now();
        let req = http.request(connectParam, (res) => {
            res.setEncoding('utf8')
            res.on('data', (chunk) => {
                response_json += chunk
            });
            res.on('end', () => {
                try {
                    reslove(JSON.parse(response_json))
                } catch (e) {
                    log.error('Parse JSON error response - ', response_json)
                    reject(e)
                    return
                }
            });
        })
        req.setTimeout(1000 * 20, function() {
            reject(new Error('Ticket send error'))
        })
        req.on('error', (e) => {
            log.error(e)
            reject(new Error('Ticket send error'))
        })
        req.write(ticket)
        req.end()
    })
    return promiseRequest
}

module.exports = {sendTicket: sendTicket}