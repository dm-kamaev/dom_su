'use strict';

const Request1Cv3 = require('/p/pancake/api1c/request1Cv3.js');
const decorators = require('/p/pancake/staff/decorators.js');
const AuthApi = require('/p/pancake/auth/authApi.js');
const templates = require('/p/pancake/utils/templates.js');
const fn = require('/p/pancake/my/fn.js');
const promise_api = require('/p/pancake/my/promise_api.js');
const logger = require('/p/pancake/lib/logger.js');

const path_select_means_and_materials= { path: '/p/pancake/staff/templates/mobile/select_means_and_materials.html' };
templates.loadTemplate(path_select_means_and_materials);

const show_current_inventory_request= { path: '/p/pancake/staff/templates/mobile/show_current_inventory_request.html' };
templates.loadTemplate(show_current_inventory_request);

const history_about_means_materials= { path: '/p/pancake/staff/templates/mobile/history_about_means_materials.html' };
templates.loadTemplate(history_about_means_materials);


module.exports = function (employee_router) {
  // /staff/f482eb0b-007b-11e6-80de-00155d594900/means_and_materials dev2
  employee_router.get('/staff/:employee_id/means_and_materials', decorators.login_required, decorators.getEmployeeHeader(page_means_materials));

  employee_router.get('/staff/:employee_id/history_about_means_materials', decorators.login_required, decorators.getEmployeeHeader(page_history_about_means_materials));

  // create inventory_request
  employee_router.post('/staff/aj/:employee_id/inventory_request', decorators.login_required, async function (ctx) {
    const { uuid, token } = new AuthApi(ctx).get_auth_data();
    const request1Cv3 = new Request1Cv3(token, uuid, null, ctx);
    let error;
    try {
      await request1Cv3.add('Employee.NewInventoryRequest', {
        EmployeeID: ctx.params.employee_id,
        InventoryList: ctx.request.body,
        Date: new Date(),
      }).do();
      const new_inventory_request = request1Cv3.get();
      if (!new_inventory_request.ok) {
        error = new_inventory_request.error;
        throw new_inventory_request.error;
      }
      ctx.status = 200;
      ctx.body = {
        ok: true,
        data: new_inventory_request.data,
      };
    } catch (err) {
      logger.warn(err);
      ctx.status = 500;
      ctx.body = {
        ok: false,
        error: error || 'Internal error',
      };
    }

  });

  // close inventory request
  employee_router.delete('/staff/aj/:employee_id/inventory_request/:inventory_request_id', decorators.login_required, async function (ctx) {
    let error;
    try {
      const { uuid, token } = new AuthApi(ctx).get_auth_data();
      const request1Cv3 = new Request1Cv3(token, uuid, null, ctx);
      await request1Cv3.add('Employee.CancelInventoryRequest', {
        InventoryRequestID: ctx.params.inventory_request_id,
      }).do();
      const cancel_inventory_request = request1Cv3.get();
      if (!cancel_inventory_request.ok) {
        error = cancel_inventory_request.error;
        throw cancel_inventory_request.error;
      }
      ctx.status = 200;
      ctx.body = {
        ok: true,
        data: cancel_inventory_request.data,
      };
    } catch (err) {
      logger.warn(err);
      ctx.status = 500;
      ctx.body = {
        ok: false,
        error: error || 'Internal error',
      };
    }
  });
};

// =================================================
async function page_means_materials(ctx, next, request1C, GetEmployeeData, templateCtx) {
  try {
    const { uuid, token } = new AuthApi(ctx).get_auth_data();
    const employee_id = ctx.params.employee_id;

    const req_for_1c = new Request1Cv3(token, uuid, null, ctx);
    req_for_1c.add('GetEmployeeData', {
      EmployeeID: employee_id
    }).add('Employee.InventoryList', {}).add('Employee.GetInventoryRequestList', {
      EmployeeID: employee_id,
      Count: 1,
      From: 1,
      Filter: {
        Status: 'Active'
      }
    });
    await req_for_1c.do();
    const {
      GetEmployeeData: getEmployeeData,
      'Employee.GetInventoryRequestList': getInventoryRequestList,
      'Employee.InventoryList': Employee_InventoryList
    } = req_for_1c.get_all();

    if (!getEmployeeData.ok) {
      throw new getEmployeeData.error;
    } else if (!Employee_InventoryList.ok) {
      throw Employee_InventoryList.error;
    } else if (!getInventoryRequestList.ok) {
      throw getInventoryRequestList.error;
    }

    const inventory_request = fn.deep_value(getInventoryRequestList, 'data.InventoryRequestList.0') || {};
    const inventory_request_id = inventory_request.InventoryRequestID || null;
    templateCtx.current_url = ctx.request.url;
    if (inventory_request_id) { // show view with exist inventory request
      const info_inventory_request = await view_info_inventory_request(
        new Request1Cv3(token, uuid, null, ctx),
        inventory_request_id,
        employee_id
      );
      ctx.status = 200;
      templateCtx.inventory_request_id = inventory_request_id;
      templateCtx.getEmployeeData = getEmployeeData.data;
      templateCtx.info_inventory_request = info_inventory_request;
      ctx.body = templates.getTemplate(show_current_inventory_request)(ctx.proc(templateCtx, ctx));
    } else { // show view for select means and materials
      const data = build_data(Employee_InventoryList);

      ctx.status = 200;
      templateCtx.means = data.means;
      templateCtx.hash_mean_material = JSON.stringify(data.hash_mean_material);
      templateCtx.materials = data.materials;
      templateCtx.getEmployeeData = getEmployeeData.data;
      ctx.body = templates.getTemplate(path_select_means_and_materials)(ctx.proc(templateCtx, ctx));
    }

  } catch (err) {
    logger.warn(err);
    ctx.status = 500;
    ctx.body = 'Internal error';
  }
}

// return ––
// [{
//   InventoryTitle: 'Моп 18003 (40*12) абразив',
//   PackageTitle: 'шт',
//   Quantity: 1,
//   Amount: 138
// }]
async function view_info_inventory_request(req_for_1c, InventoryRequestID, employee_id) {
  await req_for_1c.add('Employee.GetInventoryRequest', {
    EmployeeID: employee_id,
    InventoryRequestID
  }).do();
  const { 'Employee.GetInventoryRequest': get_inventory_request } = req_for_1c.get_all();
  if (!get_inventory_request.ok) {
    throw get_inventory_request.error;
  }
  // get_inventory_request.data –– {
  //   Date: '2018-02-19T11:18:44Z',
  //   Status: 'Новая',
  //   InventoryList: [{
  //     InventoryTitle: 'Моп 18003 (40*12) абразив',
  //     PackageTitle: 'шт',
  //     Quantity: 1,
  //     Amount: 138
  //   }]
  // }
  return view_one_inventory_request(fn.deep_value(get_inventory_request, 'data.InventoryList') || []);
}


function build_data(Employee_InventoryList) {
  // InventoryList: [{
  //   InventoryID: "63666f19-d76a-11e2-8286-002590306b4e",
  //   InventoryTitle: "Моп 18003 (40*12) абразив",
  //   PackageID: null,
  //   PackageTitle: "шт",
  //   Quantity: 285,
  //   Price: 138
  // }, {
  //   InventoryID: "d957fff1-5967-11e1-9fef-002590306b4f",
  //   InventoryTitle: "Лэри Магос",
  //   PackageID: "89ba25d1-a730-11e2-84cd-002590306b4e",
  //   PackageTitle: "1 л",
  //   Quantity: 125,
  //   Price: 80.24
  // }]

  const i_list = Employee_InventoryList.data.InventoryList;
  const means = [];
  const materials = [];
  const hash_mean_material = {};
  i_list.forEach((inventory, i) => {
    const price = inventory.Price;
    const inventory_id = inventory.InventoryID;
    const package_id = inventory.PackageID;
    const package_title = inventory.PackageTitle.replace(/[\d\.]+/g, '').toLowerCase().trim();

    console.log('package_title=', package_title);
    const quantity = [{ name: 'Не выбрано', value: 0 }];
    if (package_title === 'л') {
      quantity.push({ name: '0.33 лт', value: 0.33 });
      quantity.push({ name: '0.5 лт', value: 0.5 });
    }
    for (var j = 1, l = inventory.Balance; j < l; j++) {
      quantity.push({ name: (j+' '+package_title), value: j });
    }
    var row_id = inventory_id;
    const el = {
      inventory_id,
      inventory_title: inventory.InventoryTitle,
      inventory_description: inventory.InventoryDescription,
      package_id,
      quantity,
      price,
      row_id
    };
    if (inventory.InventoryType === 'Средства') {
      el.data_type = 'mean';
      el.data_key = el.data_type +'_'+(i+1);
      means.push(el);
    } else {
      el.data_type = 'material';
      el.data_key = el.data_type +'_'+(i+1);
      materials.push(el);
    }

    hash_mean_material[el.data_key] = {
      type: el.data_type,
      inventory_id,
      package_id,
      price,
      checked: false,
      quantity: 1,
      row_id,
    };
  });

  return {
    means,
    materials,
    hash_mean_material
  };
}


// =================================================
async function page_history_about_means_materials(ctx, next, request1C, GetEmployeeData, templateCtx) {
  try {
    const { uuid, token } = new AuthApi(ctx).get_auth_data();
    const create_req_for_1c = () => new Request1Cv3(token, uuid, null, ctx);
    const employee_id = ctx.params.employee_id;

    const data_for_1c = {
      EmployeeID: employee_id,
      Count: 10,
      From: 1,
      Filter: {
        Status: null
      }
    };

    data_for_1c.Filter.Status = 'Active';
    const inventory_request_list_active = await get_inventory_request(create_req_for_1c, data_for_1c);

    data_for_1c.Filter.Status = 'Complete';
    const inventory_request_list_complete = await get_inventory_request(create_req_for_1c, data_for_1c);

    if (!inventory_request_list_active.ok) {
      throw new inventory_request_list_active.error;
    } else if (!inventory_request_list_complete.ok) {
      throw inventory_request_list_complete.error;
    }
    const list_request_id_active = inventory_request_list_active.data.InventoryRequestList.map(({ InventoryRequestID }) => InventoryRequestID);
    const list_request_id_complete = inventory_request_list_complete.data.InventoryRequestList.map(({ InventoryRequestID }) => InventoryRequestID);

    let inventory_request_active = await get_info_about_inventory_request(
      create_req_for_1c,
      employee_id,
      list_request_id_active
    );
    let inventory_request_complete= await get_info_about_inventory_request(
      create_req_for_1c,
      employee_id,
      list_request_id_complete
    );

    templateCtx.list_inventory_request_active = view_list_inventory_request(inventory_request_active);
    templateCtx.list_inventory_request_complete = view_list_inventory_request(inventory_request_complete);

    // FOR TEST
    // |
    // |
    // V
    // for (var i = 0, l = templateCtx.list_inventory_request_active.length; i < l; i++) {
    //   if (i > 3) {
    //     break;
    //   }
    //   const el = templateCtx.list_inventory_request_active[i];
    //   templateCtx.list_inventory_request_active.push(el);
    // }
    // templateCtx.list_inventory_request_complete = templateCtx.list_inventory_request_active;
    // templateCtx.list_inventory_request_active = null;
    // templateCtx.list_inventory_request_complete = null;


    ctx.status = 200;
    ctx.body = templates.getTemplate(history_about_means_materials)(ctx.proc(templateCtx, ctx));
  } catch (err) {
    logger.warn(err);
    ctx.status = 500;
    ctx.body = 'Internal error';
  }
}

// return –– {
//   "InventoryRequestList": [{
//     "Date": "2017-11-13T12:34:28Z",
//     "InventoryRequestID": "fd046e0b-c86e-11e7-80e6-00155d594900",
//     "Status": "Новая"
//   }],
//   "TotalNumber": 7
// }
async function get_inventory_request(create_req_for_1c, data_for_1c) {
  const req_for_1c = create_req_for_1c();
  req_for_1c.add('Employee.GetInventoryRequestList', data_for_1c);
  await req_for_1c.do();
  const { 'Employee.GetInventoryRequestList': inventory_request_list } = req_for_1c.get_all();
  return inventory_request_list;
}


// return –– [{
//   "Date": "2017-11-13T12:34:28Z",
//   "Status": "Новая",
//   "InventoryList": [{
//     "InventoryTitle": "Моп 16001 (40*9) евромоп фибра",
//     "PackageTitle": "шт",
//     "Quantity": 1,
//     "Amount": 100
//   }]
// }]
async function get_info_about_inventory_request(create_req_for_1c, employee_id, list_request_id) {
  const list = [];
  await promise_api.queue(list_request_id, async function (inventory_id) {
    const req_for_1c = create_req_for_1c();
    req_for_1c.add('Employee.GetInventoryRequest', {
      EmployeeID: employee_id,
      InventoryRequestID: inventory_id
    });
    await req_for_1c.do();
    const { 'Employee.GetInventoryRequest': res } = req_for_1c.get_all();
    if (res.ok) {
      list.push(res.data);
    } else {
      logger.warn(res);
    }
  });
  return list;
}


// twice_list_inventory_request –– [{
//   "Date": "2017-11-13T12:34:28Z",
//   "Status": "Новая",
//   "InventoryList": [{
//     "InventoryTitle": "Моп 16001 (40*9) евромоп фибра",
//     "PackageTitle": "шт",
//     "Quantity": 1,
//     "Amount": 100
//   }]
// }]
// return [{
//     date: '2018-03-07T08:05:09Z',
//     list: [{
//       inventory_title: el.InventoryTitle,
//       package_title: el.PackageTitle && el.PackageTitle.replace(/\d+/g, ''),
//       quantity: el.Quantity,
//       amount: el.Amount * el.Quantity,
//     }]
// }]
function view_list_inventory_request(twice_list_inventory_request) {
  const res = twice_list_inventory_request.map(data_inventory_request => {
    return Object.assign(
      {},
      { date: data_inventory_request.Date, },
      { list: view_one_inventory_request(data_inventory_request.InventoryList || []) }
    );
  });
  return res.length ? res : null;
}


// data_inventory_request –– {
//   "Date": "2017-11-13T12:34:28Z",
//   "Status": "Новая",
//   "InventoryList": [{
//     "InventoryTitle": "Моп 16001 (40*9) евромоп фибра",
//     "PackageTitle": "шт",
//     "Quantity": 1,
//     "Amount": 100
//   }]
// }
function view_one_inventory_request(data_inventory_request) {
  return data_inventory_request.map((el, i) => {
    return {
      row_index: i,
      inventory_title: el.InventoryTitle,
      package_title: el.PackageTitle && el.PackageTitle.replace(/\d+/g, ''),
      quantity: el.Quantity,
      amount: el.Amount,
    };
  });
}

