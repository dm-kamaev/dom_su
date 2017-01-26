'use strict';
let { Method1C, Request1C } = require('./lib1C.js')
//let { FilePath }= require('models/filePath')
let { Token, FilePath }= require('models')
let { magicUrl } = require('utils')
let { UUID } = require('utils')
const fs = require('fs');
let errors = require('./errors')
let mcClient = require('mcClient')
let moment = require('moment')
let log = require('log')(module)

const emptyToken = null



let common = {
    GetCode(phone, meta){
        let GetCode = new Method1C('Auth.GetCode', {Phone: phone});
        let request1C = new Request1C(emptyToken, meta.ip, meta.ua);
        request1C.add(GetCode)
        return request1C.do().then(
            () => {
                if (GetCode.response) {
                    return {}
                }
            }
        )
    },

    Proxy(meta, method, param){
        var method = new Method1C(method, param)
        const token = meta.token ? meta.token.token : emptyToken
        let request1C = new Request1C(token, meta.ip, meta.ua);
        request1C.add(method)
        return request1C.do().then(
            () => {
                if (method.response) {
                    return {
                        Success: true,
                        Data: method.response
                    }
                } else {
                    return { Success: false, ErrorCode: method.error.code }
                }
            }
        )
    },

    ActionLink(meta, action){
        const ActionLink = new Method1C('Common.ActionLink', action)
        const request1C = new Request1C(emptyToken, meta.ip, meta.ua);
        request1C.add(ActionLink)
        return request1C.do()
            .catch( err => {
                log.error(err)
            })
    },

    MoreAuth(login, password, meta, isMobile) {
        let Authorization = new Method1C('Auth.Login', {Phone: login, Code: password});
        let GetCommon = new Method1C('Client.GetCommon');
        let GetDepartureList = new Method1C('Client.GetDepartureList', {Filter: {Status: "Active"}});
        let GetDeparture = new Method1C('Client.GetDeparture');
        let GetSchedule = new Method1C('Client.GetScheduleNEW');
        let request1C = new Request1C(emptyToken, meta.ip, meta.ua);
        request1C.add(Authorization, GetCommon, GetDepartureList, GetDeparture, GetSchedule)
        return request1C.do()
            .then(() => {
                if (Authorization.response) {
                    return Token.activate(Authorization.response.ClientID, Authorization.response.EmployeeID, Authorization.response.Token)
                        .then(token => {
                            let redirectPath = new magicUrl().address(GetDepartureList.response.ObjectID)
                            if (GetDeparture.response && !isMobile) {
                                redirectPath.order(GetDeparture.response.DepartureID)
                            } else if (GetSchedule.response && !isMobile) {
                                redirectPath.schedule(GetSchedule.response.ObjectID)
                            }
                            let memKey = UUID()
                            return {
                                token: token,
                                redirectPath: redirectPath,
                                memKey: memKey
                            }
                        })
                        .then(result => {
                            return new Promise((reslove, reject) => {mcClient.setValue(result.memKey, JSON.stringify({
                                GetDepartureList: GetDepartureList,
                                GetCommon: GetCommon,
                                GetDeparture: GetDeparture,
                                GetSchedule: GetSchedule
                            }), 1000, reslove, reject, result)
                        })
                        .catch(err => {
                            log.error(err)
                            return new Promise((reslove, reject) => {
                                reslove(err.oldResult)
                            })
                        })
                    })
                } else {
                    return {errorCode: Authorization.error.code}
                }
            }
        )
    },

    redirectClient (meta, isMobile){
        let request1C = new Request1C(meta.token.token, meta.ip, meta.ua);
        let GetCommon = new Method1C('Client.GetCommon', {ClientID: meta.token.clientId});
        let GetDepartureList = new Method1C('Client.GetDepartureList', {Filter: {Status: "Active"}});
        let GetDeparture = new Method1C('Client.GetDeparture');
        let GetSchedule = new Method1C('Client.GetScheduleNEW');
        request1C.add(GetCommon, GetDepartureList, GetDeparture, GetSchedule)
        return request1C.do()
        .then( () => {
            request1C.methods.forEach(function(method){
                if (method.error && method.name != 'Client.GetDeparture' && method.name != 'Client.GetScheduleNEW'){
                    throw new errors.API1CError(method.error.text, meta.token, `${method.name}.error - ${JSON.stringify(method.error)} | ${method.name}.param - ${JSON.stringify(method.param)}`)
                }
            })
            let redirectPath = new magicUrl().address(GetDepartureList.response.ObjectID)
            if (GetDeparture.response && !isMobile) {
                redirectPath.order(GetDeparture.response.DepartureID)
            } else if (GetSchedule.response && !isMobile) {
                redirectPath.schedule(GetSchedule.response.ObjectID)
            }
            return { redirectPath: redirectPath }
        })
     },

    GetFile(meta, fileId) {
        const GetFile = new Method1C('GetFile', {FileID: fileId});
        const request1C = new Request1C(meta.token.token, meta.ip, meta.ua);
        request1C.add(GetFile)
        return request1C.do()
            .then(result => {
                request1C.methods.forEach(function(method){
                    if (method.error){
                        throw new errors.API1CError(method.error.text, meta.token, `${method.name}.error - ${JSON.stringify(method.error)} | ${method.name}.param - ${JSON.stringify(method.param)}`)
                    }
                })
                const content = new Buffer(GetFile.response.FileB64, 'base64')

                fs.writeFile(new magicUrl().getMediaPath(`${fileId}.${GetFile.response.Type}`), content, function(err) {
                    if(err) {
                        log.error(err)
                    }
                    FilePath.make(fileId,`/${fileId}.${GetFile.response.Type}`)
                        .catch(err => {
                            log.error(err)
                        })
                });
                return {mimeType: GetFile.response.TypeMIME, file: content}
            })
    },

    getPromoCode (meta, clientId) {
        const request1C = new Request1C(emptyToken, meta.ip, meta.ua);
        const GetPromoCode = new Method1C('Client.GetPromoCode', {ClientID: clientId})
        request1C.add(GetPromoCode)
        return request1C.do()
            .then(result => {
                request1C.methods.forEach(function(method){
                    if (method.error){
                        throw new errors.API1CError(method.error.text, meta.token, `${method.name}.error - ${JSON.stringify(method.error)} | ${method.name}.param - ${JSON.stringify(method.param)}`)
                    }
                })
                return {
                        PromoCode: GetPromoCode.response.PromoCode
                }
            })
    }
}

module.exports = common