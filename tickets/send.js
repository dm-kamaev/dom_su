'use strict';

const http = require('http');
const config = require('config')
const logger = require('/p/pancake/lib/logger.js');

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
            res.setEncoding('utf8');
            logger.log(`${connectParam.hostname} ${connectParam.path} ${connectParam.port}`);
            logger.info('sendTicket Request to 1C => '+JSON.stringify(JSON.parse(ticket), null, 2));
            res.on('data', (chunk) => {
                response_json += chunk
            });
            res.on('end', () => {
                try {
                    const response = JSON.parse(response_json);
                    logger.info('sendTicket Response from 1C => '+JSON.stringify(response, null, 2));
                    reslove(response)
                } catch (e) {
                    const for_log = (typeof response_json === 'object') ? JSON.stringify((response_json), null, 2) : response_json;
                    logger.warn('Parse JSON error response - '+for_log);
                    reject(e)
                    return
                }
            });
        })
        req.setTimeout(1000 * 20, function() {
            reject(new Error('Ticket send error'))
        })
        req.on('error', (e) => {
            logger.warn(e);
            reject(new Error('Ticket send error'))
        })
        req.write(ticket)
        req.end()
    })
    return promiseRequest
}

module.exports = {sendTicket: sendTicket}