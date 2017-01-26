'use strict';

const winston = require('winston')
const config = require('config');

module.exports = module => {
    return makeLogger(module)
}

function makeLogger(module) {

    const path = module.filename.split('/').slice(-2).join('/')

    let transports = [

        new winston.transports.File({
            timestamp: true,
            filename: 'log/info.log',
            level: 'debug',
            label: path,
            json: false,
            maxFiles: 5,
            maxsize: 100000000,
        }),
    ]

    if (config.app.debug){
        transports.push(new winston.transports.Console())
    }
    return new winston.Logger({transports: transports})
}