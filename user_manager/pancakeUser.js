"use strict";
const {QueueAsync} = require('./queue')
const {models, ErrorCodes, ModelsError} = require('models');
const {User, UTMS, Visit, Phone, Token} = models;
const config = require('config')
const uuid4 = require('uuid/v4')
const {taskEventCreate} = require('./task')
const {saveAndSend} = require('tickets')
const {URL} = require('url')
const validateUUID = require('uuid-validate');
const logger = require('logger')(module)
const moment = require('moment')


const USER_COOKIE_KEY = config.USER_COOKIE_KEY

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

class PancakeUser {
    constructor(ctx) {
        let self = this
        this.ctx = ctx
        this.queue = new QueueAsync(self)
        this._utms = null;
        this.model = null
        this.token_uuid = null
        this.visit_uuid = null
        this.request_event_uuid = null
        this.city = null;
        this.track = {done: null, waiting: null, numbers: {}}
        this.google_id = null
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
                let user = await User.create({
                    uuid: self.uuid,
                    data: {
                        city: self.ctx.cities.default.keyword,
                        track: self.track,
                        google_id: null,
                    }
                })
                pancakeUser.model = user
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
            logger.error(`ERROR parse referer url ${this.ctx.headers.referer}`)
            return false
        }
        banRefererRegexp.lastIndex = 0;
        if (banRefererRegexp.exec(referer.hostname) !== null) {
            return false
        }
        return true
        // TODO IP filter
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
        if (!this.ctx.request.body.google_id){
            return
        }
        let google_id = this.ctx.request.body.google_id
        if (this.google_id !== google_id){
            this.queue.push(async function (previousResult, pancakeUser) {
                    pancakeUser.model.set('data.google_id', google_id);
                    await pancakeUser.model.save()
                    return pancakeUser
            })
        }
    }

    async setVisit() {
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
    }

    clientConnect(luid) {
        this.sendTicket("ClientConnect", {luid: luid})

    }

    sendTicket(type, data) {
        // Add UTMS and User UUID in Ticket
        this.queue.push(async function (previousResult, pancakeUser) {
            let utms = await pancakeUser.getUtms()
            data['user_id'] = pancakeUser.uuid
            let ticket = await saveAndSend(type, data, utms)
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

    async getToken(){
        this.token = await Token.findOne({active: true, user_uuid: this.uuid})
        return this.token
    }
}

module.exports = {PancakeUser}
