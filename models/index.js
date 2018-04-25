'use strict';
const models = require('./models');
const {scrollModel, getLastId} = require('./utils');
const {ModelsError, ErrorCodes} = require('./errors');

module.exports = {models: models, ModelsError: ModelsError, ErrorCodes: ErrorCodes, scrollModel: scrollModel, getLastId: getLastId};