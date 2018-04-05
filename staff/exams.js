'use strict';

const { loginRequired, getEmployeeHeader } = require('./decorators');
const { staffTemplate } = require('./utils');
const { Method1C } = require('api1c');
const logger = require('logger')(module, 'staff.log');
const { getTemplate } = require('utils');
const moment = require('moment');

const TIME_WAIT = 10;
const TEST_STATUS = {
  // Струкрута [ID status, show link, color-status, show result]
  '322a092e-2070-48d2-831e-bd68a3b8918f': [1, true, '#FF2500', false], //"Проходится сейчас",
  'd5db77d2-e518-4114-8d3a-3515eedfdf48': [7, false, '#FF2500', true], //"Не сдан" (не используется),
  'cfd1938f-3dbd-46a3-a000-32c3d19a61c9': [2, false, '#52A310', true], //"Сдан",
  '7f6b9f52-9e22-42ad-9d42-a55bf7788b48': [3, true, '#BD7C06', false], //"Новый",
  '8762f70a-67ae-4d48-8ebb-b792c278df91': [4, true, '#BD7C06', true], //"Не сдан можно пересдать",
  'bc8c2aa2-bf02-4412-8a9a-816c787856b3': [5, false, '#FF2500', true], //"Не сдан сдавать можно на следующий день",
  '6392ce3d-154e-421b-8dca-0d16be6234fa': [6, false, '#FF2500', true]}; //"Не сдан попытки исчерпаны"}


let examsIndex = loginRequired(getEmployeeHeader(async function (ctx, next, request1C, GetEmployeeData, templateCtx){
  let GetAllCoursesForEmployee = new Method1C('GetAllCoursesForEmployee', {EmployeeID: templateCtx.employeeId});
  request1C.add(GetAllCoursesForEmployee);
  await request1C.do();
  templateCtx.GetAllCoursesForEmployee = GetAllCoursesForEmployee.response;
  templateCtx.GetEmployeeData = GetEmployeeData.response;

  if (templateCtx.GetAllCoursesForEmployee && templateCtx.GetAllCoursesForEmployee.TestsList){
    for (let test of templateCtx.GetAllCoursesForEmployee.TestsList){
      test['djangoTestStatusID'] = TEST_STATUS[test['TestStatusID']][0];
      test['link'] = TEST_STATUS[test['TestStatusID']][1];
      test['colorStatus'] = TEST_STATUS[test['TestStatusID']][2];
      test['showResult'] = TEST_STATUS[test['TestStatusID']][3];
    }
  }

  let template = getTemplate(staffTemplate.desktop.examsIndex);
  ctx.body = template(ctx.proc(templateCtx, ctx));
}));

let examsDetail = loginRequired(getEmployeeHeader(async function (ctx, next, request1C, GetEmployeeData, templateCtx){
  let GetTestForEmployee = new Method1C('GetTestForEmployee', {EmployeeID: templateCtx.employeeId, CourseID: ctx.params.CourseID});
  request1C.add(GetTestForEmployee);
  await request1C.do();
  templateCtx.GetTestForEmployee = GetTestForEmployee.response;
  templateCtx.GetEmployeeData = GetEmployeeData.response;
  templateCtx.CourseID = ctx.params.CourseID;
  let now = moment();
  templateCtx.GetTestForEmployee.TimeLeft = Math.round(templateCtx.GetTestForEmployee['TestTime']*60 - (now.hour(now.hour()+3) - moment(templateCtx.GetTestForEmployee['TimeStart']))/1000) - TIME_WAIT;


  for (let question of templateCtx.GetTestForEmployee.Questions){
    if (ctx.cookies.get('question' + question['QuestionID'])){
      let cookieAnswers = ctx.cookies.get('question' + question['QuestionID']);
      let splitAnswers = cookieAnswers.split('_');
      for (let answer of question['Answers']){
        if (splitAnswers.indexOf(answer['AnswerID']) > -1){
          answer['Check'] = true;
        }
      }
    }
  }
  let template = getTemplate(staffTemplate.desktop.examsDetail);
  ctx.body = template(ctx.proc(templateCtx, ctx));
}));

let examsStart = loginRequired(getEmployeeHeader(async function (ctx, next, request1C, GetEmployeeData, templateCtx){
  let GetCourseData = new Method1C('GetCourseData', {EmployeeID: templateCtx.employeeId, CourseID: ctx.params.CourseID});
  request1C.add(GetCourseData);
  await request1C.do();
  templateCtx.GetCourseData = GetCourseData.response;
  templateCtx.GetEmployeeData = GetEmployeeData.response;
  let template = getTemplate(staffTemplate.desktop.examsStart);
  ctx.body = template(ctx.proc(templateCtx, ctx));
}));

let examsSend = loginRequired(getEmployeeHeader(async function (ctx, next, request1C, GetEmployeeData, templateCtx){
  let TestAnswers = [];
  for (let answer in ctx.request.body.fields){
    let answerList;
    if (Array.isArray(ctx.request.body.fields[answer])){
      answerList = ctx.request.body.fields[answer];
    } else {
      answerList = [ctx.request.body.fields[answer]];
    }
    TestAnswers.push({QuestionID: answer, 'Answers': answerList});
  }
  let SetTestForEmployee = new Method1C('SetTestForEmployee', {EmployeeID: templateCtx.employeeId, CourseID: ctx.params.CourseID, TestAnswers: TestAnswers });
  request1C.add(SetTestForEmployee);
  await request1C.do();
  templateCtx.SetTestForEmployee = SetTestForEmployee.response;
  templateCtx.GetEmployeeData = GetEmployeeData.response;
  let template = getTemplate(staffTemplate.desktop.examsResult);
  ctx.body = template(ctx.proc(templateCtx, ctx));

}));



module.exports = {
  examsIndex,
  examsDetail,
  examsStart,
  examsSend,
};