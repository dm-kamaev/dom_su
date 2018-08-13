'use strict';

const CONF = require('/p/pancake/settings/config.js');
const {QueueAsync} = require('./queue');
const { models } = require('models');
const {User, UTMS, Visit, Phone, Token, PendingToken, Employee, Client, ActionToken} = models;
const config = require('config');
const uuid4 = require('uuid/v4');
const {taskEventCreate} = require('./task');
const {saveAndSend} = require('tickets');
const {URL} = require('url');
const validateUUID = require('uuid-validate');
const geo_ip = require('geo-from-ip');
// const logger = require('logger')(module);
const moment = require('moment');
const city_api = require('/p/pancake/cities/city_api.js');
const db_users = require('/p/pancake/db/db_users.js');
const robot_user = require('/p/pancake/user_manager/robot_user.js');
const logger = require('/p/pancake/lib/logger.js');

// FOR DEV session_uid_dom_dev
// FOR PROD session_uid_dom
const USER_COOKIE_KEY = config.USER_COOKIE_KEY;
const PENDING_TOKEN_KEY = config.PENDING_TOKEN_USER_KEY;

let banRefererString = '(:?\\w+)' + '\\\.' + config.serverPath.domain.withoutCity.replace(/\./g, '\\\.') + '$';

let banRefererRegexp = new RegExp(banRefererString, 'g');

let banIPAddress = [
  '178.209.99.[2-6]{1}',
  '194.135.223.26',
  '194.135.223.27',
  '194.135.223.28',
  '194.135.223.29',
  '194.135.223.30',
  '217.173.79.102',
  '84.52.72.197',
  '95.165.187.222',
  '79.137.213.[2-8]{1}'
];

let banIPAddressListRegExp = [];

for (let ip of banIPAddress){
  banIPAddressListRegExp.push(new RegExp(ip, 'g'));
}

class PancakeUser {
  constructor(ctx) {
    let self = this;
    this.ctx = ctx;
    this.queue = new QueueAsync(self);
    this._utms = null;
    this.model = null;
    this.auth1C = {token: null, employee_uuid: null, client_uuid: null, uuid: null, model: null};
    this.visit_uuid = null;
    this.request_event_uuid = null;
    this.city = null;
    this.track = { done: null, waiting: null, numbers: {}, applicant_numbers: {} };
    this.google_id = null;
    // For fast working AB test
    this.firstVisit = true;
    this.is_robot = robot_user.its_robot(ctx);
  }

  async sync() {
    let self = this;
    let uuidNext = null;

    let user_uuid = this.ctx.cookies.get(USER_COOKIE_KEY);

    let needCreateUser = (user_uuid === undefined);

    if (!user_uuid && this.its_robot()) {
      user_uuid = robot_user.get_user_uuid();
      needCreateUser = false;
      this._set_cookies_for_robot(user_uuid);
      // console.log('THIS.IS_ROBOT', this.is_robot);
    }

    if (!needCreateUser) {
      let user = await User.findOne({where: { uuid: user_uuid }});
      // console.log(user_uuid);
      // console.dir(user.dataValues, { depth: 20, colors: true });
      if (user !== null) {
        this.model = user;
        this.uuid = user.uuid;
        this.isNew = false;
        this.city = this.ctx.cities[user.data.city];
        this.track = user.data.track;
        this.google_id = user.data.google_id;
        this.ab_test = user.data.ab_test || {};
        this.firstVisit = user.data.first_visit || false;
        // set custom phone from table users or default number for city
        if (user.current_phone) {
          this.set_phone(user.current_phone);
        }
        // this.set_phone(user.current_phone || this.city.phone);
      } else {
        if (validateUUID(this.ctx.cookies.get(USER_COOKIE_KEY), 4)){
          uuidNext = this.ctx.cookies.get(USER_COOKIE_KEY);
        }
        needCreateUser = true;
      }
    }

    if (needCreateUser) {
      this.uuid = uuidNext || uuid4();
      this.isNew = true;
      this.city = city_api.get_via_host(this.ctx);
      // this.set_phone(this.city.phone);

      this.setSelfInCookie(this.ctx);

      // queue
      this.queue.push(async function (previousResult, pancakeUser) {
        let user = await User.findOrCreate({
          defaults: {
            uuid: self.uuid,
            data: {
              city: self.ctx.cities.default.keyword,
              track: self.track,
              google_id: null,
              ab_test : {},
              first_visit: self.firstVisit,
            },
            its_robot: self.is_robot
          },
          where: {
            uuid: self.uuid
          },
          limit: 1
        });
        pancakeUser.model = user[0];
        return user;
      });
    }
  }

  set_phone(phone) {
    return this.current_phone = phone;
  }

  get_phone() {
    return this.current_phone;
  }


  async save_client_id() {
    this.client_id = await db_users.get_client_id(this.uuid);
  }

  get_client_id() {
    return this.client_id;
  }

  its_robot() {
    return this.is_robot;
  }

  // SET key 'u_uuid' in cookie value uuid
  // if first visit on site
  async set_in_cookie_user_uuid() {
    const cookie_name = 'u_uuid';
    const cookiesApi = this.ctx.cookies;
    const host = this.ctx.headers.host;
    if (!cookiesApi.get(cookie_name)) {
      cookiesApi.set(cookie_name, this.uuid, {
        httpOnly: false,
        domain: host,
        maxAge: 9 * 365 * 24 * 60 * 60 * 1000
      });
    } else if (cookiesApi.get(USER_COOKIE_KEY) !== cookiesApi.get(cookie_name)) {
      // зачищаем следы старой авторизации

      cookiesApi.set(USER_COOKIE_KEY, this.uuid, {
        httpOnly: false,
        domain: host,
        maxAge: 9 * 365 * 24 * 60 * 60 * 1000
      });
      cookiesApi.set(cookie_name, this.uuid, {
        httpOnly: false,
        domain: host,
        maxAge: 9 * 365 * 24 * 60 * 60 * 1000
      });
      // remove old cookie for '.domovenok.su'
      cookiesApi.set(USER_COOKIE_KEY, null, {
        httpOnly: false,
        domain: '.domovenok.su',
        maxAge: 0
      });
    }

    cookiesApi.set(USER_COOKIE_KEY, null, {
      httpOnly: false,
      domain: '.domovenok.su',
      maxAge: 0
    });

    cookiesApi.set(USER_COOKIE_KEY, this.uuid, {
      httpOnly: false,
      domain: host,
      maxAge: 9 * 365 * 24 * 60 * 60 * 1000
    });
  }

  async getUtms() {
    if (this._utms === null) {
      let utm_data_list = [];
      let utm_list = await UTMS.findAll({where: {user_uuid: this.uuid,}});
      if (utm_list !== null){
        let temp_list = JSON.parse(JSON.stringify(utm_list));
        for (let utm of temp_list){
          utm.data.created = moment(utm.createdAt).toISOString();
          utm_data_list.push(utm.data);
        }
      }
      this._utms = utm_data_list;
      return utm_data_list;
    } else {
      return this._utms;
    }
  }

  checkTrackNeed() {
    // FOR TEST
    // |
    // |
    // V
    // return true;
    const me = this;
    const headers = this.ctx.headers;
    const cookies = this.ctx.cookies;
    const v_id = cookies.get('v_id');
    // FOR TEST
    // |
    // |
    // V
    // set reffer and use tab chrome in mode incognito
    // this.ctx.headers.referer = 'https://yandex.ru';

    if (me.its_robot()) {
      return false;
    }

    const uuid = me.uuid;
    const _logger = {
      info: function(str) {
        const url = me.ctx.request.url;
        if (url === '/' || url === '/aj/calltracking') {
          logger.info(str);
        }
      }
    };

    _logger.info(`${uuid} checkTrackNeed => first_visit `+((v_id) ? 'return false' : 'skip'));
    // is not newest user
    if (v_id) {
    // LEGACY
    // if (this.isNew !== true) {
      return false;
    } else {
      // set cookie for first visit
      cookies.set('v_id', Date.now()+'__'+headers['x-real-ip'], {
        httpOnly: false,
        domain: headers.host,
        maxAge: 9 * 365 * 24 * 60 * 60 * 1000
      });
    }


    let referer = headers.referer;
    _logger.info(`${uuid} checkTrackNeed => !referer || !/domovenok/.test(referer) `+((!referer || !/domovenok/.test(referer)) ? 'return false' : 'skip'));
    if (!referer || !/domovenok/.test(referer)) {
      return false;
    }

    try {
      referer = new URL(referer);
      _logger.info(`${uuid} checkTrackNeed => referer = new URL(this.ctx.headers.referer) skip`);
    } catch (error){
      _logger.info(`${uuid} checkTrackNeed => referer = new URL(this.ctx.headers.referer) return false`);
      return false;
    }

    let ip = headers['x-real-ip'];
    if (CONF.is_dev) {
      ip = '79.137.213.2';
    }

    _logger.info(`${uuid} checkTrackNeed => !ip `+((!ip) ? 'return false': 'skip'));
    if (!ip) {
      return false;
    }

    try {
      // {"code":{"state":null,"country":"RU","continent":"EU"},"city":null,"state":null,"country":"Russia","continent":"Europe","location":{"accuracy_radius":1000,"latitude":55.7386,"longitude":37.6068}}
      // OR
      // { code: {}, error: 'NA', ip: '192.168.2.6' }
      const geo_data = geo_ip.allData(ip);
      _logger.info(`${uuid} checkTrackNeed => !/Russia/.test(data.country) `+((!/Russia/.test(geo_data.country)) ? 'return false': 'skip'));
      _logger.info(`${uuid} geoData= ${JSON.stringify(geo_data)}`);
      if (geo_data.error) {
        _logger.info(`${uuid} geo_data.error = ${JSON.stringify(geo_data)}`);
        return false;
      }
      if (!/Russia/.test(geo_data.country)) {
        return false;
      }
    } catch (err) {
      logger.warn(err);
      // _logger.info(`${uuid} checkTrackNeed => ERROR !/Russia/.test(geo_data.country) return false`);
      return false;
    }


    banRefererRegexp.lastIndex = 0;

    _logger.info(`${uuid} checkTrackNeed => banRefererRegexp.exec(referer.hostname) !== null `+((banRefererRegexp.exec(referer.hostname) !== null) ? 'return false' : 'skip'));
    if (banRefererRegexp.exec(referer.hostname) !== null) {
      return false;
    }

    // Check IP
    for (let filterIP of banIPAddressListRegExp){
      if (filterIP.test(headers['x-real-ip'])){
        _logger.info(`${uuid} checkTrackNeed => filterIP.test(this.ctx.request.header['x-real-ip']) return false`);
        return false;
      }
    }
    _logger.info(`${uuid} checkTrackNeed => the end return true`);
    return true;
  }

  setTrackWaiting(waiting) {
    if (this.track.waiting === waiting) {
      return;
    }
    this.queue.push(async function (previousResult, pancakeUser) {
      pancakeUser.track.waiting = waiting;
      pancakeUser.model.set('data.track.waiting', waiting);
      await pancakeUser.model.save();
      return pancakeUser.model;
    });
  }


  /**
   * set_track_number_for_client: set track number for client
   * @return {Number || Error_track_number} +79067893421 || error
   */
  async set_track_number_for_client() {
    const me = this;
    logger.log(`${me.uuid} set_track_number_for_client`);
    const client_number = this.get_track_number_for_client();
    if (client_number) {
      return client_number;
    }

    // const client_numbers = this.track.numbers;
    // const city_keyword = this.city.keyword;
    // if (client_numbers && client_numbers[city_keyword]) {
    //   return client_numbers[city_keyword];
    // }
    logger.log(`${me.uuid} after return`);

    // SELECT
    //   *
    // FROM
    //   phones
    // WHERE
    //   city_id=1
    //   AND
    //   living=false
    //   AND
    //   active=true
    //   AND
    //   category_type='client'
    const phone = await Phone.findOne({
      where: {
        city_id: this.city.id,
        living: false, // don't bind for user
        active: true, // but we can use him
        category_type: 'client'
      }
    });
    const phone_log = (phone && phone.dataValues) ? JSON.stringify(phone.dataValues) : null;
    logger.log(`${me.uuid} phone= ${phone_log}`);
    if (phone) {
      const phone_number = phone.number;
      if (!this.track.numbers) {
        this.track.numbers = {};
      }
      this.track.numbers[this.city.keyword] = phone_number;
      this.queue.push(async function (previousResult, pancakeUser) {
        const user = await User.findOne({
          where: {
            uuid: me.uuid
          }
        });
        user.set(`data.track.numbers.${pancakeUser.city.keyword}`, pancakeUser.track.numbers[pancakeUser.city.keyword]);
        await user.save();

        phone.user_uuid = me.uuid;

        // pancakeUser.model.set(`data.track.numbers.${pancakeUser.city.keyword}`, pancakeUser.track.numbers[pancakeUser.city.keyword]);
        // await pancakeUser.model.save();
        // phone.user_uuid = pancakeUser.uuid;

        phone.living = true;
        await phone.save();
        console.log(`\n\n SET DATA  data.track.numbers.${pancakeUser.city.keyword}`, pancakeUser.track.numbers[pancakeUser.city.keyword]);
        return phone;
      });
      return phone_number;
    } else {
      return new Error_track_number('Over the phones');
    }
  }

  /**
   * set_track_number_for_client: set track number for applicant(potenial employee)
   * @return {Number || Error_track_number} +79067893421 || error
   */
  async set_track_number_for_applicant() {
    const me = this;
    const applicant_number = this.get_track_number_for_applicant();
    if (applicant_number) {
      return applicant_number;
    }
    let applicant_numbers = this.track.applicant_numbers;
    const city_keyword = this.city.keyword; // example: moscow
    // if (applicant_numbers && applicant_numbers[city_keyword]) {
    //   return applicant_numbers[city_keyword];
    // }

    const phone = await Phone.findOne({
      where: {
        city_id: this.city.id,
        living: false, // don't bind for user
        active: true, // but we can use him
        category_type: 'applicant'
      }
    });
    if (phone) {
      const phone_number = phone.number;

      if (!this.track.applicant_numbers) {
        this.track.applicant_numbers = {};
        applicant_numbers = this.track.applicant_numbers;
      }

      applicant_numbers[city_keyword] = phone_number;
      this.queue.push(async function (previousResult, pancakeUser) {
        const user = await User.findOne({
          where: {
            uuid: me.uuid
          }
        });
        console.log('pancakeUser=', pancakeUser);
        user.set(`data.track.applicant_numbers.${pancakeUser.city.keyword}`, pancakeUser.track.applicant_numbers[pancakeUser.city.keyword]);
        await user.save();

        phone.user_uuid = me.uuid;

        // pancakeUser.model.set(`data.track.applicant_numbers.${pancakeUser.city.keyword}`, pancakeUser.track.applicant_numbers[pancakeUser.city.keyword]);
        // await pancakeUser.model.save();
        // phone.user_uuid = pancakeUser.uuid;

        phone.living = true;
        await phone.save();
        console.log(`SET DATA data.track.applicant_numbers.${pancakeUser.city.keyword}`, pancakeUser.track.applicant_numbers[pancakeUser.city.keyword]);
        return phone;
      });
      return phone_number;
    } else {
      return new Error_track_number('Over the phones');
    }
  }

  /**
   * get_track_number_for_applicant: get personal calltracking number for client
   * @return {String | null}
   */
  get_track_number_for_client() {
    const client_numbers = this.track.numbers;
    const city_keyword = this.city.keyword;
    if (client_numbers && client_numbers[city_keyword]) {
      return client_numbers[city_keyword];
    }
  }

  /**
   * get_track_number_for_applicant: get personal calltracking number for employee(potentional)
   * @return {String | null}
   */
  get_track_number_for_applicant() {
    const applicant_numbers = this.track.applicant_numbers;
    const city_keyword = this.city.keyword; // exmaple: moscow
    if (applicant_numbers && applicant_numbers[city_keyword]) {
      return applicant_numbers[city_keyword];
    }
  }

  setGoogleId(){
    if (!this.ctx.request.body.data && !this.ctx.request.body.data.google_id){
      return;
    }
    let google_id = this.ctx.request.body.data.google_id;
    if (this.google_id !== google_id){
      this.queue.push(async function (previousResult, pancakeUser) {
        pancakeUser.model.set('data.google_id', google_id);
        await pancakeUser.model.save();
        return pancakeUser;
      });
    }
  }

  /**
   * @return {String} 1405044556.1440140825
   */
  get_google_id() {
    return this.google_id;
  }

  setVisit() {
    if (this.isNew === true) {

      const data = {};
      this.visit_uuid = uuid4();

      // queue
      this.queue.push(async function (previousResult, pancakeUser) {
        const visit = await Visit.create({
          uuid: pancakeUser.visit_uuid,
          data: data,
          user_uuid: pancakeUser.uuid
        });
        return visit;
      });
    } else {
      this.queue.push(async function (previousResult, pancakeUser) {
        let visit = await Visit.find({where: {user_uuid: pancakeUser.uuid, active: true}});
        if (visit) {
          pancakeUser.visit_uuid = visit.uuid;
          return visit;
        } else {
          const data = {};
          const visit_uuid = uuid4();
          let visit = await Visit.create({uuid: visit_uuid, data: data, user_uuid: pancakeUser.uuid});
          pancakeUser.visit_uuid = visit.uuid;
          return visit;
        }
      });
    }
  }

  createEvent(eventData) {
    let task = taskEventCreate(eventData);
    this.queue.push(task);
  }

  getABTest(ABTest){
    if (this.ab_test){
      return this.ab_test[ABTest.key];
    }
    return null;
  }

  // current_page –– which user see,
  // variations –– alterantive page for a/b
  setABTest(ABTestKey, ABTestVariant, current_page, variations){
    const me = this;
    if (this.ab_test === undefined){
      this.ab_test = {};
    }
    this.ab_test[ABTestKey] = {page: ABTestVariant.page, name: ABTestVariant.name};
    this.queue.push(async function   (previousResult, pancakeUser) {
      pancakeUser.model.set(`data.ab_test.${ABTestKey}`, {});
      pancakeUser.model.set(`data.ab_test.${ABTestKey}`, {page: ABTestVariant.page, name: ABTestVariant.name, date: new Date() });
      await me.sendTicket('a_b_test', {
        key: ABTestKey,
        currentPage: current_page,
        variations
      });
      await pancakeUser.model.save();
    });
  }

  changeCity(city) {
    this.city = city;
    this.queue.push(async function (previousResult, pancakeUser) {
      pancakeUser.model.set('data.city', city.keyword);
      await pancakeUser.model.save();
    });
  }

  saveUTMS(data) {
    this.queue.push(async function (previousResult, pancakeUser) {
      let UTM = await UTMS.create({
        data: data,
        event_uuid: pancakeUser.request_event_uuid,
        user_uuid: pancakeUser.uuid
      });
      return UTM;
    });
    this.sendTicket('CaughtUTM', {utm: data});
  }

  setLastAction() {
    this.queue.push(async function (previousResult, pancakeUser) {
      pancakeUser.model.last_action = new Date();
      await pancakeUser.model.save();
    });
  }

  getActionToken(actionType){
    let actionTokenUUID = uuid4();
    // asyc потому что пользователь может не создаться
    this.queue.push(async function (previousResult, pancakeUser) {
      await ActionToken.create({token: actionTokenUUID, user_uuid: pancakeUser.uuid, type: actionType});
    });
    return actionTokenUUID;
  }

  async checkActionToken(actionType, token){
    let actionToken = await ActionToken.findOne({where:{user_uuid: this.uuid, token: token, type: actionType}});
    if (actionToken === null){
      return false;
    } else {
      await actionToken.destroy();
      return true;
    }
  }

  clientConnect(luid) {
    if (this.its_robot()) {
      return;
    }
    this.sendTicket('ClientConnect', { luid });
  }

  sendTicket(type, data) {
    // Add UTMS and User UUID in Ticket
    const me = this;
    me.queue.push(async function (previousResult, pancakeUser) {
      data['user_id'] = pancakeUser.uuid;
      let ticket = await saveAndSend(type, data, me.ctx);
      return ticket;
    });
  }

  setSelfInCookie(ctx) {
    // console.log('setSelfInCookie=', {
    //   httpOnly: false,
    //   domain: ctx.headers.host, // now set .domovenok.su; TODO: set www.domovenok.su
    //   maxAge: 9 * 365 * 24 * 60 * 60 * 1000
    // });
    this.ctx.cookies.set(USER_COOKIE_KEY, this.uuid, {
      httpOnly: false,
      // domain: config.cookie.domain, // now set .domovenok.su; TODO: set www.domovenok.su
      domain: ctx.headers.host, // now set .domovenok.su; TODO: set www.domovenok.su
      maxAge: 9 * 365 * 24 * 60 * 60 * 1000
    });
  }

  runAsyncTask() {
    this.queue.do();
  }

  async getPendingAuth1C(){
    if (this.ctx.cookies.get(PENDING_TOKEN_KEY)){
      let pendingToken = await PendingToken.findOne({where: {key: this.ctx.cookies.get(PENDING_TOKEN_KEY)}});
      if (pendingToken){
        let token;
        if (pendingToken.init == false){
          pendingToken.init = true;
          await pendingToken.save();
          token = this.createAuth1C(pendingToken);
        } else {
          token = {token: pendingToken.token, client_uuid: pendingToken.client_uuid, employee_uuid: pendingToken.employee_uuid, uuid: null};
        }
        return token;
      }
    }
    return null;
  }

  cleanPendingCookie(){
    if (this.ctx.cookies.get(PENDING_TOKEN_KEY)){
      this.ctx.cookies.set(PENDING_TOKEN_KEY, null, {domain: config.cookie.domain, maxAge: 0, path: '/', httpOnly: false});
    }
  }

  createAuth1C(pendingToken){
    this.queue.push(async function (previousResult, pancakeUser) {
      if (pendingToken.employee_uuid) {
        await Employee.findOrCreate({
          where: {uuid: pendingToken.employee_uuid}, defaults: {
            uuid: pendingToken.employee_uuid,
            data: {},
          }
        });
      }

      if (pendingToken.client_uuid) {
        await Client.findOrCreate({
          where: {uuid: pendingToken.client_uuid}, defaults: {
            uuid: pendingToken.client_uuid,
            data: {},
          }
        });
      }
      await Token.create({
        token: pendingToken.token,
        user_uuid: pancakeUser.uuid,
        employee_uuid: pendingToken.employee_uuid,
        client_uuid: pendingToken.client_uuid,
        active: true,
      });
      await pendingToken.destroy();
    });
    return {token: pendingToken.token, client_uuid: pendingToken.client_uuid, employee_uuid: pendingToken.employee_uuid, uuid: null};
  }

  async getAuth1C(){
    // Already received token
    if (this.auth1C.token !== null){
      return this.auth1C;
    }
    // Get common auth1C
    let tokenModel = await Token.findOne({where: {active: true, user_uuid: this.uuid}});
    if (tokenModel) {
      this.auth1C = {
        uuid: tokenModel.uuid,
        token: tokenModel.token,
        client_uuid: tokenModel.client_uuid,
        employee_uuid: tokenModel.employee_uuid,
      };
    }
    // Get pending auth1C
    if (this.auth1C.token === null){
      let pendingAuth1C = await this.getPendingAuth1C();
      if (pendingAuth1C){
        this.auth1C = pendingAuth1C;
      }
    } else {
      this.cleanPendingCookie();
    }
    return this.auth1C;
  }

  async isFirstVisit(){
    if (this.isNew){
      return true;
    } else {
      let visits = await Visit.findAndCountAll({'where': {'user_uuid': this.uuid}});
      if (visits && visits.count > 1){
        return false;
      }
      return true;
    }
  }

  async getAuth1CTask(){
    this.queue.push(async function (previousResult, pancakeUser) {
      if (pancakeUser.auth1C.uuid !== null){
        return pancakeUser.auth1C;
      }
      let tokenModel = await Token.findOne({where: {active: true, user_uuid: pancakeUser.uuid}});

      if (tokenModel) {
        pancakeUser.auth1C = {
          uuid: tokenModel.uuid,
          token: tokenModel.token,
          client_uuid: tokenModel.client_uuid,
          employee_uuid: tokenModel.employee_uuid
        };
      }
    });
  }


  // MY ADAPTER METHOD
  async setAuth1C(authData) {
    authData = authData || {};
    const auth1C = this.auth1C;
    auth1C.uuid = authData.uuid;
    auth1C.client_uuid = authData.client_id;
    auth1C.employee_uuid = authData.employee_id;
    auth1C.token = authData.token;
    const tokenDb = await Token.find({
      where: {
        uuid: auth1C.uuid,
      },
    });
    if (!tokenDb && auth1C.uuid) {
      // await Token.create({
      //     token: auth1C.token,
      //     user_uuid: auth1C.uuid,
      //     employee_uuid: auth1C.employee_uuid,
      //     client_uuid: auth1C.client_uuid,
      //     active: true,
      // });
    }
  }

  /**
   * _set_cookies_for_robot: set user uuid for robot
   * @param {String} user_uuid: '59128f09-7e43-48b1-a35a-593106cff419'
   */
  _set_cookies_for_robot(user_uuid) {
    const ctx = this.ctx;
    const params = {
      httpOnly: false,
      domain: ctx.headers.host,
      maxAge: 9 * 365 * 24 * 60 * 60 * 1000
    };
    ctx.cookies.set(USER_COOKIE_KEY, user_uuid, params);
    ctx.cookies.set('u_uuid', user_uuid, params);
  }
}

class Error_track_number extends Error {
  /**
   * @param {String} msg
   */
  constructor(msg)  {
    super(msg);
    this.message = msg;
  }
}




module.exports = {PancakeUser};
