"use strict";

const { models } = require('models')
const { EmployeeNews, Token, PendingToken } = models
const Router = require('koa-router');
const logger = require('logger')(module, 'staff.log')
const loggerProblems = require('logger')(module, 'problems.log')
const config = require('config')
const { Method1C, Request1C } = require('api1c')
const { getTemplate } = require('utils')
const { staffUrl, isMobileVersion, toMoscowISO, staffTemplate } = require('./utils')
const moment = require('moment')
const uuid4 = require('uuid/v4')
const parseFormMultipart = require('koa-body')({multipart: true});
const { loginRequired, getEmployeeHeader } = require('./decorators')
const moneyStaff = require('./money')
const examsStaff = require('./exams')


const staffRouter = new Router();


const regCardService = new RegExp('^service_.*')
const regCardAdditional = new RegExp('^additional_.*')
const regCardScore = new RegExp('^score_.*')
const regQuestionAnswerCookie = new RegExp('(?:^|;)*(:?question[^;=]*)', "g")


staffRouter.get(staffUrl('logout'), async function (ctx, next) {
    let header = ctx.headers["cookie"]
    let questionAnswers = header.match(regQuestionAnswerCookie)
    if (questionAnswers){
        for (let cookieName of questionAnswers){
            ctx.cookies.set(cookieName, null, {maxAge: 0, httpOnly: false})
        }
    }
    // TODO else
    // deactivate pancake common token
    let token = await Token.findOne({where: {active: true, user_uuid: ctx.state.pancakeUser.uuid}})

    if (token){
        token.active = false
        await token.save()

        // for event token
        ctx.state.pancakeUser.auth1C.token = token.token
        ctx.state.pancakeUser.auth1C.uuid = token.uuid
        ctx.state.pancakeUser.auth1C.client_uuid = token.client_uuid
        ctx.state.pancakeUser.auth1C.employee_uuid = token.employee_uuid
    }

    // clean pending token
    if (ctx.cookies.get(config.PENDING_TOKEN_USER_KEY)) {
        let pendingToken = await PendingToken.findOne({where: {key: ctx.cookies.get(config.PENDING_TOKEN_USER_KEY)}})
        if (pendingToken){
            await pendingToken.destroy()
        }
        ctx.state.pancakeUser.cleanPendingCookie()
    }

    // clean clientPA cookie
    if (ctx.cookies.get(config.cookie.clientPA)){
        ctx.cookies.set(config.cookie.clientPA, null, {maxAge: 0, httpOnly: false})
    }
    ctx.status = 302
    ctx.redirect('/private/auth')
})

staffRouter.get(staffUrl('errors'), loginRequired(getEmployeeHeader(async function (ctx, next, request1C, GetEmployeeData, templateCtx){
    await request1C.do()
    templateCtx.GetEmployeeData = GetEmployeeData.response
    let template = getTemplate(staffTemplate.desktop.errors)
    ctx.body = template(ctx.proc(templateCtx, ctx))
})))

staffRouter.post(staffUrl('errors'), parseFormMultipart, loginRequired(getEmployeeHeader(async function (ctx, next, request1C, GetEmployeeData, templateCtx){
    await request1C.do()
    let body = ctx.request.body
    body.info = GetEmployeeData.response
    loggerProblems.info(JSON.stringify(body))
    templateCtx.GetEmployeeData = GetEmployeeData.response
    templateCtx.message = 'Спасибо за Вашу помощь!'
    let template = getTemplate(staffTemplate.desktop.errors)
    ctx.body = template(ctx.proc(templateCtx, ctx))
})))

// Order detail
staffRouter.get('/staff/order/:DepartureID', loginRequired(getEmployeeHeader(async function (ctx, next, request1C, GetEmployeeData, templateCtx) {
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
    for (let emp of GetDepartureData.response.Employees){
        if (emp.EmployeeID == ctx.state.pancakeUser.auth1C.employee_uuid){
            templateCtx.EarningsOrder = emp.EarnedMoney
            break
        }
    }
    templateCtx.isSenior = (GetDepartureData.response.Senior.EmployeeID == ctx.state.pancakeUser.auth1C.employee_uuid) ? true : false
    templateCtx.departureId = ctx.params.DepartureID
    templateCtx.GetDepartureData = GetDepartureData.response
    if (isMobileVersion(ctx)){
        try {
            [templateCtx.lon, templateCtx.lat] = JSON.parse(GetDepartureData.response['Address']['AddressJson'])['GeoObject']['Point']['pos'].split(' ')
        } catch (e){
            templateCtx.lat = null
            templateCtx.lon = null
        }
        template = getTemplate(staffTemplate.mobile.orderDetail)
    } else {
        template = getTemplate(staffTemplate.desktop.orderDetail)
    }
    ctx.body = template(ctx.proc(templateCtx, ctx))
})))

// GET Order Card
staffRouter.get(staffUrl('orderCard', ':DepartureID'), loginRequired(getEmployeeHeader(async function (ctx, next, request1C, GetEmployeeData, templateCtx) {
    templateCtx.errorText = ''
    let template = ''
    if (ctx.request.query.error){
        templateCtx.errorText = 'Для каждой услуги должен быть назначен хотя бы один сотрудник!'
    }
    let GetDepartureData = new Method1C('GetDepartureData', {DepartureID: ctx.params.DepartureID})
    request1C.add(GetDepartureData)
    await request1C.do()
    templateCtx.GetDepartureData = GetDepartureData.response
    templateCtx.GetEmployeeData = GetEmployeeData.response

    if (!(templateCtx.GetDepartureData.EnableChangeWorkCard && templateCtx.employeeId === templateCtx.GetDepartureData.Senior.EmployeeID)){
        ctx.status = 302
        ctx.redirect(staffUrl('orderDetail', ctx.params.DepartureID))
        return
    }
    templateCtx.GetDepartureData.AllDepartures.sort((a, b)=> (new Date(a.Date)).getTime() >= (new Date(b.Date)).getTime)
    templateCtx.departureId = ctx.params.DepartureID
    for (let departure of templateCtx.GetDepartureData.AllDepartures){
        if (departure.DepartureID == ctx.params.DepartureID){
            templateCtx.currentDate = departure.Date
        }
    }

    if (templateCtx.GetDepartureData.ServiceObjectClassEmployee){
        for (let Service of templateCtx.GetDepartureData.Services){
            for (let objectClass of Service.ObjectClasses){
                objectClass.Employees = []
                for (let ServiceObjectClass of templateCtx.GetDepartureData.ServiceObjectClassEmployee){
                    if (Service.ServiceID == ServiceObjectClass.ServiceID && objectClass.ObjectClassID == ServiceObjectClass.ObjectClassID){
                        objectClass.Employees.push(ServiceObjectClass.EmployeeID)
                    }
                }
            }
        }
    }



    for (let emp of templateCtx.GetDepartureData.Employees){
        if (emp.EmployeeID == templateCtx.employeeId){
            templateCtx.EarningsOrder = emp.EarnedMoney
            break
        }
    }
    templateCtx.hours = []
    for (let i = 0; i < 24; i++){
        let hour = ''
        if (i < 10){
            hour = '0' + i.toString()
        } else {
            hour = i.toString()
        }
        templateCtx.hours.push(hour)
    }
    templateCtx.additionalCheckbox = [{"Title": "Инвентарь", "Value": "Inventory"}, {"Title": "Униформа", "Value": "Uniform"}]
    templateCtx.minutes = ['00', '15', '30', '45']
    templateCtx.scoreRange = [1,2,3,4,5]
    if (isMobileVersion(ctx)){
        template = getTemplate(staffTemplate.mobile.orderCard)
    } else {
        template = getTemplate(staffTemplate.desktop.orderCard)
    }
    ctx.body = template(ctx.proc(templateCtx, ctx))

})))

staffRouter.post(staffUrl('orderCard', ':DepartureID'), parseFormMultipart, loginRequired(getEmployeeHeader(async function (ctx, next, request1C, GetEmployeeData, templateCtx) {
    let employees = Object.create(null)

    for (let field in ctx.request.body.fields){
        if (regCardService.test(field)){
            let splitInfo = field.split('_')
            let employeeDict = employees[splitInfo[3]] || {'Services': [], "EmployeeID": splitInfo[3]}
            if (ctx.request.body.fields[field] == '1'){
                employeeDict['Services'].push({'ObjectClassID': splitInfo[2], 'ServiceID': splitInfo[1]})
            }
            employees[splitInfo[3]] = employeeDict
        } else if (regCardAdditional.test(field)){
            let splitInfo = field.split('_')
            let employeeDict = employees[splitInfo[2]] || {'Services': [], "EmployeeID": splitInfo[2]}
            if (ctx.request.body.fields[field] == '1'){
                employeeDict[splitInfo[1]] = true
            }
            employees[splitInfo[2]] = employeeDict
        } else if (regCardScore.test(field)){
            let splitInfo = field.split('_')
            let employeeDict = employees[splitInfo[1]] || {'Services': [], "EmployeeID": splitInfo[1]}
            employeeDict.Rating = JSON.parse(ctx.request.body.fields[field])
            employees[splitInfo[1]] = employeeDict
        }
    }

    let general = {'EmployeesParam': [], 'DepartureID': ctx.params.DepartureID}
    general.CleanTechnique = JSON.parse(ctx.request.body.fields['clean_technique'])
    general.EquipmentRepair = JSON.parse(ctx.request.body.fields['equipment_repair'])
    general.FullInventory = JSON.parse(ctx.request.body.fields['full_inventory'])
    general.ManagerRaiting = JSON.parse(ctx.request.body.fields['manager_raiting'])

    let day = ctx.request.body.fields['date-order']
    general.BeginTime = day + [ctx.request.body.fields['begin_time_hour'], ctx.request.body.fields['begin_time_minute'], '00Z'].join(':')
    general.EndTime = day + [ctx.request.body.fields['end_time_hour'], ctx.request.body.fields['end_time_minute'], '00Z'].join(':')

    if (ctx.request.body.fields['begin_time_car_hour']){
        general.BeginTimeCar = day + [ctx.request.body.fields['begin_time_car_hour'], ctx.request.body.fields['begin_time_car_minute'], '00Z'].join(':')
    }
    if (ctx.request.body.fields['end_time_car_hour']){
        general.EndTimeCar = day + [ctx.request.body.fields['end_time_car_hour'], ctx.request.body.fields['end_time_car_minute'], '00Z'].join(':')
    }
    for (let employee in employees){
        general.EmployeesParam.push(employees[employee])
    }

    let SetWorkingCard = new Method1C('Employee.SetWorkingCard', general)
    request1C.add(SetWorkingCard)
    await request1C.do()

    if (SetWorkingCard.error && SetWorkingCard.error.code == 42){
        ctx.status = 302
        ctx.redirect(staffUrl('orderCard', ctx.params.DepartureID) + '?error=42')
        return
    }
    ctx.status = 302
    ctx.redirect(staffUrl('orderDetail', ctx.params.DepartureID))
})))

// Employee page
staffRouter.get('/staff/:EmployeeID/', loginRequired(getEmployeeHeader(async function (ctx, next, request1C, GetEmployeeData, templateCtx) {
    let template
    let dateFrom = moment().subtract(7, "days")
    let dateTo = (moment().hour() < 19) ? moment().startOf('day') : moment().add(1, 'days').startOf('day');
    let GetEmployeeDepartures = new Method1C('GetEmployeeDepartures', {'Filter': {'DateFrom': toMoscowISO(dateFrom), 'DateTo': toMoscowISO(dateTo)}, 'EmployeeID': ctx.params.EmployeeID})
    request1C.add(GetEmployeeDepartures)
    await request1C.do()
    templateCtx.GetEmployeeData = GetEmployeeData.response
    templateCtx.GetEmployeeDepartures = GetEmployeeDepartures.response
    const todayFilter = moment().startOf('day')
    templateCtx.tomorrow = []
    templateCtx.today = []
    templateCtx.old = []
    templateCtx.noOrders = (moment().hour() < 19) ? false: true
    if (GetEmployeeDepartures.response && GetEmployeeDepartures.response.DeparturesList){
        templateCtx.orderCount = GetEmployeeDepartures.response.DeparturesList.length
    } else {
        templateCtx.orderCount = 0
    }
    if (GetEmployeeDepartures.error && GetEmployeeDepartures.error.code == 2){
        if (isMobileVersion(ctx)){
            template = getTemplate(staffTemplate.mobile.userIndex)
        } else {
            template = getTemplate(staffTemplate.desktop.userIndex)
        }
        ctx.body = template(ctx.proc(templateCtx, ctx))
        return
    }
    for (let departure of GetEmployeeDepartures.response.DeparturesList){
        if (moment(departure.Date).startOf('day') < todayFilter){
            templateCtx.old.push(departure)
        } else if (todayFilter.isSame(moment(departure.Date).startOf('day'))) {
            templateCtx.today.push(departure)
        } else {
            templateCtx.tomorrow.push(departure)
        }
    }
    templateCtx.old = (templateCtx.old.length == 0) ? false : templateCtx.old
    templateCtx.today = (templateCtx.today.length == 0) ? false : templateCtx.today
    templateCtx.tomorrow = (templateCtx.tomorrow.length == 0) ? false : templateCtx.tomorrow
    templateCtx.permission = true
    if (isMobileVersion(ctx)){
        if (!ctx.query.profile && GetEmployeeDepartures.response.DeparturesList && GetEmployeeDepartures.response.DeparturesList.length > 0){
            template = getTemplate(staffTemplate.mobile.userOrders)
        } else {
            template = getTemplate(staffTemplate.mobile.userIndex)
        }
    } else {
        template = getTemplate(staffTemplate.desktop.userIndex)
    }
    ctx.body = template(ctx.proc(templateCtx, ctx))
})))

// Order list
staffRouter.get('/staff/:EmployeeID/orders', loginRequired(getEmployeeHeader(async function (ctx, next, request1C, GetEmployeeData, templateCtx) {
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
    let template = getTemplate(staffTemplate.desktop.userOrders)
    ctx.body = template(ctx.proc(templateCtx, ctx))
})))

staffRouter.get('/staff/:EmployeeID/news/', loginRequired(getEmployeeHeader(async function (ctx, next, request1C, GetEmployeeData, templateCtx) {
    await request1C.do()
    let template
    let limit =  (ctx.query.all) ? undefined : 5
    let news = await EmployeeNews.findAll({where: {active: true} , order: [['id', 'DESC']], 'limit': limit})
    templateCtx.GetEmployeeData = GetEmployeeData.response
    templateCtx.news = news
    templateCtx.limit = limit
    if (isMobileVersion(ctx)){
        template = getTemplate(staffTemplate.mobile.newsIndex)
    } else {
        template = getTemplate(staffTemplate.desktop.newsIndex)
    }
    ctx.body = template(ctx.proc(templateCtx, ctx))
})))

staffRouter.get('/staff/interview/:EmployeeID/:InterviewID/', loginRequired(getEmployeeHeader(async function (ctx, next, request1C, GetEmployeeData, templateCtx) {
    let GetInterview = new Method1C('GetInterview', {'InterviewTypeName': ctx.params.InterviewID})
    let template
    request1C.add(GetInterview)
    await request1C.do()
    if (GetInterview.error){
        ctx.body = 'END'
        return
    }
    templateCtx.GetEmployeeData = GetEmployeeData.response
    templateCtx.GetInterview = GetInterview.response
    if (isMobileVersion(ctx)){
        template = getTemplate(staffTemplate.mobile.interviewIndex)
    } else {
        template = getTemplate(staffTemplate.desktop.interviewIndex)
    }
    ctx.body = template(ctx.proc(templateCtx, ctx))
})))

let questionTextRegExp = new RegExp(/^(:?.+)-text$/)
let questionAnswerRegExp = new RegExp(/^answer-(:?.+)-wall-(:?.+)-text$/)

staffRouter.post('/staff/interview/:EmployeeID/:InterviewID/', parseFormMultipart, loginRequired(getEmployeeHeader(async function (ctx, next, request1C, GetEmployeeData, templateCtx){
    
    function parseResult(rawQuestionId, rawResults) {
        let value = []
        let questionId
        if (questionTextRegExp.test(rawQuestionId)){
            if (questionAnswerRegExp.test(rawQuestionId)){
                let parseQuestionId = questionAnswerRegExp.exec(rawQuestionId)
                questionId = parseQuestionId[1]
                value = [{'InterviewAnswerID': parseQuestionId[2], 'Text': rawResults[rawQuestionId]}]
            } else {
                let parseQuestionId = questionTextRegExp.exec(rawQuestionId)
                questionId = parseQuestionId[1]
                value = {'Text': rawResults[rawQuestionId]}
            }
        } else {
            questionId = rawQuestionId
            if (Array.isArray(rawResults[rawQuestionId])){
                value = rawResults[rawQuestionId].map((answerId)=> {return {'InterviewAnswerID': answerId}})
            } else {
                value = [{'InterviewAnswerID': rawResults[rawQuestionId]}]
            }
        }
        return {InterviewQuestionID: questionId, Value: value}
    }

    function addAnswer(questionAnswers, interviewQuestion) {

        if (Array.isArray(questionAnswers.Value)){
            for (let answer of questionAnswers.Value){
                let haveAnswer = false
                for (let interviewAnswer of interviewQuestion.Value){
                    if (answer.InterviewAnswerID && (answer.InterviewAnswerID == interviewAnswer.InterviewAnswerID)){
                        haveAnswer = true
                        if (answer.Text){
                            interviewAnswer.Text = answer.Text
                        }
                    }
                }
                if (!haveAnswer){
                    interviewQuestion.Value.push(answer)
                }
            }
        } else {
            interviewQuestion.Value = questionAnswers.Value
        }

    }

    function addQuestion(questionAnswers, interviewQuestionAnswers) {
        let haveQuestion = false
        for (let interviewQuestion of interviewQuestionAnswers){
            if (interviewQuestion.InterviewQuestionID == questionAnswers.InterviewQuestionID){
                haveQuestion = true
                addAnswer(questionAnswers, interviewQuestion)
                return
            }
        }
        if (!haveQuestion){
            interviewQuestionAnswers.push(questionAnswers)
        }
    }

    let rawResults = ctx.request.body.fields
    let interviewQuestionAnswers = []
    for (let rawQuestionId in rawResults){
        let questionAnswers = parseResult(rawQuestionId, rawResults)
        if (questionAnswers){
            addQuestion(questionAnswers, interviewQuestionAnswers)
        }
    }

    let SetInterview = new Method1C('SetInterview', {'InterviewAnswers': interviewQuestionAnswers, 'InterviewID': ctx.params.InterviewID})
    request1C.add(SetInterview)
    await request1C.do()
    ctx.status = 302
    ctx.redirect(ctx.headers.referer)
})))


// Rating index
staffRouter.get('/staff/:EmployeeID/rating', loginRequired(getEmployeeHeader(async function (ctx, next, request1C, GetEmployeeData, templateCtx) {
    let GetRatingInfo = new Method1C('GetRatingInfo', {'EmployeeID': templateCtx.employeeId})
    let GetSavingFundInfo = new Method1C('GetSavingFundInfo', {'EmployeeID': templateCtx.employeeId})
    let template
    request1C.add(GetRatingInfo)
    request1C.add(GetSavingFundInfo)
    await request1C.do()
    templateCtx.GetRatingInfo = GetRatingInfo.response
    templateCtx.GetSavingFundInfo = GetSavingFundInfo.response
    templateCtx.GetEmployeeData = GetEmployeeData.response

    if (templateCtx.GetRatingInfo && templateCtx.GetRatingInfo.Details){
        for (let detail of templateCtx.GetRatingInfo.Details){
            if (detail.Rating == 'Оценка'){
                detail.Value = (detail.Value/20).toFixed(1)
            } else {
                detail.Value = detail.Value.toString() + ' %'
            }
            detail.DailyChangesJSON = JSON.stringify(detail.DailyChanges)
        }
    }
    if (isMobileVersion(ctx)){
        template = getTemplate(staffTemplate.mobile.ratingIndex)
    } else {
        template = getTemplate(staffTemplate.desktop.ratingIndex)
    }
    ctx.body = template(ctx.proc(templateCtx, ctx))
})))

// Rating history
staffRouter.get('/staff/:EmployeeID/rating_history', loginRequired(getEmployeeHeader(async function (ctx, next, request1C, GetEmployeeData, templateCtx){
    let from_item = 1
    let count, template
    if (isMobileVersion(ctx)) {
        count = 10
    } else {
        count = 30
    }
    let GetRatingHistory = new Method1C('GetRatingHistory', {'EmployeeID': templateCtx.employeeId, 'From': from_item, 'Count': count})
    request1C.add(GetRatingHistory)
    await request1C.do()
    templateCtx.GetRatingHistory = GetRatingHistory.response
    templateCtx.GetEmployeeData = GetEmployeeData.response
    if (isMobileVersion(ctx)){
        template = getTemplate(staffTemplate.mobile.ratingHistory)
    } else {
        template = getTemplate(staffTemplate.desktop.ratingHistory)
    }
    ctx.body = template(ctx.proc(templateCtx, ctx))
})))

// Disciplinary index
staffRouter.get('/staff/:EmployeeID/disciplinary', loginRequired(getEmployeeHeader(async function (ctx, next, request1C, GetEmployeeData, templateCtx){
    let from_item = 1
    let template, count = 30
    let GetDisciplinaryList = new Method1C('GetDisciplinaryList', {'EmployeeID': templateCtx.employeeId, 'From': from_item, 'Count': count})
    request1C.add(GetDisciplinaryList)
    await request1C.do()
    templateCtx.GetDisciplinaryList = GetDisciplinaryList.response
    templateCtx.GetEmployeeData = GetEmployeeData.response
    if (isMobileVersion(ctx)){
        template = getTemplate(staffTemplate.mobile.disciplinaryIndex)
    } else {
        template = getTemplate(staffTemplate.desktop.disciplinaryIndex)
    }
    ctx.body = template(ctx.proc(templateCtx, ctx))
})))

// Disciplinary detail
staffRouter.get('/staff/:EmployeeID/disciplinary/:DisciplinaryID', loginRequired(getEmployeeHeader(async function (ctx, next, request1C, GetEmployeeData, templateCtx){
    let template;
    let GetDisciplinaryInfo = new Method1C('GetDisciplinaryInfo', {"DisciplinaryID": ctx.params.DisciplinaryID, "EmployeeID": templateCtx.employeeId})
    let GetMessageList = new Method1C('GetMessageList', {'Count': 100, 'Linked': {'ID': ctx.params.DisciplinaryID, 'Type': 'Disciplinary'}})
    request1C.add(GetDisciplinaryInfo)
    request1C.add(GetMessageList)
    await request1C.do()
    templateCtx.GetDisciplinaryInfo = GetDisciplinaryInfo.response
    if (GetDisciplinaryInfo.response && typeof GetDisciplinaryInfo.response.Description == 'string'){
        GetDisciplinaryInfo.response.Description = GetDisciplinaryInfo.response.Description.replace(new RegExp('\n', 'g'), '<br/>')
    }
    if (GetDisciplinaryInfo.response && typeof GetDisciplinaryInfo.response.Note == 'string'){
        GetDisciplinaryInfo.response.Note = GetDisciplinaryInfo.response.Note.replace(new RegExp('\n', 'g'), '<br/>')
    }
    templateCtx.GetMessageList = GetMessageList.response
    templateCtx.GetEmployeeData = GetEmployeeData.response
    if (isMobileVersion(ctx)){
        template = getTemplate(staffTemplate.mobile.disciplinaryDetail)
    } else {
        template = getTemplate(staffTemplate.desktop.disciplinaryDetail)
    }
    ctx.body = template(ctx.proc(templateCtx, ctx))
})))

// Credits list
staffRouter.get('/staff/credits_list/:EmployeeID/', moneyStaff.getCreditsList)

// Credits current
staffRouter.get('/staff/credits_now/:EmployeeID/', moneyStaff.getCreditsCurrent)

// Credits detail
staffRouter.get('/staff/credits/:EmployeeID/:WageID/', moneyStaff.getCreditsDetail)

// Deposit list
staffRouter.get('/staff/deposit_list/:EmployeeID/', moneyStaff.getDepositList)

// Deposit current
staffRouter.get('/staff/deposit_now/:EmployeeID/', moneyStaff.getDepositCurrent)

// Deposit detail
staffRouter.get('/staff/deposit/:EmployeeID/:DepositID/', moneyStaff.getDepositDetail)

// Exams Index, Detail, Start, Send
staffRouter.get(staffUrl('examsIndex', ':EmployeeID'), examsStaff.examsIndex)
staffRouter.get(staffUrl('examsDetail', ':EmployeeID', ':CourseID'), examsStaff.examsDetail)
staffRouter.get(staffUrl('examsStart', ':EmployeeID', ':CourseID'), examsStaff.examsStart)
staffRouter.post(staffUrl('examsSend', ':EmployeeID', ':CourseID'), parseFormMultipart, examsStaff.examsSend)

// Message handler POST
staffRouter.post('/staff/message_handler/:EmployeeID', parseFormMultipart, async function (ctx, next) {
    let salt = uuid4()
    let token = ctx.request.body.fields.token
    if (!token){
        let auth1C = await ctx.state.pancakeUser.getAuth1C()
        token = auth1C.token
    }
    const request1C = new Request1C(token, '', '', true);
    let SendMessage = new Method1C('SendMessage', {
        "Role": 2, "Content": ctx.request.body.fields.content, "Salt": salt.toString(),
        "AnswerToMessageID": null,
        "Linked": {
            "ID": ctx.request.body.fields.DisciplinaryID,
            "Type": "Disciplinary"},
    })
    request1C.add(SendMessage)
    await request1C.do()
    ctx.status = 302
    ctx.redirect(ctx.request.body.fields.this_url + '#' + SendMessage.response.MessageID)
})

// Message list
staffRouter.get('/staff/comments/:EmployeeID/:LinkedType/:LinkedID/:Token/', async function (ctx, next) {
    let templateCtx = {}
    const request1C = new Request1C(ctx.params.Token, '', '', true);
    let GetMessageList = new Method1C('GetMessageList', {'Count': 100, 'Linked': {'ID': ctx.params.LinkedID, 'Type': ctx.params.LinkedType}})
    request1C.add(GetMessageList)
    await request1C.do()
    templateCtx.GetMessageList = GetMessageList.response
    templateCtx.selfId = ctx.params.EmployeeID
    templateCtx.token = ctx.params.Token
    templateCtx.DisciplinaryID = ctx.params.LinkedID
    let template = getTemplate(staffTemplate.oneC.messageList)
    ctx.body = template(ctx.proc(templateCtx, ctx))
})

// AJAX
// Rating History
staffRouter.get('/staff/ajax/get_rating_history', loginRequired(async function (ctx, next){
    let employeeId = ctx.request.query.employee_id
    let from_item = Number(ctx.request.query.item_count)
    let count = Number(ctx.request.query.get_item_count)
    let GetRatingHistory = new Method1C('GetRatingHistory', {'EmployeeID': employeeId, 'From': from_item, 'Count': count})
    const request1C = new Request1C(ctx.state.pancakeUser.auth1C.token, '', '', true);
    request1C.add(GetRatingHistory)
    await request1C.do()
    let templateCtx = {}
    templateCtx.GetRatingHistory = GetRatingHistory.response
    let template = getTemplate(staffTemplate.ajax.ratingHistory)
    ctx.body = template(ctx.proc(templateCtx, ctx))
}))

// Credits List Ajax
staffRouter.get('/staff/ajax/creditsList', moneyStaff.ajaxCreditsList)

staffRouter.get('/staff/ajax/orderList', loginRequired(async function (ctx, next) {
    try{
        let templateCtx = {}
        let employeeId = ctx.request.query.employee_id
        let order_count = Number(ctx.request.query.order_count)
        let order_from = order_count + 1
        let order_to = order_from + 4
        let GetEmployeeDepartures = new Method1C('GetEmployeeDepartures', {'Filter': {'OrderFrom': order_from, 'OrderTo': order_to}, 'EmployeeID': employeeId})
        const request1C = new Request1C(ctx.state.pancakeUser.auth1C.token, '', '', true);
        request1C.add(GetEmployeeDepartures)
        await request1C.do()
        templateCtx.GetEmployeeDepartures = GetEmployeeDepartures.response
        if (templateCtx.GetEmployeeDepartures.DeparturesList.length){
            let template = getTemplate(staffTemplate.ajax.orderList)
            ctx.body = template(ctx.proc(templateCtx, ctx))
        } else {
            ctx.body = ''
        }
    } catch (e){
        logger.info(e)
        ctx.body = ''
    }
}))

// Deposit List Ajax
staffRouter.get('/staff/ajax/depositList', moneyStaff.ajaxDepositList)

// Staff
staffRouter.get('/staff/', loginRequired(async function (ctx, next) {
    ctx.status = 302
    ctx.redirect(staffUrl('news', ctx.state.pancakeUser.auth1C.employee_uuid))
}))

module.exports = {
    staffRouter
}