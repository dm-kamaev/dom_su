'use strict';


async function definition_request_type(ctx, next) {
  if (ctx.headers['x-dom-service']){
    ctx.state.requestType = {service: true, user: false};
  } else {
    ctx.state.requestType = {service: false, user: true};
  }
  await next();
}

function is_not_user_request(ctx) {
  var requestType = ctx.state.requestType;
  if (!requestType) { // if request option
    return false;
  }
  return requestType.user !== true;
}

module.exports = {
  definitionRequestType: definition_request_type,
  is_not_user_request,
};