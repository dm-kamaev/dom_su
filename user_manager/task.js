'use strict';

const models = require('/p/pancake/models/models.js');
// const { Event } = models;
const { sequelize } = models;
const uuid4 = require('uuid/v4');
const { eventType } = require('./event_type');
const logger = require('/p/pancake/lib/logger.js');

function taskEventCreate (opts) {
  let { type, data} = opts;
  if (type == undefined){
    throw new Error();
  }
  return async function (previousResult, pancakeUser) {

    if (pancakeUser.is_robot) {
      return;
    }
    // auth_data (uuid, client_id, employee_id, token) VALUES ($1, $2, $3, $4);'
    // let res;
    const event_uuid = uuid4();
    try {
      const date = new Date();
      await sequelize.query(`
        INSERT INTO
          events
          (uuid, visit_uuid, data, type, date, "createdAt", "updatedAt")
        VALUES (:uuid, :visit_uuid, :data, :type, :date, :createdAt, :updatedAt)
      `, {
        replacements: {
          uuid: event_uuid,
          visit_uuid: pancakeUser.visit_uuid,
          data: JSON.stringify(data),
          type,
          date,
          createdAt: date,
          updatedAt: date,
        },
        type: sequelize.QueryTypes.SELECT,
        raw: true
      });
    } catch (err) {
      logger.warn(err);
    }
    // console.log('event_create=', res);
    // let event = await Event.create({
    //     uuid: event_uuid,
    //     visit_uuid: pancakeUser.visit_uuid,
    //     // token_uuid: pancakeUser.auth1C.uuid,
    //     data: data,
    //     type: type,
    //     date: new Date(),
    // });
    // console.log(event, data.headers);
    if (type == eventType.Request) {
      // pancakeUser.request_event_uuid = event.uuid
      pancakeUser.request_event_uuid = event_uuid;
    }
    // return event
  };
}

module.exports = {taskEventCreate: taskEventCreate};