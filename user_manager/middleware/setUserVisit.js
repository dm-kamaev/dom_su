'use strict';


async function setUserVisit(ctx, next) {
    ctx.state.pancakeUser.setVisit()
    await next()
}
module.exports = {setUserVisit: setUserVisit}

