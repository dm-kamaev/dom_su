"use strict";
const config = require('config');
const Handlebars = require('handlebars');
const fsSync = require('fs')
const fs = require('fs-promise')


const templateMap = {}

function getTemplate (opts) {
    if (!templateMap[opts.name] || config.app.debug){
        try {
            let html = fsSync.readFileSync(opts.path, 'utf-8')
            templateMap[opts.name] = Handlebars.compile(html)
        } catch (e){
            throw e
        }
    }
    return templateMap[opts.name]
}

async function loadTemplate(opts) {
    let html = await fs.readFile(opts.path, 'utf-8')
    templateMap[opts.name] = Handlebars.compile(html)
}


module.exports = {
    getTemplate,
    loadTemplate,
}