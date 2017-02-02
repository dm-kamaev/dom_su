'use strict';
let { Method1C, Request1C } = require('./lib1C.js')
let moment = require('moment')
//let mcClient = require('mcClient')
let errors = require('./errors')
let { cachedRequest, magicUrl } = require('utils')
let log = require('logger')(module)
const { PromoCode }= require('models')



let client = {

    address(meta, needCommon, filter, nav){
        let GetCommon = new Method1C('Client.GetCommon', {ClientID: meta.token.clientId});
        let GetDepartureList = new Method1C('Client.GetDepartureList', {
            ClientID: meta.token.clientId,
            Filter: filter,
            Nav: nav
        });
        let request1C = new Request1C(meta.token.token, meta.ip, meta.ua);
        if (needCommon){
            request1C.add(GetCommon)
        }
        request1C.add(GetDepartureList)
        return request1C.do()
            .then(result => {
                request1C.methods.forEach(function(method){
                    if (method.error){
                        throw new errors.API1CError(method.error.text, meta.token, `${method.name}.error - ${JSON.stringify(method.error)} | ${method.name}.param - ${JSON.stringify(method.param)}`)
                    }
                })
                return {
                    GetCommon: GetCommon,
                    GetDepartureList: GetDepartureList
                }
        })
    },

    addressSchedule(meta, needCommon, objectId, ScheduleOrbjectId){
        let GetCommon = new Method1C('Client.GetCommon', {ClientID: meta.token.clientId});
        let GetDepartureList = new Method1C('Client.GetDepartureList', {
                ClientID: meta.token.clientId,
                Filter: {
                    ObjectID: objectId,
                    Status: "Active"
                },
                Nav: {
                    Direction: -1,
                    Count: 20,
                    ObjectID: null
                }
            });
        let GetSchedule = new Method1C('Client.GetScheduleNEW', {ClientID: meta.token.clientId, ObjectID: ScheduleOrbjectId});
        let request1C = new Request1C(meta.token.token, meta.ip, meta.ua);
        if (needCommon){
            request1C.add(GetCommon)
        }
        request1C.add(GetDepartureList, GetSchedule);
        return request1C.do().then(result => {
            request1C.methods.forEach(function(method){
                if (method.error){
                    throw new errors.API1CError(method.error.text, meta.token, `${method.name}.error - ${JSON.stringify(method.error)} | ${method.name}.param - ${JSON.stringify(method.param)}`)
                }
            })
            return {
                GetDepartureList: GetDepartureList,
                GetCommon: GetCommon,
                GetSchedule: GetSchedule
            }
        })
    },

    addressOrder(meta, needCommon, filter, nav, objectId, departureId){
        let GetCommon = new Method1C('Client.GetCommon', {ClientID: meta.token.clientId});
        let GetDepartureList = new Method1C('Client.GetDepartureList', {
            ClientID: meta.token.clientId,
            Filter: filter,
            Nav: nav
        });
        let GetDeparture = new Method1C('Client.GetDeparture', {DepartureID: departureId})
        let GetSchedule = new Method1C('Client.GetScheduleNEW', {ObjectID: objectId})
        let request1C = new Request1C(meta.token.token, meta.ip, meta.ua);
        if (needCommon){
            request1C.add(GetCommon)
        }
        request1C.add(GetDepartureList, GetDeparture, GetSchedule)
        return request1C.do()
            .then(result => {
                request1C.methods.forEach(function(method){
                    if (method.error && method.name != 'Client.GetScheduleNEW'){
                        throw new errors.API1CError(method.error.text, meta.token, `${method.name}.error - ${JSON.stringify(method.error)} | ${method.name}.param - ${JSON.stringify(method.param)}`)
                    }
                })
                PromoCode.checkAndCreate(meta.token.clientId, GetDeparture.response.OrderNumber)
                return {
                    GetDepartureList: GetDepartureList,
                    GetCommon: GetCommon,
                    GetDeparture: GetDeparture,
                    GetSchedule: GetSchedule
                }
            })
    },

    forMenu(meta){
        if (meta.token) {
            let request1C = new Request1C(meta.token.token, meta.ip, meta.ua);
            let GetCommon = new Method1C('Client.GetCommon', {ClientID: meta.token.clientId});
            request1C.add(GetCommon)
            return request1C.do()
                .then( () => {
                    request1C.methods.forEach(function(method){
                        if (method.error){
                            //throw new errors.API1CError('The request ended in failure', meta.token.token, 'The request ended in failure', 500)
                            //return
                            throw new errors.API1CError(method.error.text, meta.token, `${method.name}.error - ${JSON.stringify(method.error)} | ${method.name}.param - ${JSON.stringify(method.param)}`)
                        }
                    })
                    return {
                        ordersUrl: new magicUrl('private').getRedirectLastOrderUrl(),
                        GetCommon: GetCommon,
                    }
                })
        } else {
            return {
                ordersUrl: new magicUrl('private').getRedirectLastOrderUrl(),
                GetCommon: {response : ""}
            }
        }
    },

    order (meta, departureID){
        let request1C = new Request1C(meta.token.token, meta.ip, meta.ua);
        let GetDeparture = new Method1C('Client.GetDeparture', {DepartureID: departureID});
        request1C.add(GetDeparture);
        return request1C.do().then(
            () => {
                if (GetDeparture.response){
                    return {
                        Success: true,
                        Data: {
                            DepartureData: GetDeparture.response
                        }
                    }
                } else {
                    return {
                        Success: false,
                        ErrorCode: GetDeparture.error.code
                    }
                }
            }
        )
    },

    schedule (meta, ObjectID){
        let request1C = new Request1C(meta.token.token, meta.ip, meta.ua);
        let GetSchedule = new Method1C('Client.GetScheduleNEW', {ObjectID: ObjectID});
        request1C.add(GetSchedule);
        return request1C.do().then(
            () => {
                if (GetSchedule.response){
                    return {
                        Success: true,
                        Data: {
                            ScheduleData: GetSchedule.response
                        }
                    }
                } else {
                    return {
                        Success: false,
                        ErrorCode: GetSchedule.error.code
                    }
                }
            }
        )
    },

    callbackPhone (name, phone, user_id) {
        let request1C = new Request1C();
        let PostCallBack = new Method1C('Client.PostCallBack', {name: name, phone: phone, user_id: user_id})
        request1C.add(PostCallBack )
        return request1C.do().then(
            () => {
                if (PostCallBack.response) {
                    return {
                        Success: true,
                        Data: {
                            Result: true
                        }
                    }
                } else
                    return {
                        Success: false,
                        ErrorCode: PostCallBack.error.code
                    }
            }
        )
    },

    review (departureID, note, scores) {
        let request1C = new Request1C();
        let SetOrderReview = new Method1C('Client.SetOrderReview', {departureID: departureID, note: note, scores: scores})
        request1C.add(SetOrderReview)
        return request1C.do().then(
            () => {
                if (SetOrderReview.response) {
                    return {
                        Success: true,
                        Data: {
                            Result: true
                        }
                    }
                } else
                    return {
                        Success: false,
                        ErrorCode: SetOrderReview.error.code
                    }
            }
        )
    }

}


module.exports = client

