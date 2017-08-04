"use strict";

const config = require('config');
const Sequelize = require('sequelize')
const sequelize = new Sequelize(`postgres://${config.db.user}:${config.db.password}@${config.db.host}:5432/${config.db.database}`, {logging: false});
const schedule = require('node-schedule');
const logger = require('logger')(module)
const loggerPay = require('logger')(module, 'pay.log')
const { models } = require('models')
const { User, Ticket, UTMS, Payment } = models
const { sendTicket, saveAndSend } = require('tickets')
const { getState } = require('payments')
const moment = require('moment')

const MAX_STAGNATION_VISIT_MINUTE = 15;
const MAX_STAGNATION_TAKE_NUMBER_MINUTE = 10;
const MAX_STAGNATION_ACTION_TOKEN_MINUTE = 2 * 24 * 60;
const CRON_VISIT = 1;
const CRON_NUMBER = 1;
const CRON_TICKET = 1;
const CRON_PAYMENT = 1;
const CRON_ACTION_TOKEN = 20;

// TODO ERROR HANDLER

function setVisitFinish() {
    sequelize.query(
        "UPDATE visits " +
        "SET active = False, " +
          '"end" = NOW() ' +
        "FROM users " +
        "WHERE visits.active is True AND " +
              "visits.user_uuid = users.uuid AND " +
              `users.last_action < (NOW() - INTERVAL '${MAX_STAGNATION_VISIT_MINUTE} minutes') ` +
        "RETURNING visits.uuid, visits.user_uuid; "
    )
        .spread(async function(results, metadata) {
            if (results.length > 0){
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
        "UPDATE phones " +
        "SET (living) = (false)" +
        "FROM users " +
        "WHERE " +
            "phones.living IS True AND " +
            "users.uuid = phones.user_uuid AND " +
            `users.last_action < (NOW() - INTERVAL '${MAX_STAGNATION_TAKE_NUMBER_MINUTE} minutes')` +
        "RETURNING phones.user_uuid"
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
            }
        })
}

async function checkPayments() {
    let payments
    try{
         payments = await Payment.findAll({where: {
            initial: true,
            notification: true,
            success: false,
            createdAt: {
                // last 3 hour
                $gt: new Date(new Date() - 1000*60*60*3)
            }}
        })
        if (payments !== null){
            for (let payment of payments){
                let paymentState = await getState(payment.PaymentId)
                if (['CONFIRMING', 'CONFIRMED'].indexOf(paymentState) > 0){
                    loggerPay.info(`SCHEDULE Bank Check State - Success | Status - ${paymentState} | OrderId - ${payment.id} `)
                    try {
                        let data = {};
                        data['OrderId'] = payment.OrderId
                        data['Amount'] = payment.Amount
                        data['Description'] = payment.Description
                        data['PaymentOrgType'] = payment.payment_org_type
                        data['id'] = payment.id
                        data['date'] = moment.parseZone(moment(payment.create_time).utcOffset("+03:00").format('YYYY-MM-DDTHH:mm:ssZ')).format('YYYY-MM-DDTHH:mm:ss') + 'Z'
                        data['PaymentId'] = payment.PaymentId
                        // TODO add user_uuid field in payments
                        // data['user_id'] = ctx.state.pancakeUser.uuid
                        try{
                            await saveAndSend('PaymentSuccess', data)
                        } catch (e){
                            loggerPay.error(`SCHEDULE Tickets are not sent ${JSON.stringify(data)}`)
                        }
                        payment.success = true
                        await payment.save()
                        loggerPay.info(`SCHEDULE Payment Success Completed OrderId - ${payment.OrderId} | Id - ${payment.id}`)
                    } catch (e){
                        loggerPay.error(e)
                    }
                } else {
                    loggerPay.error(`SCHEDULE Bank Check State - Failure | Status - ${paymentState} | Id - ${payment.id}`)
                }
            }
        }
    } catch (e){
        logger.info(e)
    }
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

async function deleteOldActionToken() {
    await sequelize.query(
        'DELETE FROM action_token ' +
        `WHERE "createdAt" < (NOW() - INTERVAL '${MAX_STAGNATION_ACTION_TOKEN_MINUTE} MINUTES');`
    )
}

module.exports = () => {

    let taskVisit = schedule.scheduleJob(`*/${CRON_VISIT} * * * *`, function(){
      setVisitFinish()
    });
    logger.info('Schedule - CLOSE VISIT  - START')

    let taskPhoneNumber = schedule.scheduleJob(`*/${CRON_NUMBER} * * * *`, function () {
        cleanPhoneNumber()
    })
    logger.info('Schedule - CLEAN NUMBER - START')

    let taskTicket = schedule.scheduleJob(`*/${CRON_TICKET} * * * *`,async function () {
        await sendForgottenTicket()
    })
    logger.info('Schedule - SEND TICKET - START')

    let taskPayments = schedule.scheduleJob(`*/${CRON_PAYMENT} * * * *`,async function () {
        await checkPayments()
    })

    let taskActionToken = schedule.scheduleJob(`*/${CRON_ACTION_TOKEN} * * * *`,async function () {
        await deleteOldActionToken()
    })
    logger.info('Schedule - CLEAN ACTION TOKEN - START')

    logger.info('Schedule - CHECK PAYMENTS - START')
}