

module.exports = function (method_name) {
  method_name = method_name || '';
  method_name = method_name.trim();
  const hash_employee_method = {
    GetEmployeeData: true,
    GetEmployeeDepartures: true,
    GetAllDeparturesOnClient: true,
    GetDepartureData: true,
    GetAllDeparturesOnEmployee: true,
    GetRatingInfo: true,
    GetRatingInfo2: true,
    GetRatingHistory: true,
    GetCreditsListForEmployee: true,
    GetWageDataForEmployee: true,
    GetCurrentWageForEmployee: true,
    GetDepositListForEmployee: true,
    GetDepositDataForEmployee: true,
    GetCurrentDepositForEmployee: true,
    GetSavingFundInfo: true,
    GetAllCoursesForEmployee: true,
    GetCourseData: true,
    GetTestForEmployee: true,
    SetTestForEmployee: true,
    GetDisciplinaryList: true,
    GetDisciplinaryInfo: true,
    GetMessageList: true,
    GetAnswerList: true,
    GetInterview: true,
    SetInterview: true,
  };
  // Employee.StartDeparture
  // Employee.FinishDeparture
  // Employee.CancelOrder
  // Employee.ConfirmPayment

  // Employee.NewConversation
  // Employee.ScoreConversation
  // Employee.GetConversationList
  if (hash_employee_method[method_name]) {
    return 'employee';
  } else if (/^Employee\./.test(method_name)) {
    return 'employee';
  } else {
    return 'client';
  }
}