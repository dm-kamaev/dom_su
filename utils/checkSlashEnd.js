"use strict";
const http = require('http');
const https = require('https');
const config = require('config')

let options = {
    port: 443,
    method: 'GET',
    rejectUnauthorized: false
}


async function checkSlashEnd(ctx) {
    if (ctx.request.query.check_slash){
        return { result: false}
    }
    options.host = ctx.request.host
    let path = ctx.request.path
    if (ctx.request.path.slice(-1) == '/'){
        path = path.slice(0, -1)
    } else {
        path = path + '/'
    }
    if (ctx.request.querystring !== ''){
        path = path + '?' + ctx.request.querystring
    }
    let path_check = path
    if (ctx.request.querystring == ''){
        path_check = path + '?check_slash=true'
    } else {
        path_check = path + '&check_slash=true'
    }
    options.path = path_check
    let success = await new Promise((reslove, reject) => {
        let req = https.get(options, (res) => {
            if (res.statusCode == 200){
                reslove(true)
            } else {
                reslove(false)
            }
        })
        req.setTimeout(1000 * 20, function () {
            reject(new Error(`Request chackSlshEnd timeout error ${path_check}`))
        })
        req.on('error', (e) => {
            reject(new Error(`The request chackSlshEnd ended in failure ${path_check}`))
        })
        req.end()
    })
    if (success){
        return {result: true, path: path}
    } else {
        return { result: false}
    }
}

module.exports = {
    checkSlashEnd
}