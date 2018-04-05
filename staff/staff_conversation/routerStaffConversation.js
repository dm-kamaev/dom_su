'use strict';

// WORK WITH STAFF CONVERSATION

const util = require('util');
const { models } = require('models');
const { EmployeeNews, Token, PendingToken } = models;
const Router = require('koa-router');
const logger = require('logger')(module, 'staff.log');
const loggerProblems = require('logger')(module, 'problems.log');
const config = require('config');

const { Method1C, Request1C } = require('api1c');
const { getTemplate } = require('utils');
const { staffUrl, isMobileVersion, toMoscowISO, staffTemplate } = require('staff/utils.js');
const uuid4 = require('uuid/v4');
const parseFormMultipart = require('koa-body')({multipart: true});
const { loginRequired, getEmployeeHeader } = require('staff/decorators');

const router = module.exports = new Router();


router.get('/staff/:EmployeeID/conversations/', loginRequired(getEmployeeHeader(async function(ctx, next, request1C, GetEmployeeData, templateCtx) {
  const request1CAPIV2 = new Request1C(ctx.state.pancakeUser.auth1C.token, ctx.state.pancakeUser.uuid, '', '', false, ctx);
  let GetConversationList = new Method1C('Employee.GetConversationList', {
    'EmployeeID': templateCtx.employeeId
  });
  request1CAPIV2.add(GetConversationList);
  request1CAPIV2.add(GetEmployeeData);
  await request1CAPIV2.do();
  /* templateCtx.GetConversationList –– {
      "EmployeeID": "e7958b5e-360e-11e2-a60e-08edb9b907e8",
      "Begin": true,
      "End": true,
      "ConversationList": [{
          "Date": "2017-11-01T14:53:50Z",
          "TimeZone": "+03:00",
          "ConversationID": "747b480b-bf14-11e7-84bd-1c1b0dc62163",
          "Subject": "gjhgjhg",
          "Status": "Активно",
          "Score": 0
      }]
  }*/
  GetConversationList.response.ConversationList.forEach((conversation, i) => {
    const score = parseInt(conversation.Score, 10) || 0;
    conversation.renderSelectScore = conversation.Status === 'Завершено' && score === 0;
    conversation.indexId = i + 1;
    conversation.Score = (score) ? score : null;
  });
  templateCtx.conversationList = GetConversationList.response.ConversationList;
  templateCtx.GetEmployeeData = GetEmployeeData.response;
  let template;
  if (isMobileVersion(ctx)) {
    template = getTemplate(staffTemplate.mobile.conversationList);
  } else {
    template = getTemplate(staffTemplate.desktop.conversationList);
  }
  ctx.body = template(ctx.proc(templateCtx, ctx));
})));


router.post('/staff/:EmployeeID/conversations/', parseFormMultipart, loginRequired(async function(ctx) {
  let salt = uuid4();
  const request1CAPIV2 = new Request1C(ctx.state.pancakeUser.auth1C.token, ctx.state.pancakeUser.uuid, '', '', false, ctx);
  let NewConversation = new Method1C('Employee.NewConversation', {
    'EmployeeID': ctx.state.pancakeUser.auth1C.employee_uuid,
    'Subject': ctx.request.body.fields.subject
  });
  request1CAPIV2.add(NewConversation);
  await request1CAPIV2.do();
  const twoRequest1CAPIV2 = new Request1C(ctx.state.pancakeUser.auth1C.token, ctx.state.pancakeUser.uuid, '', '', false, ctx);
  let SendMessage = new Method1C('SendMessage', {
    'Role': 2,
    'Content': ctx.request.body.fields.content,
    'Salt': salt.toString(),
    'AnswerToMessageID': null,
    'Linked': {
      'ID': NewConversation.response.ConversationID,
      'Type': 'Conversation'
    },
  });
  twoRequest1CAPIV2.add(SendMessage);
  await twoRequest1CAPIV2.do();
  ctx.redirect(staffUrl('conversationDetail', ctx.state.pancakeUser.auth1C.employee_uuid, NewConversation.response.ConversationID));
}));

// set score for conversation
// url –– /staff/ajax/conversations/747b480b-bf14-11e7-84bd-1c1b0dc62163/score/2'
router.post('/staff/ajax/conversations/:conversationId/score/:score', loginRequired(async function (ctx){
  const params = ctx.params || {};
  const conversationId = params.conversationId;
  const score = parseInt(params.score, 10);
  const hashScore = { 1: true, 2: true, 3: true, 4: true , 5: true };
  if (!conversationId) {
    ctx.body = { success: false, data: 'Not exist conversationId' };
  }
  let success = false;
  let data = 'Not valid score. Score can be: 1, 2, 3, 4, 5';
  let scoreConversation = null;
  if (hashScore[score]) {
    scoreConversation = new Method1C('Employee.ScoreConversation', {
      'ConversationID': conversationId,
      'Score': score
    });
    const user = ctx.state.pancakeUser;
    const request1C = new Request1C(user.auth1C.token, user.uuid, null, null, null, ctx);
    request1C.add(scoreConversation);
    await request1C.do();
    success = true;
  }
  ctx.body = scoreConversation;
}));


router.get('/staff/:EmployeeID/conversations/:ConversationID', loginRequired(getEmployeeHeader(async function(ctx, next, request1C, GetEmployeeData, templateCtx) {
  const request1CAPIV2 = new Request1C(ctx.state.pancakeUser.auth1C.token, ctx.state.pancakeUser.uuid, '', '', false, ctx);
  let GetConversationList = new Method1C('Employee.GetConversationList', {
    'EmployeeID': templateCtx.employeeId
  });
  let GetMessageList = new Method1C('GetMessageList', {
    'Count': 100,
    'Linked': {
      'ID': ctx.params.ConversationID,
      'Type': 'Conversation'
    }
  });
  request1CAPIV2.add(GetConversationList);
  request1CAPIV2.add(GetEmployeeData);
  request1CAPIV2.add(GetMessageList);
  let template;
  let conversationData = {};
  await request1CAPIV2.do();
  for (let conversation of GetConversationList.response.ConversationList) {
    if (conversation.ConversationID == ctx.params.ConversationID) {
      conversationData.ID = conversation.ConversationID;
      conversationData.Subject = conversation.Subject;
      conversationData.Status = conversation.Status;
    }
  }
  templateCtx.conversation = conversationData;
  templateCtx.GetEmployeeData = GetEmployeeData.response;
  templateCtx.GetMessageList = GetMessageList.response;
  if (isMobileVersion(ctx)) {
    template = getTemplate(staffTemplate.mobile.conversationDetail);
  } else {
    template = getTemplate(staffTemplate.desktop.conversationDetail);
  }
  ctx.body = template(ctx.proc(templateCtx, ctx));
})));
