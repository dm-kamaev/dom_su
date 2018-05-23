'use strict';


async function setUserVisit(ctx, next) {
  const user_agent = ctx.request.headers['user-agent'] || '';
  if (!/bot/ig.test(user_agent)) {
    ctx.state.pancakeUser.setVisit();
  }
  await next();
}
module.exports = {
  setUserVisit: setUserVisit
};

