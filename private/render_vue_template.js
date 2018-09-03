'use strict';

const wf = require('/p/pancake/my/wf.js');

module.exports = async function (ctx) {
  const body = await wf.read('/p/pancake/templates/client_pa/index.html');
  ctx.status = 200;
  ctx.body = body;
};