
'use strict';

// USER FOR ALL ROBOTS

// const db = require('/p/pancake/my/db2.js');
const { sequelize, User } = require('/p/pancake/models/models.js');

const robot_user = exports;

const ROBOT_UUID = '59128f09-7e43-48b1-a35a-593106cff419';

// const ROBOT_UUID = '121c1cdc-fca3-415b-856c-fec4d831585f';
// const ROBOT_USER = null;

// check robots by user-agent
robot_user.its_robot = function (ctx) {
  const user_agent = ctx.request.headers['user-agent'] || '';
  if (!user_agent) {
    return false;
  }
  return /bot/ig.test(user_agent);
};


robot_user.get_user_uuid = function () {
  return ROBOT_UUID;
};


robot_user.create_user_in_db = async function () {
  try {

    // {
    //   uuid: '121c1cdc-fca3-415b-856c-fec4d831585f',
    //   data: {
    //     city: 'moscow',
    //     track: {
    //       done: true,
    //       waiting: false,
    //       numbers: {}
    //     },
    //     google_id: '',
    //     first_visit: false
    //   },
    //   last_action: 2017 - 12 - 26 T14: 50: 24.546 Z,
    //   current_phone: null,
    //   last_client_id: null,
    //   its_robot: false,
    //   createdAt: 2017 - 02 - 27 T10: 21: 48.696 Z,
    //   updatedAt: 2017 - 12 - 26 T14: 50: 24.546 Z
    // }

    const date = new Date();
    await User.create({
      uuid: ROBOT_UUID,
      data: {
        city: 'moscow',
        track: {
          done: null,
          waiting: null,
          numbers: {},
          applicant_numbers: {}
        },
        google_id: null,
        ab_test: {},
        first_visit: false,
      },
      last_action: date,
      current_phone: null,
      last_client_id: null,
      its_robot: true,
      createdAt: date,
      updatedAt: date,
    });
  } catch (err) {
    throw err;
  }
};


robot_user.exist_user_in_db = async function () {
  try {

    let res = await User.findOne({
      where: {
        uuid: ROBOT_UUID,
        its_robot: true,
      },
    });
    return Boolean(res);
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// if (!module.parent) {
//   void async function () {
//     await robot_user.exist_user_in_db();
//   }();
// }
