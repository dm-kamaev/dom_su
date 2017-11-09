
const Router = require('koa-router');
const { Method1C, Request1C } = require('api1c/lib1C.js');
const decorators = require('staff/decorators.js');

const router = module.exports = new Router();

// proxy request from frontend to auth1C and return responce
// url –– /proxy_request/Employee.GetConversationList
// responce –– {
//   "name": "Employee.GetConversationList",
//   "param": {
//     "EmployeeID": "e7958b5e-360e-11e2-a60e-08edb9b907e8"
//   },
//   "response": {
//     "EmployeeID": "e7958b5e-360e-11e2-a60e-08edb9b907e8",
//     "Begin": true,
//     "End": true,
//     "ConversationList": [{
//       "Date": "2017-11-09T11:40:38Z",
//       "TimeZone": "+03:00",
//       "ConversationID": "ce078ca2-c542-11e7-84bd-1c1b0dc62163",
//       …
//     }, {
//       "Date": "2017-11-01T14:53:50Z",
//       "TimeZone": "+03:00",
//       "ConversationID": "747b480b-bf14-11e7-84bd-1c1b0dc62163",
//       …
//     }]
//   },
//   "error": null
// }
router.post('/proxy_request/:methodName', decorators.loginRequired(async function (ctx, next) {
  const methodName = ctx.params.methodName;
  const data = ctx.request.body;
  const method1C = new Method1C(methodName, data);
  const user = ctx.state.pancakeUser;
  const request1C = new Request1C(user.auth1C.token, user.uuid);
  request1C.add(method1C);
  await request1C.do();

  ctx.body = method1C;
}));
