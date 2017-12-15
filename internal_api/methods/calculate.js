'use strict';
const api1c = require('api1c');

// {
//   "Method": "Client.Calculate",
//   "Param": {
//     "ClientID": "a831e753-6ffb-4515-9cf0-f528891a8694",
//     "Schedule": "1x_week",
//     "City": "moscow",
//     "Services": [{
//       "Service": "podderzhka",
//       "ServiceID": 0,
//       "Classes": [{
//         "Class": "space",
//         "ClassID": 0,
//         "Quantity": 1,
//         "Features": [{
//           "Feature": "square",
//           "Value": 40
//         }]
//       }]
//     }],
//     "Promocode": "1C the best"
//   }
// }
module.exports = async function (ctx) {
  const param = ctx.request.body.Param;
  const user = ctx.state.pancakeUser;
  param.City = user.city.keyword;
  const singleRequest = new api1c.SingleRequest1C(
    'Client.Calculate', // name
    param, // param
    null, // token
    user.uuid, // userUUID
    null, // ip
    null, // userAgent
    ctx
  );
  const response1C = await singleRequest.do();
  ctx.body = {
    Data: response1C,
    Success: true
  };
};