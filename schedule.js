"use strict";

const config = require('config');
const Sequelize = require('sequelize')
const sequelize = new Sequelize(`postgres://${config.db.user}:${config.db.password}@${config.db.host}:5432/${config.db.database}`, {logging: false});
const schedule = require('node-schedule');
const logger = require('logger')(module)
const { models, ErrorCodes, ModelsError, scrollModel } = require('models')
const { User, Ticket, UTMS } = models
const { sendTicket } = require('tickets')

const MAX_STAGNATION_VISIT_MINUTE = 15;
const MAX_STAGNATION_TAKE_NUMBER_MINUTE = 10;
const CRON_VISIT = 1;
const CRON_NUMBER = 1;
const CRON_TICKET = 1;

// TODO ERROR HANDLER

function setVisitFinish() {
    sequelize.query(
        "UPDATE visits " +
        'SET (active, "end") = ' +
        "(False, NOW()) " +
        "WHERE uuid IN " +
            "(SELECT DISTINCT visit_uuid " +
            "FROM events " +
            "WHERE events.visit_uuid IN " +
                "(SELECT uuid FROM visits as v WHERE active is True) " +
            "GROUP BY visit_uuid " +
            `HAVING	MAX(date) < (NOW() - INTERVAL '${MAX_STAGNATION_VISIT_MINUTE} minutes')) ` +
        "RETURNING uuid, user_uuid"
    )
        .spread(async function(results, metadata) {
            if (results.length > 0){
                logger.info(`schedule CLOSE visit ${JSON.stringify(results)}`)
                for (let user_data of results){
                    let user = await User.findOne({where:{uuid: user_data.user_uuid}})
                    user.set('data.first_visit', false)
                    await user.save()
                }
            }
        })
}

function cleanPhoneNumber() {
    sequelize.query(
            "SELECT DISTINCT user_uuid " +
            "FROM visits " +
            "WHERE visits.uuid IN " +
                "(SELECT DISTINCT visit_uuid " +
                "FROM events " +
                "WHERE events.visit_uuid IN " +
                    "(SELECT uuid " +
                    "FROM visits " +
                    "WHERE user_uuid IN " +
                        "(SELECT user_uuid FROM phones WHERE living IS True)) " +
                "GROUP BY visit_uuid " +
                `HAVING	MAX(date) < (NOW() - INTERVAL '${MAX_STAGNATION_TAKE_NUMBER_MINUTE} minutes')) `
    )
        .spread(async function(results, metadata) {
            if (results.length > 0){
                let user_uuid_list = []
                for (let item of results){
                    //logger.info(`kill track session | uuid - ${item.user_uuid}`)
                    user_uuid_list.push(item.user_uuid)
                    let user = await User.findOne({where: {uuid: item.user_uuid}})
                    user.set('data.track.numbers', {})
                    await user.save()
                }
                sequelize.query("UPDATE phones " +
                    "SET (living) = (false) " +
                    "WHERE user_uuid IN " +
                    `('${user_uuid_list.join('\',\'')}')`)
            }
        })
}

async function sendForgottenTicket() {
    let ticket;
    try {
        ticket = await Ticket.findOne({where: {isSend: false}, order: [['id', 'DESC']]})
        if (ticket != null){
            let user = null;
            let utms = null;
            if (ticket.data.user_id){
                user = await User.findOne({where: {uuid: ticket.data.user_id}})
            }
            if (user !== null){
                utms = await UTMS.findAll({where: {user_uuid: user.uuid,}})
            }
            let response = await sendTicket(ticket.buildMessage(utms))
            if (response.result == 'ok'){
                ticket.isSend = true
                await ticket.save()
            }
        }
    } catch (e){
        logger.error(`ERROR Send Forgotten ticket ${JSON.stringify(ticket)}`)
        logger.error(e)
    }

}

module.exports = () => {
    logger.info('Schedule - CLOSE VISIT  - START')
    let taskVisit = schedule.scheduleJob(`*/${CRON_VISIT} * * * *`, function(){
      setVisitFinish()
    });

    logger.info('Schedule - CLEAN NUMBER - START')
    let taskPhoneNumber = schedule.scheduleJob(`*/${CRON_NUMBER} * * * *`, function () {
        cleanPhoneNumber()
    })

    logger.info('Schedule - SEND TICKET - START')
    let taskTicket = schedule.scheduleJob(`*/${CRON_TICKET} * * * *`,async function () {
        await sendForgottenTicket()
    })

}