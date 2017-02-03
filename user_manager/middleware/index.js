"use strict";

const {setUserUUID} = require('./setUserUUID');
const {setUserVisit} = require('./setUserVisit');
const {createEventRequest} = require('./eventCreator');


module.exports = {setUserUUID: setUserUUID, setUserVisit: setUserVisit, createEventRequest: createEventRequest}