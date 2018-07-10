'use strict';

const config = require('config');
const Handlebars = require('handlebars');
const fsSync = require('fs');
const wf = require('/p/pancake/my/wf.js');


const templateMap = {};

function getTemplate(opts) {
  if (!templateMap[opts.name] || config.app.debug) {
    try {
      let html = fsSync.readFileSync(opts.path, 'utf-8');
      templateMap[opts.name] = Handlebars.compile(html);
    } catch (e) {
      throw e;
    }
  }
  return templateMap[opts.name];
}

async function loadTemplate(opts) {
  const html = await wf.read(opts.path);
  templateMap[opts.name] = Handlebars.compile(html);
}


module.exports = {
  getTemplate,
  loadTemplate,
};