'use strict';

function isMobileVersion(ctx) {
  if (ctx.cookies.get('dom_mobile_force')) {
    return true;
  }
  if (ctx.userAgent.isMobile) {
    if (!ctx.cookies.get('pc_version')) {
      return true;
    }
  }
  return false;
}

function toMoscowISO(date) {
  // date moment object
  return date.utcOffset('+03:00').format('YYYY-MM-DDTHH:mm:ss') + 'Z';
}

const staff1CTemplateOpts = {
  messageList: {
    path: 'staff/templates/1C/messageList.html', name: 'staffMessageList'
  }
};
const staffDesktopTemplateOpts = {
  errors: {
    path: 'staff/templates/desktop/errors.html', name: 'staffErrors'
  },
  userIndex: {
    path: 'staff/templates/desktop/userIndex.html', name: 'staffDesktopIndex'
  },
  orderDetail: {
    path: 'staff/templates/desktop/orderDetail.html', name: 'staffDesktopOrderDetail'
  },
  orderCard: {
    path: 'staff/templates/desktop/orderCard.html', name: 'staffDesktopOrderCard'
  },
  newsIndex: {
    path: 'staff/templates/desktop/newsIndex.html', name: 'staffDesktopNewsIndex'
  },
  interviewIndex: {
    path: 'staff/templates/desktop/interviewIndex.html', name: 'staffDesktopInterviewIndex'
  },
  examsIndex: {
    path: 'staff/templates/desktop/examsIndex.html', name: 'staffDesktopExamsIndex'
  },
  examsStart: {
    path: 'staff/templates/desktop/examsStart.html', name: 'staffDesktopExamsStart'
  },
  examsDetail: {
    path: 'staff/templates/desktop/examsDetail.html', name: 'staffDesktopExamsDetail'
  },
  examsResult: {
    path: 'staff/templates/desktop/examsResult.html', name: 'staffDesktopExamsResult'
  },
  userOrders: {
    path: 'staff/templates/desktop/userOrders.html', name: 'staffDesktopUserOrders'
  },
  ratingIndex: {
    path: 'staff/templates/desktop/ratingIndex.html', name: 'staffDesktopRatingIndex'
  },
  ratingHistory: {
    path: 'staff/templates/desktop/ratingHistory.html', name: 'staffDesktopRatingHistory'
  },
  disciplinaryIndex: {
    path: 'staff/templates/desktop/disciplinaryIndex.html', name: 'staffDesktopDisciplinaryIndex'
  },
  disciplinaryDetail: {
    path: 'staff/templates/desktop/disciplinaryDetail.html', name: 'staffDesktopDisciplinaryDetail'
  },
  creditsCurrent: {
    path: 'staff/templates/desktop/creditsCurrent.html', name: 'staffDesktopCreditsCurrent'
  },
  creditsDetail: {
    path: 'staff/templates/desktop/creditsDetail.html', name: 'staffDesktopCreditsDetail'
  },
  creditsList: {
    path: 'staff/templates/desktop/creditsList.html', name: 'staffDesktopCreditsList'
  },
  depositCurrent: {
    path: 'staff/templates/desktop/depositCurrent.html', name: 'staffDesktopDepositCurrent'
  },
  depositDetail: {
    path: 'staff/templates/desktop/depositDetail.html', name: 'staffDesktopDepositDetail'
  },
  depositList: {
    path: 'staff/templates/desktop/depositList.html', name: 'staffDesktopDepositList'
  },
  conversationList: {
    path: 'staff/templates/desktop/conversationList.html', name: 'staffDesktopConversationList'
  },
  conversationDetail: {
    path: 'staff/templates/desktop/conversationDetail.html', name: 'staffDesktopConversationDetail'
  },
  header: {
    path: 'staff/templates/desktop/header.html', name: 'staffDesktopHeader'
  },

};
const staffMobileTemplateOpts = {
  userIndex: {
    path: 'staff/templates/mobile/userIndex.html', name: 'staffMobileIndex'
  },
  userOrders: {
    path: 'staff/templates/mobile/userOrders.html', name: 'staffMobileOrders'
  },
  newsIndex: {
    path: 'staff/templates/mobile/newsIndex.html', name: 'staffMobileNewsIndex'
  },
  interviewIndex: {
    path: 'staff/templates/mobile/interviewIndex.html', name: 'staffMobileInterviewIndex'
  },
  orderDetail: {
    path: 'staff/templates/mobile/orderDetail.html', name: 'staffMobileOrderDetail'
  },
  orderCard: {
    path: 'staff/templates/mobile/orderCard.html', name: 'staffMobileOrderCard'
  },
  ratingIndex: {
    path: 'staff/templates/mobile/ratingIndex.html', name: 'staffMobileRatingIndex'
  },
  ratingHistory: {
    path: 'staff/templates/mobile/ratingHistory.html', name: 'staffMobileRatingHistory'
  },
  disciplinaryIndex: {
    path: 'staff/templates/mobile/disciplinaryIndex.html', name: 'staffMobileDisciplinaryIndex'
  },
  disciplinaryDetail: {
    path: 'staff/templates/mobile/disciplinaryDetail.html', name: 'staffMobileDisciplinaryDetail'
  },
  creditsCurrent: {
    path: 'staff/templates/mobile/creditsCurrent.html', name: 'staffMobileCreditsCurrent'
  },
  creditsDetail: {
    path: 'staff/templates/mobile/creditsDetail.html', name: 'staffMobileCreditsDetail'
  },
  creditsList: {
    path: 'staff/templates/mobile/creditsList.html', name: 'staffMobileCreditsList'
  },
  depositCurrent: {
    path: 'staff/templates/mobile/depositCurrent.html', name: 'staffMobileDepositCurrent'
  },
  depositDetail: {
    path: 'staff/templates/mobile/depositDetail.html', name: 'staffMobileDepositDetail'
  },
  depositList: {
    path: 'staff/templates/mobile/depositList.html', name: 'staffMobileDepositList'
  },
  conversationList: {
    path: 'staff/templates/mobile/conversationList.html', name: 'staffMobileConversationList'
  },
  conversationDetail: {
    path: 'staff/templates/mobile/conversationDetail.html', name: 'staffMobileConversationDetail'
  },
};
const staffAjaxTemplateOpts = {
  ratingHistory: {
    path: 'staff/templates/ajax/ratingHistory.html', name: 'staffAjaxRatingHistory'
  },
  creditsList: {
    path: 'staff/templates/ajax/creditsList.html', name: 'staffAjaxCreditsList'
  },
  depositList: {
    path: 'staff/templates/ajax/depositList.html', name: 'staffAjaxDepositList'
  },
  orderList: {
    path: 'staff/templates/ajax/orderList.html', name: 'staffAjaxOrderList'
  },
};
const staffTemplate = {
  'oneC': staff1CTemplateOpts,
  'desktop': staffDesktopTemplateOpts,
  'mobile': staffMobileTemplateOpts,
  'ajax': staffAjaxTemplateOpts,
};

function staffUrl(name) {
  switch (name) {
    case 'login':
      return '/private/auth';
    case 'employeeDetail':
      return `/staff/${arguments[1]}/`;
    case 'employeeOrders':
      return `/staff/${arguments[1]}/orders`;
    case 'testIndex':
      return `/staff/study/${arguments[1]}/`;
    case 'rating':
      return `/staff/${arguments[1]}/rating`;
    case 'ratingHistory':
      return `/staff/${arguments[1]}/rating_history`;
    case 'news':
      return `/staff/${arguments[1]}/news/`;
    case 'interviewIndex':
      return `/staff/interview/${arguments[1]}/${arguments[2]}/`;
    case 'interviewSet':
      return `/staff/interview/${arguments[1]}/${arguments[2]}/`;
    case 'examsIndex':
      return `/staff/study/${arguments[1]}/`;
    case 'examsStart':
      return `/staff/study/${arguments[1]}/${arguments[2]}/start/`;
    case 'examsDetail':
      return `/staff/study/${arguments[1]}/${arguments[2]}/detail/`;
    case 'examsSend':
      return `/staff/study/${arguments[1]}/${arguments[2]}/send/`;
    case 'depositCurrent':
      return `/staff/deposit_now/${arguments[1]}/`;
    case 'depositDetail':
      return `/staff/deposit/${arguments[1]}/${arguments[2]}/`;
    case 'depositList':
      return `/staff/deposit_list/${arguments[1]}/`;
    case 'creditsCurrent':
      return `/staff/credits_now/${arguments[1]}/`;
    case 'creditsDetail':
      return `/staff/credits/${arguments[1]}/${arguments[2]}/`;
    case 'creditsList':
      return `/staff/credits_list/${arguments[1]}/`;
    case 'disciplinaryList':
      return `/staff/${arguments[1]}/disciplinary`;
    case 'disciplinaryInfo':
      return `/staff/${arguments[1]}/disciplinary/${arguments[2]}`;
    case 'changePassword':
      return '/staff/change_password';
    case 'logout':
      return '/staff/logout';
    case 'errors':
      return '/staff/errors_and_problems/';
    case 'orderDetail':
      return `/staff/order/${arguments[1]}/`;
    case 'orderCard':
      return `/staff/order/${arguments[1]}/card`;
    case 'orderManagementAjax':
      return '/staff/ajax/order/management';
    case 'allOrders':
      return '/staff/all_orders';
    case 'conversationList':
      return `/staff/${arguments[1]}/conversations/`;
    case 'conversationDetail':
      return `/staff/${arguments[1]}/conversations/${arguments[2]}/`;
    case 'createMessage':
      return `/staff/message_handler/${arguments[1]}`;
    case 'means_and_materials':
      return `/staff/${arguments[1]}/means_and_materials`;
    case 'description_services':
      return `/staff/${arguments[1]}/description_services`;
    case 'clientPA':
      return '/private/';
    default:
      return `${name}, ${this.arguments}`;
  }
}

module.exports = {
  staffUrl,
  isMobileVersion,
  staffTemplate,
  toMoscowISO,
};