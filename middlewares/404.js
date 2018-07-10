'use strict';

async function throw404(ctx, next) {
        await next()
        if (ctx.status === 404){
            ctx.throw(404)
        }
}

module.exports = {throw404: throw404}

