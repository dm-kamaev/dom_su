'use strict';

// const wf = require('/p/pancake/my/wf.js');
// const db = require('/p/pancake/my/db.js');
const Request1Cv3 = require('/p/pancake/api1c/request1Cv3.js');
const decorators = require('/p/pancake/staff/decorators.js');
const AuthApi = require('/p/pancake/auth/authApi.js');
const templates = require('/p/pancake/utils/templates.js');
const logger = require('/p/pancake/lib/logger.js');

const path_select_means_and_materials= { path: '/p/pancake/staff/templates/mobile/select_means_and_materials.html' };
templates.loadTemplate(path_select_means_and_materials);
const show_current_inventory_request= { path: '/p/pancake/staff/templates/mobile/show_current_inventory_request.html' };
templates.loadTemplate(show_current_inventory_request);

module.exports = function (employee_router) {
  // /staff/f482eb0b-007b-11e6-80de-00155d594900/means_and_materials dev2
  employee_router.get('/staff/:employee_id/means_and_materials', decorators.login_required, decorators.getEmployeeHeader(async function (ctx, next, request1C, GetEmployeeData, templateCtx) {
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
      // console.log('GetEmployeeData=', getEmployeeData);
      // console.log('Employee.GetInventoryRequestList=', getInventoryRequestList);
      // console.log('Employee.GetInventoryRequestList=', Employee_InventoryList);

      if (!getEmployeeData.ok) {
        throw new getEmployeeData.error;
      } else if (!Employee_InventoryList.ok) {
        throw Employee_InventoryList.error;
      } else if (!getInventoryRequestList.ok) {
        throw getInventoryRequestList.error;
      }

      const inventory_request = getInventoryRequestList.data.InventoryRequestList[0];
      if (inventory_request) { // show view with exist inventory request
        const info_inventory_request = await view_info_inventory_request(
          new Request1Cv3(token, uuid, null, ctx),
          inventory_request,
          employee_id
        );
        console.log('HERE === ', info_inventory_request);
        ctx.status = 200;
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
  }));

  // create inventory_request
  employee_router.post('/staff/:employee_id/inventory_request', decorators.login_required, async function (ctx) {
    const request1Cv3 = new Request1Cv3(new AuthApi(ctx).get_auth_data().token, null, null, ctx);
    await request1Cv3.add('NewInventoryRequest', {
      EmployeeID: ctx.params.employee_id,
      InventoryList: ctx.request.body,
      Date: new Date(),
    }).do();
  });

  // close inventory request
  employee_router.delete('/staff/:employee_id/inventory_request/:inventory_request_id', decorators.login_required, async function (ctx) {
    let error;
    try {
      const { uuid, token } = new AuthApi(ctx).get_auth_data();
      const request1Cv3 = new Request1Cv3(token, uuid, null, ctx);
      await request1Cv3.add('CancelInventoryRequest', {
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


// return ––
// [{
//   InventoryTitle: 'Моп 18003 (40*12) абразив',
//   PackageTitle: 'шт',
//   Quantity: 1,
//   Amount: 138
// }]
async function view_info_inventory_request(req_for_1c, inventory_request, employee_id) {
  await req_for_1c.add('Employee.GetInventoryRequest', {
    EmployeeID: employee_id,
    InventoryRequestID: inventory_request.InventoryRequestID
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
  return get_inventory_request.data.InventoryList.map(inventory => {
    return {
      inventory_title: inventory.InventoryTitle,
      package_title: inventory.PackageTitle,
      quantity: inventory.Quantity,
      amount: inventory.Amount,
    };
  });
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
    const package_title = inventory.PackageTitle.replace(/\d+/g, '');

    const quantity = [{ name: 'Не выбрано', value: 0 }];
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
