'use strict';
const {QueueAsync} = require('./queue');
const logger = require('/p/pancake/lib/logger.js');
const json = require('/p/pancake/my/json.js');
const {models} = require('models');
const {User, UTMS, Phone} = models;
const {saveAndSend} = require('tickets');
const http = require('http');
const config = require('config');
const querystring = require('querystring');

class PancakeService {
  constructor(ctx){
    let self = this;
    this.ctx = ctx;
    this.queue = new QueueAsync(self);
  }

  async setTrackDone(data) {
    let phone = await Phone.findOne({where: {number: data.phone}});
    if (phone == null) {
      // logger.log(`handler_tracking_call5:: Post call tracking | Phone - ${data.phone} - not found`);
      throw new Error(`Post call tracking | Phone - ${data.phone} - not found`);
    }

    let user = await User.findOne({where: {uuid: phone.user_uuid}});
    if (user == null){
      // logger.log(`handler_tracking_call5:: Post call tracking | On Phone - ${phone.number + ' | User uuid - ' + phone.uuid} - not found`);
      throw new Error(`Post call tracking | On Phone - ${phone.number + ' | User uuid - ' + phone.uuid} - not found`);
    }
    let ticket = {
      channel: data.channel,
      google_id: user.data.google_id,
      active: phone.living,
      user_id: user.uuid,
    };
    if (user == null){
      // logger.log(`handler_tracking_call5:: Post call tracking | User on Phone - ${data.phone} - not found`);
      throw new Error(`Post call tracking | User on Phone - ${data.phone} - not found`);
    }
    // {
    //     "action": "NewOnlineObjects",
    //     "param": [{
    //         "type": "NewTrackingCall",
    //         "data": {
    //             "channel": 2769574,
    //             "active": true,
    //             "user_id": "2e93858f-c0d5-4dfe-af93-d295e805d546",
    //             "date": "2018-03-05T10:09:25.330Z"
    //         }
    //     }]
    // }
    // logger.log(`handler_tracking_call5:: NewTrackingCall ${JSON.stringify(ticket)}`);
    this.sendTicket('NewTrackingCall', ticket);
    this.sendDataGA({
      'v': 1,
      'tid': config.analytics.google,
      'cid': user.data.google_id,
      't': 'event',
      'ec': 'call',
      'ea': 'incoming',
      'ds': 'call center'
    });

    // Clean Track Phone Number^ maybe in script free_phone set waiting false
    user.track = {done: true, waiting: false, numbers: null, applicant_numbers: null };
    this.queue.push(async function (previousResult, pancakeService) {
      user.set('data.track', user.track);
      await user.save();
      await phone.update({living: false});
      return phone;
    });
  }

  async sendDataGA(data){
    const me = this;
    try {
      // logger.log(`handler_tracking_call5:: sendDataGA: ${JSON.stringify(data)}`);
      const connectParam = {
        hostname: 'www.google-analytics.com',
        port: 80,
        path: '/collect',
        method: 'POST',
        headers: {
          'User-Agent': 'AstDom'
        }
      };
      const res = await me.sendRequest(connectParam, querystring.stringify(data), 20);
      // logger.log(`handler_tracking_call5:: connectParam: ${JSON.stringify(connectParam)}`);
      // logger.log(`handler_tracking_call5:: data: ${JSON.stringify(data)}`);
      // logger.log(`handler_tracking_call5:: send to Google analytics: `);
      // logger.log(`handler_tracking_call5::`+JSON.stringify(res));
      // logger.warn('TO GA ===', querystring.stringify(data));
    } catch (err) {
      me.sendRequest(connectParam, querystring.stringify(data), 20).catch((err) => {
        logger.warn('handler_tracking_call5:: Error send to Google analytics '+err);
      });
    }

    // const me = this;
    // me.queue.push(async function (previousResult, pancakeService) {
    //   try {
    //     logger.log(`handler_tracking_call5:: sendDataGA: ${JSON.stringify(data)}`);
    //     const connectParam = {
    //       hostname: 'www.google-analytics.com',
    //       port: 80,
    //       path: '/collect',
    //       method: 'POST',
    //       headers: {
    //         'User-Agent': 'AstDom'
    //       }
    //     };
    //     const res = await me.sendRequest(connectParam, querystring.stringify(data), 20);
    //     logger.log(`handler_tracking_call5:: connectParam: ${JSON.stringify(connectParam)}`);
    //     logger.log(`handler_tracking_call5:: data: ${JSON.stringify(data)}`);
    //     logger.log(`handler_tracking_call5:: send to Google analytics: `);
    //     logger.log(`handler_tracking_call5::`+JSON.stringify(res));
    //   } catch (err) {
    //     me.sendRequest(connectParam, querystring.stringify(data), 20).catch((err) => {
    //       logger.warn('handler_tracking_call5:: Error send to Google analytics '+err);
    //     });
    //   }
    //   return res;
    // });
  }

  /**
   * sendTicket:
   * @param  {[type]} type: 'NewTrackingCall'
   * @param  {Object} data:
   * {
      channel: number ,
      google_id: string,
      active: boolean,
      user_id: uuid,
    }
   */
  sendTicket(type, data) {
    const me = this;
    me.queue.push(async function (previousResult, pancakeService) {
      let ticket;
      try {
        ticket = await saveAndSend(type, data, me.ctx);
      } catch (err) {
        logger.warn(err);
      }
      return ticket;
    });
  }

  async getUserUtms(uuid) {
    let utm_list = await UTMS.findAll({where: {user_uuid: uuid,}});
    utm_list = utm_list || [];
    return utm_list;
  }

  //async check404

  sendRequest(connectParam, body, timeout){
    timeout = timeout || 20;
    let response = '';
    if (connectParam.method == 'POST'){
      connectParam.headers['Content-length'] = Buffer.from(body).length;
    }
    return new Promise((reslove, reject) => {
      let req = http.request(connectParam, (res) => {
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          response += chunk;
        });
        res.on('end', () => {
          reslove(response);
        });
      });
      req.setTimeout(1000 * timeout, function () {
        reject(new Error(`Request timeout error - ${connectParam}`));
      });
      req.on('error', (e) => {
        reject(new Error(`The request ended in failure - ${connectParam}`));
      });
      if (connectParam.method == 'POST'){
        req.write(body);
      }
      req.end();
    });
  }

  runAsyncTask() {
    this.queue.do();
  }
}

module.exports = {
  PancakeService
};