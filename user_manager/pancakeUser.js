"use strict";
const {QueueAsync} = require('./queue')
const {models, ErrorCodes, ModelsError} = require('models');
const {User, UTMS, Visit, Phone, Token, PendingToken, Employee, Client, ActionToken} = models;
const config = require('config')
const uuid4 = require('uuid/v4')
const {taskEventCreate} = require('./task')
const {saveAndSend} = require('tickets')
const {URL} = require('url')
const validateUUID = require('uuid-validate');
const logger = require('logger')(module)
const moment = require('moment')


const USER_COOKIE_KEY = config.USER_COOKIE_KEY
const PENDING_TOKEN_KEY = config.PENDING_TOKEN_USER_KEY

let banRefererString = '(:?\\w+)' + '\\\.' + config.serverPath.domain.withoutCity.replace(/\./g, "\\\.") + '$'
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
]

let banIPAddressListRegExp = []

for (let ip of banIPAddress){
    banIPAddressListRegExp.push(new RegExp(ip, 'g'))
}

class PancakeUser {
    constructor(ctx) {
        let self = this
        this.ctx = ctx
        this.queue = new QueueAsync(self)
        this._utms = null;
        this.model = null
        this.auth1C = {token: null, employee_uuid: null, client_uuid: null, uuid: null, model: null}
        this.visit_uuid = null
        this.request_event_uuid = null
        this.city = null;
        this.track = {done: null, waiting: null, numbers: {}}
        this.google_id = null
        // For fast working AB test
        this.firstVisit = true
    }

    async sync() {
        let self = this
        let uuidNext = null;

        let needCreateUser = this.ctx.cookies.get(USER_COOKIE_KEY) === undefined

        if (!needCreateUser) {
            let user = await User.findOne({where: {uuid: this.ctx.cookies.get(USER_COOKIE_KEY)}})
            if (user !== null) {
                this.model = user
                this.uuid = user.uuid
                this.isNew = false
                this.city = this.ctx.cities[user.data.city]
                this.track = user.data.track
                this.google_id = user.data.google_id
                this.ab_test = user.data.ab_test || {}
                this.firstVisit = user.data.first_visit || false
            } else {
                if (validateUUID(this.ctx.cookies.get(USER_COOKIE_KEY), 4)){
                    uuidNext = this.ctx.cookies.get(USER_COOKIE_KEY)
                }
                needCreateUser = true;
            }
        }
        if (needCreateUser) {
            this.uuid = uuidNext || uuid4()
            this.isNew = true
            this.city = this.ctx.cities.default

            this.setSelfInCookie()
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
                        }
                    },
                    where: {
                        uuid: self.uuid
                    },
                    limit: 1
                })
                pancakeUser.model = user[0]
                return user
            })
        }
    }

    async getUtms() {
        if (this._utms === null) {
            let utm_data_list = [];
            let utm_list = await UTMS.findAll({where: {user_uuid: this.uuid,}})
            if (utm_list !== null){
                let temp_list = JSON.parse(JSON.stringify(utm_list))
                for (let utm of temp_list){
                    utm.data.created = moment(utm.createdAt).toISOString()
                    utm_data_list.push(utm.data)
                }
            }
            this._utms = utm_data_list
            return utm_data_list
        } else {
            return this._utms
        }
    };

    checkTrackNeed() {
        if (this.track.waiting === true) {
            return true
        }
        if (this.isNew !== true) {
            return false
        }

        if (this.ctx.headers.referer === undefined) {
            return false
        }
        let referer;
        try{
            referer = new URL(this.ctx.headers.referer);
        } catch (e){
            return false
        }
        banRefererRegexp.lastIndex = 0;
        if (banRefererRegexp.exec(referer.hostname) !== null) {
            return false
        }

        // Check IP
        for (let filterIP of banIPAddressListRegExp){
            if (filterIP.test(this.ctx.request.header['x-real-ip'])){
                return false
            }
        }
        return true
    }

    setTrackWaiting(waiting) {
        if (this.track.waiting === waiting) {
            return
        }
        this.queue.push(async function (previousResult, pancakeUser) {
            pancakeUser.track.waiting = waiting
            pancakeUser.model.set('data.track.waiting', waiting);
            await pancakeUser.model.save()
            return pancakeUser.model
        })
    }

    async setTrackNumber() {
        if (this.track.numbers && this.track.numbers[this.city.keyword]) {
            return
        }
        let phone = await Phone.findOne({where: {city_id: this.city.id, living: false, active: true}})
        if (phone !== null) {
            this.track.numbers[this.city.keyword] = phone.number
            this.queue.push(async function (previousResult, pancakeUser) {
                pancakeUser.model.set(`data.track.numbers.${pancakeUser.city.keyword}`, pancakeUser.track.numbers[pancakeUser.city.keyword]);
                await pancakeUser.model.save()
                phone.user_uuid = pancakeUser.uuid
                phone.living = true
                await phone.save()
                return phone
            })
        }
    }
    setGoogleId(){
        if (!this.ctx.request.body.data && !this.ctx.request.body.data.google_id){
            return
        }
        let google_id = this.ctx.request.body.data.google_id
        if (this.google_id !== google_id){
            this.queue.push(async function (previousResult, pancakeUser) {
                pancakeUser.model.set('data.google_id', google_id);
                await pancakeUser.model.save()
                return pancakeUser
            })
        }
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
                })
                return visit
            })
        } else {
            this.queue.push(async function (previousResult, pancakeUser) {
                let visit = await Visit.find({where: {user_uuid: pancakeUser.uuid, active: true}})
                if (visit) {
                    pancakeUser.visit_uuid = visit.uuid
                    return visit
                } else {
                    const data = {};
                    const visit_uuid = uuid4();
                    let visit = await Visit.create({uuid: visit_uuid, data: data, user_uuid: pancakeUser.uuid})
                    pancakeUser.visit_uuid = visit.uuid
                    return visit
                }
            })
        }
    }

    createEvent(eventData) {
        let task = taskEventCreate(eventData)
        this.queue.push(task)
    }

    getABTest(ABTest){
        if (this.ab_test){
            return this.ab_test[ABTest.key]
        }
        return null
    }

    setABTest(ABTestKey, ABTestVariant){
        if (this.ab_test === undefined){
            this.ab_test = {}
        }
        this.ab_test[ABTestKey] = {page: ABTestVariant.page, name: ABTestVariant.name}
        this.queue.push(async function   (previousResult, pancakeUser) {
            pancakeUser.model.set(`data.ab_test.${ABTestKey}`, {});
            pancakeUser.model.set(`data.ab_test.${ABTestKey}`, {page: ABTestVariant.page, name: ABTestVariant.name});
            await pancakeUser.model.save()
        })
    }

    changeCity(city) {
        this.city = city
        this.queue.push(async function (previousResult, pancakeUser) {
            pancakeUser.model.set('data.city', city.keyword);
            await pancakeUser.model.save()
        })
    }

    saveUTMS(data) {
        this.queue.push(async function (previousResult, pancakeUser) {
            let UTM = await UTMS.create({
                data: data,
                event_uuid: pancakeUser.request_event_uuid,
                user_uuid: pancakeUser.uuid
            })
            return UTM
        })
        this.sendTicket('CaughtUTM', {utm: data})
    }

    setLastAction() {
        this.queue.push(async function (previousResult, pancakeUser) {
            pancakeUser.model.last_action = new Date()
            await pancakeUser.model.save()
        })
    }

    getActionToken(actionType){
        let actionTokenUUID = uuid4()
        // asyc потому что пользователь может не создаться
        this.queue.push(async function (previousResult, pancakeUser) {
            await ActionToken.create({token: actionTokenUUID, user_uuid: pancakeUser.uuid, type: actionType})
        })
        return actionTokenUUID
    }

    async checkActionToken(actionType, token){
        let actionToken = await ActionToken.findOne({where:{user_uuid: this.uuid, token: token, type: actionType}})
        if (actionToken === null){
            return false
        } else {
            await actionToken.destroy()
            return true
        }
    }

    clientConnect(luid) {
        this.sendTicket("ClientConnect", {luid: luid})

    }

    sendTicket(type, data) {
        // Add UTMS and User UUID in Ticket
        this.queue.push(async function (previousResult, pancakeUser) {
            data['user_id'] = pancakeUser.uuid
            let ticket = await saveAndSend(type, data)
            return ticket
        })
    }

    setSelfInCookie() {
        this.ctx.cookies.set(USER_COOKIE_KEY, this.uuid, {
            httpOnly: false,
            domain: config.cookie.domain,
            maxAge: 9 * 365 * 24 * 60 * 60 * 1000
        })
    }

    runAsyncTask() {
        this.queue.do()
    }

    async getPendingAuth1C(){
        if (this.ctx.cookies.get(PENDING_TOKEN_KEY)){
            let pendingToken = await PendingToken.findOne({where: {key: this.ctx.cookies.get(PENDING_TOKEN_KEY)}})
            if (pendingToken){
                let token
                if (pendingToken.init == false){
                    pendingToken.init = true
                    await pendingToken.save()
                    token = this.createAuth1C(pendingToken)
                } else {
                    token = {token: pendingToken.token, client_uuid: pendingToken.client_uuid, employee_uuid: pendingToken.employee_uuid, uuid: null}
                }
                return token
            }
        }
        return null
    }

    cleanPendingCookie(){
        if (this.ctx.cookies.get(PENDING_TOKEN_KEY)){
            this.ctx.cookies.set(PENDING_TOKEN_KEY, null, {domain: config.cookie.domain, maxAge: 0, path: '/', httpOnly: false})
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
                })
            }

            if (pendingToken.client_uuid) {
                await Client.findOrCreate({
                    where: {uuid: pendingToken.client_uuid}, defaults: {
                        uuid: pendingToken.client_uuid,
                        data: {},
                    }
                })
            }
            await Token.create({
                token: pendingToken.token,
                user_uuid: pancakeUser.uuid,
                employee_uuid: pendingToken.employee_uuid,
                client_uuid: pendingToken.client_uuid,
                active: true,
            })
            await pendingToken.destroy()
        })
        return {token: pendingToken.token, client_uuid: pendingToken.client_uuid, employee_uuid: pendingToken.employee_uuid, uuid: null}
    }

    async getAuth1C(){
        // Already received token
        if (this.auth1C.token !== null){
            return this.auth1C
        }
        // Get common auth1C
        let tokenModel = await Token.findOne({where: {active: true, user_uuid: this.uuid}})
        if (tokenModel) {
            this.auth1C = {
                uuid: tokenModel.uuid,
                token: tokenModel.token,
                client_uuid: tokenModel.client_uuid,
                employee_uuid: tokenModel.employee_uuid,
            }
        }
        // Get pending auth1C
        if (this.auth1C.token === null){
            let pendingAuth1C = await this.getPendingAuth1C()
            if (pendingAuth1C){
                this.auth1C = pendingAuth1C
            }
        } else {
            this.cleanPendingCookie()
        }
        return this.auth1C
    }

    async isFirstVisit(){
        if (this.isNew){
            return true
        } else {
            let visits = await Visit.findAndCountAll({'where': {'user_uuid': this.uuid}})
            if (visits && visits.count > 1){
                return false
            }
            return true
        }
    }

    async getAuth1CTask(){
        this.queue.push(async function (previousResult, pancakeUser) {
            if (pancakeUser.auth1C.uuid !== null){
                return pancakeUser.auth1C
            }
            let tokenModel = await Token.findOne({where: {active: true, user_uuid: pancakeUser.uuid}})

            if (tokenModel) {
                pancakeUser.auth1C = {
                    uuid: tokenModel.uuid,
                    token: tokenModel.token,
                    client_uuid: tokenModel.client_uuid,
                    employee_uuid: tokenModel.employee_uuid
                }
            }
        })
    }
}

module.exports = {PancakeUser}
