
'use strict';

// USER FOR ALL ROBOTS

// const db = require('/p/pancake/my/db2.js');

const robot_user = exports;

// check robots by user-agent
robot_user.its_robot = function (ctx) {
  const user_agent = ctx.request.headers['user-agent'] || '';
  if (!user_agent) {
    return false;
  }
  return /bot/ig.test(user_agent);
};


robot_user.get_user_data = function () {

};


robot_user.add_user_in_db = function () {

};


robot_user.exist_user_in_db = function () {

};