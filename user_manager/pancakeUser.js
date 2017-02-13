"use strict";
const {QueueAsync} = require('./queue')
const {models, ErrorCodes, ModelsError} = require('models');
const {User, UTMS, Visit, Phone} = models;
const config = require('config')
const uuid4 = require('uuid/v4')
const {taskEventCreate} = require('./task')
const {saveAndSend} = require('tickets')
const {URL} = require('url')


const USER_COOKIE_KEY = 'session_uid_dom'

let banRefererString = '(:?\\w+)' + '\\\.' + config.serverPath.domain.withoutCity.replace(/\./g, "\\\.") + '$'
let banRefererRegexp = new RegExp(banRefererString, 'g');

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
        this.track = {done: null, waiting: null, number: null}
        this.google_id = null
    }

    async sync() {
        let self = this

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
                needCreateUser = true;
            }
        }
        if (needCreateUser) {
            this.uuid = uuid4()
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
            let utm_list = await UTMS.findAll({where: {user_uuid: this.uuid,}})
            utm_list = utm_list || []
            this._utms = utm_list
            return utm_list
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
        let referer = new URL(this.ctx.headers.referer);
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
        if (this.track.number !== null && this.track.number !== undefined) {
            return
        }
        let phone = await Phone.findOne({where: {city_id: this.city.id, living: false, active: true}})
        if (phone !== null) {
            this.track.number = phone.number
            this.queue.push(async function (previousResult, pancakeUser) {
                pancakeUser.model.set('data.track.number', pancakeUser.track.number);
                await pancakeUser.model.save()
                phone.user_uuid = pancakeUser.uuid
                await phone.save()
                return phone
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
}

module.exports = {PancakeUser}
