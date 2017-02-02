"use strict";

const Sequelize = require('sequelize')
const sequelize = new Sequelize('postgres://domovenok:domovenokPG@localhost:5432/pancake', {});
const schedule = require('node-schedule');
const logger = require('logger')(module)

const MAX_STAGNATION_VISIT_MINUTE = 15;
const CRON_MINUTE = 1;

function setVisitFinish() {
    sequelize.query(
        "UPDATE visits " +
        "SET active = False " +
        "WHERE uuid IN " +
            "(SELECT DISTINCT visit_uuid " +
            "FROM events " +
            "WHERE events.visit_uuid IN " +
                "(SELECT uuid FROM visits as v WHERE active is True) " +
            "GROUP BY visit_uuid " +
            `HAVING	MAX(date) < (NOW() - INTERVAL '${MAX_STAGNATION_VISIT_MINUTE} minutes')) ` +
        "RETURNING uuid"
    )
        .spread(function(results, metadata) {
            if (results.length > 0){
                logger.info(`schedule CLOSE visit ${JSON.stringify(results)}`)
            }
        })
}

module.exports = ()=> {
    logger.info('start')
    let task = schedule.scheduleJob(`*/${CRON_MINUTE} * * * *`, function(){
      setVisitFinish()
    });
}