'use strict';

const wf = require('/p/pancake/my/wf.js');

module.exports = async function (ctx) {
  const body = await wf.read('/p/clientPA/template/index.html');
  ctx.status = 200;
  ctx.body = body;
};