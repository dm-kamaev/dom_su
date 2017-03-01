"use strict";
const {QueueAsync} = require('./queue')
const {models, ErrorCodes, ModelsError} = require('models');
const {User, UTMS, Phone} = models;
const {saveAndSend} = require('tickets')
const http = require('http');
const config = require('config');

class PancakeService {
    constructor(ctx){
        let self = this
        this.ctx = ctx
        this.queue = new QueueAsync(self)
    }

    async setTrackDone(data) {
        let phone = await Phone.findOne({where: {number: data.phone}})
        if (phone == null) {
            throw new Error(`Post call tracking | Phone - ${data.phone} - not found`)
        }
        let user = await User.findOne({where: {uuid: phone.user_uuid}})
        if (user == null){
            throw new Error(`Post call tracking | On Phone - ${phone.number + ' | User uuid - ' + phone.uuid} - not found`)
        }
        let ticket = {
            channel: data.channel,
            google_id: user.google_id,
            active: phone.living,
            user_id: user.uuid,
        }
        if (user == null){
            throw new Error(`Post call tracking | User on Phone - ${data.phone} - not found`)
        }
        this.sendTicket('NewTrackingCall', ticket, user.uuid)
        this.sendDataGA({'params': {
            'v': 1,
            'tid': config.analytics.google,
            'cid': user.data.google_id,
            't': 'event',
            'ec': 'call',
            'ea': 'incoming',
            'ds': 'call center'
        }})

        // Clean Track Phone Number
        user.track = {done: true, waiting: false, number: null}
        this.queue.push(async function (previousResult, pancakeService) {
            user.set('data.track', user.track);
            await user.save()
            await phone.update({living: false})
            return phone
        })
    }

    sendDataGA(data){
        this.queue.push(async function (previousResult, pancakeService) {
            let connectParam = {
                hostname: 'www.google-analytics.com',
                port: 80,
                path: "/collect",
                method: 'POST',
                headers: {
                    "User-Agent": "AstDom"
                }
            }
            await pancakeService.sendRequest(connectParam, JSON.stringify(data), 20)
        })
    }

    sendTicket(type, data, user_uuid) {
        this.queue.push(async function (previousResult, pancakeService) {
            let utms;
            if (user_uuid) {
                utms = await pancakeService.getUserUtms(user_uuid)
            }
            let ticket = await saveAndSend(type, data, utms)
            return ticket
        })
    }

    async getUserUtms(uuid) {
        let utm_list = await UTMS.findAll({where: {user_uuid: uuid,}})
        utm_list = utm_list || []
        return utm_list
    };

    //async check404

    sendRequest(connectParam, body, timeout){
        timeout = timeout || 20
        let response = ''
        if (connectParam.method == 'POST'){
            connectParam.headers['Content-length'] = Buffer.from(body).length;
        }
        return new Promise((reslove, reject) => {
            let req = http.request(connectParam, (res) => {
                res.setEncoding('utf8')
                res.on('data', (chunk) => {
                    response += chunk
                });
                res.on('end', () => {
                    reslove(response);
                });
            })
            req.setTimeout(1000 * timeout, function () {
                reject(new Error(`Request timeout error - ${connectParam}`))
            })
            req.on('error', (e) => {
                reject(new Error(`The request ended in failure - ${connectParam}`))
            })
            if (connectParam.method == 'POST'){
                req.write(body)
            }
            req.end()
        })
    }

    runAsyncTask() {
        this.queue.do()
    }
}

module.exports = {
    PancakeService
}