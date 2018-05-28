'use strict';

const robot_user = require('/p/pancake/user_manager/robot_user.js');

async function setUserVisit(ctx, next) {
  if (!robot_user.its_robot(ctx)) {
    ctx.state.pancakeUser.setVisit();
  }
  await next();
}
module.exports = {
  setUserVisit: setUserVisit
};

