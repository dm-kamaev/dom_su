'use strict';

const { staffRouter } = require('./router');
const { staffServiceRouter } = require('./serviceRouter');
const { staffUrl, staffTemplate } = require('./utils');


module.exports = {
  staffRouter,
  staffUrl,
  staffTemplate,
  staffServiceRouter,
};