"use strict";

 function staffUrl (name) {
     switch (name) {
         case 'login':
             return '/staff/login/'
         case 'employeeDetail':
             return `/staff/${arguments[1]}/`
         case 'employeeOrders':
             return `/staff/${arguments[1]}/orders`
         case 'testIndex':
             return `/staff/study/${arguments[1]}/`
         case 'rating':
             return `/staff/${arguments[1]}/rating`
         case 'ratingHistory':
             return `/staff/${arguments[1]}/rating_history`
         case 'news':
             return `/staff/${arguments[1]}/news/`
         case 'depositCurrent':
             return `/staff/deposit_now/${arguments[1]}/`
         case 'depositList':
             return `/staff/deposit_list/${arguments[1]}/`
         case 'creditsCurrent':
             return `/staff/credits_now/${arguments[1]}/`
         case 'creditsList':
             return `/staff/credits_list/${arguments[1]}/`
         case 'disciplinaryList':
             return `/staff/${arguments[1]}/disciplinary`
         case 'changePassword':
             return `/staff/change_password`
         case 'logout':
             return `/staff/logout`
         case 'errors':
             return `/staff/errors_and_problems`
         case 'orderDetail':
             return `/staff/order/${arguments[1]}/`
         case 'orderCard':
             return `/staff/order/${arguments[1]}/card`
         case 'allOrders':
             return `/staff/all_orders`
         default:
             return `${name}, ${this.arguments}`
     }
 }

 module.exports = {
     staffUrl
 }