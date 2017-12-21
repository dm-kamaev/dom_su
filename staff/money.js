'use strict';

const { loginRequired, getEmployeeHeader } = require('./decorators')
const { staffUrl, isMobileVersion, toMoscowISO, staffTemplate } = require('./utils')
const { Method1C, Request1C } = require('api1c')
const { getTemplate } = require('utils')

function getPageInfo(ctx, countItem) {
    let pageInfo = {}
    pageInfo.page = Number(ctx.request.query.page || 1)
    if (pageInfo.page < 1){
        pageInfo.page = 1
    }
    pageInfo.itemFrom = countItem*pageInfo.page - countItem + 1
    pageInfo.itemTo = countItem*pageInfo.page
    return pageInfo
}

let getCreditsCurrent = loginRequired(getEmployeeHeader(async function(ctx, next, request1C, GetEmployeeData, templateCtx) {
  let template;
  if (templateCtx.selfId != templateCtx.employeeId) {
    ctx.status = 302
    ctx.redirect(staffUrl('userIndex', templateCtx.employeeId))
  }
  let GetCurrentWageForEmployee = new Method1C('GetCurrentWageForEmployee', {
    EmployeeID: templateCtx.selfId
  })
  request1C.add(GetCurrentWageForEmployee);
  await request1C.do();
  // GetCurrentWageForEmployee–– {
  //   InterestOnOrder: [{
  //     Date: '2017-09-11T09:00:00Z',
  //     Sum: 1254,
  //     Description: 'Процент с заказа',
  //     DepartureID: '4228d9fe-91cd-11e7-80e4-00155d594900',
  //     Metro: 'Беляево (Калужско-Рижская линия)',
  //     Client: 'Наговицина Наталья Владимировна',
  //     Adjustment: null
  //   }, {
  //     Date: '2017-09-12T10:00:00Z',
  //     Sum: 1485,
  //     Description: 'Процент с заказа',
  //     DepartureID: '66d5b544-9296-11e7-80e4-00155d594900',
  //     Metro: 'Молодежная (Арбатско-Покровская линия)',
  //     Client: 'Басина Елена Валерьевна',
  //     Adjustment: null
  //   }, {
  //     Date: '2017-09-11T17:45:00Z',
  //     Sum: 957,
  //     Description: 'Процент с заказа',
  //     DepartureID: '360fb728-91cd-11e7-80e4-00155d594900',
  //     Metro: 'Новые Черемушки (Калужско-Рижская линия)',
  //     Client: 'Котова Татьяна Александровна',
  //     Adjustment: null
  //   }],
  //   AdditionalCharges: [],
  //   MonthlyCharges: [],
  //   Sum: 3696
  // }
  templateCtx.GetCurrentWageForEmployee = GetCurrentWageForEmployee.response
  templateCtx.GetEmployeeData = GetEmployeeData.response
  if (isMobileVersion(ctx)) {
    template = getTemplate(staffTemplate.mobile.creditsCurrent)
  } else {
    template = getTemplate(staffTemplate.desktop.creditsCurrent)
  }
  ctx.body = template(ctx.proc(templateCtx, ctx))
}))

let getCreditsDetail = loginRequired(getEmployeeHeader(async function (ctx, next, request1C, GetEmployeeData, templateCtx) {
    let template;
    if (templateCtx.selfId != templateCtx.employeeId){
        ctx.status = 302
        ctx.redirect(staffUrl('userIndex',  templateCtx.employeeId))
    }
    let GetWageDataForEmployee = new Method1C('GetWageDataForEmployee', {WageID: ctx.params.WageID})
    request1C.add(GetWageDataForEmployee)
    await request1C.do()
    templateCtx.GetWageDataForEmployee = GetWageDataForEmployee.response
    templateCtx.GetEmployeeData = GetEmployeeData.response
    if (isMobileVersion(ctx)){
        template = getTemplate(staffTemplate.mobile.creditsDetail)
    } else {
        template = getTemplate(staffTemplate.desktop.creditsDetail)
    }
    ctx.body = template(ctx.proc(templateCtx, ctx))
}))

let getCreditsList = loginRequired(getEmployeeHeader(async function (ctx, next, request1C, GetEmployeeData, templateCtx) {
    let template;
    let countItem = 30
    if (isMobileVersion(ctx)){
        countItem = 10
    }
    if (templateCtx.selfId != templateCtx.employeeId){
        ctx.status = 302
        ctx.redirect(staffUrl('userIndex',  templateCtx.employeeId))
    }
    let pageInfo = getPageInfo(ctx, countItem)
    let GetCreditsListForEmployee = new Method1C('GetCreditsListForEmployee', {'EmployeeID': templateCtx.employeeId, 'From': pageInfo.itemFrom, 'To': pageInfo.itemTo})
    request1C.add(GetCreditsListForEmployee)
    await request1C.do()
    templateCtx.GetCreditsListForEmployee = GetCreditsListForEmployee.response
    templateCtx.GetEmployeeData = GetEmployeeData.response
    templateCtx.countItem = countItem

    let totalNumber = GetCreditsListForEmployee.response.TotalNumber
    let pageCount = Math.ceil(Number(totalNumber)/30.0)
    templateCtx.pageList = []
    for (let i=1; i <= pageCount; i++){
        templateCtx.pageList.push(i)
    }
    templateCtx.pageList.sort((a,b)=>{return Math.abs(pageInfo.page - a) > Math.abs(pageInfo.page - b)})
    templateCtx.pageList = templateCtx.pageList.slice(0,5).sort()
    templateCtx.pageSet = {'now': pageInfo.page, 'previous': pageInfo.page - 1}
    if (pageCount >= pageInfo.page+1){
         templateCtx.pageSet['next'] = pageInfo.page + 1
    }
    if (isMobileVersion(ctx)){
        template = getTemplate(staffTemplate.mobile.creditsList)
    } else {
        template = getTemplate(staffTemplate.desktop.creditsList)
    }
    ctx.body = template(ctx.proc(templateCtx, ctx))
}))

let getDepositCurrent = loginRequired(getEmployeeHeader(async function(ctx, next, request1C, GetEmployeeData, templateCtx) {
  let template
  if (templateCtx.selfId != templateCtx.employeeId) {
    ctx.status = 302
    ctx.redirect(staffUrl('userIndex', templateCtx.employeeId))
  }
  let GetCurrentDepositForEmployee = new Method1C('GetCurrentDepositForEmployee', {
    EmployeeID: templateCtx.employeeId
  })
  request1C.add(GetCurrentDepositForEmployee)
  await request1C.do()
  // GetCurrentDepositForEmployee–– {
  //   List: [{
  //     Date: '11.09.17 17:45',
  //     OrderSum: 1740,
  //     DepositSumClient: 1740,
  //     Description: '',
  //     DepartureID: '360fb728-91cd-11e7-80e4-00155d594900',
  //     Metro: 'Новые Черемушки (Калужско-Рижская линия)',
  //     Client: 'Котова Татьяна Александровна'
  //   }],
  //   GeneralSum: 1740
  // }
  templateCtx.GetCurrentDepositForEmployee = GetCurrentDepositForEmployee.response
  templateCtx.GetEmployeeData = GetEmployeeData.response
  if (isMobileVersion(ctx)) {
    template = getTemplate(staffTemplate.mobile.depositCurrent)
  } else {
    template = getTemplate(staffTemplate.desktop.depositCurrent)
  }
  ctx.body = template(ctx.proc(templateCtx, ctx))
}));

let getDepositDetail = loginRequired(getEmployeeHeader(async function (ctx, next, request1C, GetEmployeeData, templateCtx) {
    let template
    if (templateCtx.selfId != templateCtx.employeeId){
        ctx.status = 302
        ctx.redirect(staffUrl('userIndex',  templateCtx.employeeId))
    }
    let GetDepositDataForEmployee = new Method1C('GetDepositDataForEmployee', {'DepositID': ctx.params.DepositID})
    request1C.add(GetDepositDataForEmployee)
    await request1C.do()
    templateCtx.GetEmployeeData = GetEmployeeData.response
    templateCtx.GetDepositDataForEmployee = GetDepositDataForEmployee.response
        if (isMobileVersion(ctx)){
        template = getTemplate(staffTemplate.mobile.depositDetail)
    } else {
        template = getTemplate(staffTemplate.desktop.depositDetail)
    }
    ctx.body = template(ctx.proc(templateCtx, ctx))
}))

let getDepositList = loginRequired(getEmployeeHeader(async function (ctx, next, request1C, GetEmployeeData, templateCtx) {
    let template;
    let countItem = 30
    if (isMobileVersion(ctx)){
        countItem = 10
    }
    if (templateCtx.selfId != templateCtx.employeeId){
        ctx.status = 302
        ctx.redirect(staffUrl('userIndex',  templateCtx.employeeId))
    }
    let pageInfo = getPageInfo(ctx, countItem)
    let GetDepositListForEmployee = new Method1C('GetDepositListForEmployee', {'EmployeeID': templateCtx.employeeId, 'From': pageInfo.itemFrom, 'To': pageInfo.itemTo})
    request1C.add(GetDepositListForEmployee)
    await request1C.do()
    templateCtx.GetDepositListForEmployee = GetDepositListForEmployee.response
    templateCtx.GetEmployeeData = GetEmployeeData.response
    templateCtx.countItem = countItem

    let totalNumber = GetDepositListForEmployee.response.TotalNumber
    let pageCount = Math.ceil(Number(totalNumber)/30.0)
    templateCtx.pageList = []
    for (let i=1; i <= pageCount; i++){
        templateCtx.pageList.push(i)
    }
    templateCtx.pageList.sort((a,b)=>{return Math.abs(pageInfo.page - a) > Math.abs(pageInfo.page - b)})
    templateCtx.pageList = templateCtx.pageList.slice(0,5).sort()
    templateCtx.pageSet = {'now': pageInfo.page, 'previous': pageInfo.page - 1}
    if (pageCount >= pageInfo.page+1){
         templateCtx.pageSet['next'] = pageInfo.page + 1
    }
    if (isMobileVersion(ctx)){
        template = getTemplate(staffTemplate.mobile.depositList)
    } else {
        template = getTemplate(staffTemplate.desktop.depositList)
    }
    ctx.body = template(ctx.proc(templateCtx, ctx))
}))

let ajaxDepositList = loginRequired(async function (ctx, next){
    let templateCtx = {};
    let countItem = 5
    let fromItem = Number(ctx.query.item_count)
    const request1C = new Request1C(ctx.state.pancakeUser.auth1C.token, ctx.state.pancakeUser.uuid, '', '', true);
    let GetDepositListForEmployee = new Method1C('GetDepositListForEmployee', {'EmployeeID': ctx.state.pancakeUser.auth1C.employee_uuid, 'From': fromItem + 1, 'To': fromItem + countItem})
    request1C.add(GetDepositListForEmployee)
    await request1C.do()
    templateCtx.GetDepositListForEmployee = GetDepositListForEmployee.response
    let template = getTemplate(staffTemplate.ajax.depositList)
    ctx.body = template(ctx.proc(templateCtx, ctx))
})

let ajaxCreditsList = loginRequired(async function (ctx, next){
    let templateCtx = {};
    let countItem = 5
    let fromItem = Number(ctx.query.item_count)
    const request1C = new Request1C(ctx.state.pancakeUser.auth1C.token, ctx.state.pancakeUser.uuid, '', '', true);
    let GetCreditsListForEmployee = new Method1C('GetCreditsListForEmployee', {'EmployeeID': ctx.state.pancakeUser.auth1C.employee_uuid, 'From': fromItem + 1, 'To': fromItem + countItem})
    request1C.add(GetCreditsListForEmployee)
    await request1C.do()
    templateCtx.GetCreditsListForEmployee = GetCreditsListForEmployee.response
    let template = getTemplate(staffTemplate.ajax.creditsList)
    ctx.body = template(ctx.proc(templateCtx, ctx))
})



module.exports = {
    getCreditsCurrent,
    getCreditsDetail,
    getCreditsList,
    getDepositCurrent,
    getDepositDetail,
    getDepositList,
    ajaxCreditsList,
    ajaxDepositList,
}