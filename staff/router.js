"use strict";

const Router = require('koa-router');
const logger = require('logger')(module)
const { Method1C, Request1C } = require('api1c')
const { getTemplate, loadTemplate } = require('utils')
const { staffUrl } = require('./urls')
const moment = require('moment')

const staffDesktopTemplateOpts = {
    userIndex: {
        path: 'staff/templates/desktop/userIndex.html', name: 'staffDesktopIndex'
    },
    orderDetail: {
        path: 'staff/templates/desktop/orderDetail.html', name: 'staffDesktopOrderDetail'
    },
    userOrders: {
        path: 'staff/templates/desktop/userOrders.html', name: 'staffDesktopUserOrders'
    },
    ratingIndex: {
        path: 'staff/templates/desktop/ratingIndex.html', name: 'staffDesktopRatingIndex'
    },

}
const staffMobileTemplateOpts = {
    userIndex: {
        path: 'staff/templates/mobile/userIndex.html', name: 'staffMobileIndex'
    },
    userOrders: {
        path: 'staff/templates/mobile/userOrders.html', name: 'staffMobileOrders'
    },
    orderDetail: {
        path: 'staff/templates/mobile/orderDetail.html', name: 'staffMobileOrderDetail'
    }
}


const staffRouter = new Router({
    prefix: '/staff'
});

function toMoscowISO(date) {
    // date moment object
    return date.utcOffset("+03:00").format('YYYY-MM-DDTHH:mm:ss') + 'Z'
}

staffRouter.get('/login/', async function (ctx, next) {
    ctx.body = 'login page'
})

// Order detail
staffRouter.get('/order/:DepartureID', loginRequired(getEmployeeHeader(async function (ctx, next, request1C, GetEmployeeData, templateCtx) {
    let countEmployees, template
    let GetDepartureData = new Method1C('GetDepartureData', {DepartureID: ctx.params.DepartureID})
    request1C.add(GetDepartureData)
    await request1C.do()
    templateCtx.GetEmployeeData = GetEmployeeData.response
    GetDepartureData.response.AllDepartures.sort((a, b)=>{return (a.Date > b.Date) ? true : false})
    GetDepartureData.response.AllDepartures.forEach(item => {if (item.DepartureID == ctx.params.DepartureID) {templateCtx.currentDate = item.Date; item.currentDeparture = true}})
    countEmployees = GetDepartureData.response.Employees.length
    templateCtx.width = Math.max(604 + 100 * countEmployees, 904)
    if (countEmployees == 1){
        templateCtx.employeeColumnWidth = 300
    }
    else if (countEmployees == 2){
        templateCtx.employeeColumnWidth = 150
    } else {
        templateCtx.employeeColumnWidth = 100
    }
    if (GetDepartureData.response.ServiceObjectClassEmployee != undefined){
        for (let Service of GetDepartureData.response.Services){
            for (let objectClass of Service.ObjectClasses){
                objectClass.Employees = []
                objectClass.EmployeeListID = []
                for (let ServiceObjectClass of GetDepartureData.response.ServiceObjectClassEmployee){
                    if (Service.ServiceID == ServiceObjectClass.ServiceID && objectClass.ObjectClassID == ServiceObjectClass.ObjectClassID){
                        for (let emp of GetDepartureData.response.Employees){
                            if (emp.EmployeeID == ServiceObjectClass.EmployeeID){
                                objectClass.Employees.push(emp)
                                objectClass.EmployeeListID.push(emp.EmployeeID)
                            }
                        }
                    }
                }
            }
        }
    }
    templateCtx.additionalChechbox = [{"Title": "Инвентарь", "Value": "Inventory"}, {"Title": "Униформа", "Value": "Uniform"}]
    for (let emp of GetDepartureData.response.Employees){
        if (emp.EmployeeID == ctx.state.pancakeUser.token.employee_uuid){
            templateCtx.EarningsOrder = emp.EarnedMoney
            logger.info(templateCtx.EarningsOrder )
            logger.info(emp.EarnedMoney)
            break
        }
    }
    templateCtx.isSenior = (GetDepartureData.response.Senior.EmployeeID == ctx.state.pancakeUser.token.employee_uuid) ? true : false
    templateCtx.departureId = ctx.params.DepartureID
    templateCtx.GetDepartureData = GetDepartureData.response
    if (ctx.userAgent.isMobile){
        template = getTemplate(staffMobileTemplateOpts['orderDetail'])
    } else {
        template = getTemplate(staffDesktopTemplateOpts['orderDetail'])
    }
    ctx.body = template(ctx.proc(templateCtx, ctx))
})))


// Employee page
staffRouter.get('/:EmployeeID/', loginRequired(getEmployeeHeader(async function (ctx, next, request1C, GetEmployeeData, templateCtx) {
    let template
    let dateFrom = moment().subtract(7, "days")
    let dateTo = (moment().hour() <= 19) ? moment().startOf('day') : moment().add(1, 'days');
    let GetEmployeeDepartures = new Method1C('GetEmployeeDepartures', {'Filter': {'DateFrom': toMoscowISO(dateFrom), 'DateTo': toMoscowISO(dateTo)}, 'EmployeeID': ctx.params.EmployeeID})
    request1C.add(GetEmployeeDepartures)
    await request1C.do()
    templateCtx.GetEmployeeData = GetEmployeeData.response
    templateCtx.GetEmployeeDepartures = GetEmployeeDepartures.response
    const todayFilter = moment().startOf('day')
    templateCtx.tomorrow = []
    templateCtx.today = []
    templateCtx.old = []
    templateCtx.noOrders = (moment().hour() <= 19) ? true : false

    for (let departure of GetEmployeeDepartures.response.DeparturesList){
        if (moment(departure.Date).startOf('day') < todayFilter){
            templateCtx.old.push(departure)
        } else if (moment(departure.Date).startOf('day') == todayFilter) {
            templateCtx.today.push(departure)
        } else {
            templateCtx.tomorrow.push(departure)
        }
    }
    templateCtx.old = (templateCtx.old.length == 0) ? false : templateCtx.old
    templateCtx.today = (templateCtx.today.length == 0) ? false : templateCtx.today
    templateCtx.tomorrow = (templateCtx.tomorrow.length == 0) ? false : templateCtx.tomorrow
    templateCtx.permission = true
    if (ctx.userAgent.isMobile){
        if (!ctx.query.profile && GetEmployeeDepartures.response.DeparturesList && GetEmployeeDepartures.response.DeparturesList.length > 0){
            template = getTemplate(staffMobileTemplateOpts['userOrders'])
        } else {
            template = getTemplate(staffMobileTemplateOpts['userIndex'])
        }
    } else {
        template = getTemplate(staffDesktopTemplateOpts['userIndex'])
    }
    ctx.body = template(ctx.proc(templateCtx, ctx))
})))

// Order list
staffRouter.get('/:EmployeeID/orders', loginRequired(getEmployeeHeader(async function (ctx, next, request1C, GetEmployeeData, templateCtx) {
    let page = ctx.query.page
    try {
        page = Math.floor(page)
        if (!(page >= 1)){
            throw new Error()
        }
    } catch (e) {
        page = 1
    }
    let countItem = 30
    let orderFrom = countItem * page - countItem + 1
    let orderTo = countItem * page
    let dateTo = toMoscowISO(moment())
    let GetEmployeeDepartures = new Method1C('GetEmployeeDepartures', {'Filter': {'OrderFrom': orderFrom, 'OrderTo': orderTo, 'DateTo': dateTo}, 'EmployeeID': templateCtx.employeeId})
    request1C.add(GetEmployeeDepartures)
    await request1C.do()
    templateCtx.GetEmployeeData = GetEmployeeData.response
    templateCtx.GetEmployeeDepartures = GetEmployeeDepartures.response
    let totalNumber = GetEmployeeDepartures.response["TotalNumber"]
    let pageCount = Math.ceil(Number(totalNumber)/30.0)
    templateCtx.pageList = []
    for (let i=1; i <= pageCount; i++){
        templateCtx.pageList.push(i)
    }
    templateCtx.pageList.sort((a,b)=>{return Math.abs(page - a) > Math.abs(page - b)})
    templateCtx.pageList = templateCtx.pageList.slice(0,5).sort()
    if (totalNumber != 0 && totalNumber <= (page-1)* 30){
        ctx.status = 302
        ctx.redirect(staffUrl('employeeOrders', templateCtx.employeeId) + `?page=${pageCount}`)
        return
    }
    templateCtx.pageSet = {'now': page, 'previous': page - 1}
    if (pageCount >= page+1){
         templateCtx.pageSet['next'] = page + 1
    }
    logger.info(templateCtx.pageSet)
    let template = getTemplate(staffDesktopTemplateOpts['userOrders'])
    ctx.body = template(ctx.proc(templateCtx, ctx))
})))

// Rating index
staffRouter.get('/:EmployeeID/rating', loginRequired(getEmployeeHeader(async function (ctx, next, request1C, GetEmployeeData, templateCtx) {
    let GetRatingInfo = new Method1C('GetRatingInfo', {'EmployeeID': templateCtx.employeeId})
    let GetSavingFundInfo = new Method1C('GetSavingFundInfo', {'EmployeeID': templateCtx.employeeId})
    let template
    request1C.add(GetRatingInfo)
    request1C.add(GetSavingFundInfo)
    await request1C.do()
    templateCtx.GetRatingInfo = GetRatingInfo.response
    templateCtx.GetSavingFundInfo = GetSavingFundInfo.response
    templateCtx.GetEmployeeData = GetEmployeeData.response

    for (let detail of templateCtx.GetRatingInfo.Details){
        if (detail.Rating == 'Оценка'){
            detail.Value = (detail.Value/20).toFixed(1)
        } else {
            detail.Value = detail.Value.toString() + ' %'
        }
        detail.DailyChanges = JSON.stringify(detail.DailyChanges)
    }
    if (ctx.userAgent.isMobile){
        template = ''
    } else {
        template = getTemplate(staffDesktopTemplateOpts['ratingIndex'])
    }
    ctx.body = template(ctx.proc(templateCtx, ctx))
})))

module.exports = {
    staffRouter
}

function loginRequired(routerFunc) {
    return async function (ctx, next) {
        if (await ctx.state.pancakeUser.getToken() != null){
            await routerFunc(ctx,next)
        } else {
            ctx.status = 302
            ctx.redirect(staffUrl('login'))
        }
    }
}

function getEmployeeHeader(routerFunc) {
    return async function (ctx, next) {
        const request1C = new Request1C(ctx.state.pancakeUser.token.token, '', '', true);
        const GetEmployeeData = new Method1C('GetEmployeeData', {EmployeeID: ctx.params.EmployeeID || ctx.state.pancakeUser.token.employee_uuid});
        request1C.add(GetEmployeeData)
        let templateCtx = {
            itIsMe: !ctx.params.EmployeeID || ctx.params.EmployeeID == ctx.state.pancakeUser.token.employee_uuid,
            employeeId: ctx.params.EmployeeID || ctx.state.pancakeUser.token.employee_uuid,
            selfId: ctx.state.pancakeUser.token.employee_uuid
        }
        await routerFunc(ctx, next, request1C, GetEmployeeData, templateCtx)
    }
}