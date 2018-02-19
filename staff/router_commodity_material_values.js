'use strict';

// const wf = require('/p/pancake/my/wf.js');
// const db = require('/p/pancake/my/db.js');
const Request1Cv3 = require('/p/pancake/api1c/request1Cv3.js');
const decorators = require('/p/pancake/staff/decorators.js');
const AuthApi = require('/p/pancake/auth/authApi.js');
const templates = require('/p/pancake/utils/templates.js');
const logger = require('/p/pancake/lib/logger.js');

const path_cmd_view= { path: '/p/pancake/staff/templates/mobile/means.html' };
templates.loadTemplate(path_cmd_view);

module.exports = function (employee_router) {
  // /staff/f482eb0b-007b-11e6-80de-00155d594900/means_and_materials dev2
  employee_router.get('/staff/:employee_id/means_and_materials', decorators.login_required, decorators.getEmployeeHeader(async function (ctx, next, request1C, GetEmployeeData, templateCtx) {
    try {
      const token = new AuthApi(ctx).get_auth_data().token;
      const request1C = new Request1Cv3(token, null, null, ctx);
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
      await request1C.add('Employee.InventoryList', {}).do();
      const Employee_InventoryList = request1C.get();
      if (!Employee_InventoryList.ok) {
        throw Employee_InventoryList.error;
      }
      const i_list = Employee_InventoryList.data.InventoryList;
      const means = [];
      const materials = [];
      const hash_mean_material = {};
      i_list.forEach((inventory, i) => {
        const quantity = [];
        for (var j = 1, l = inventory.Balance; j < l; j++) { quantity.push(j); }
        const price = inventory.Price;
        const inventory_id = inventory.InventoryID;
        const package_id = inventory.PackageID;
        const el = {
          inventory_id,
          inventory_title: inventory.InventoryTitle,
          inventory_description: inventory.InventoryDescription,
          package_id,
          package_title: inventory.PackageTitle.replace(/\d+/g, ''),
          quantity,
          price
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
          quantity: 1
        };
      });

      const request1Cv3_2 = new Request1Cv3(token, null, null, ctx);
      await request1Cv3_2.add('GetEmployeeData', { EmployeeID: ctx.params.employee_id }).do();
      const getEmployeeData = request1Cv3_2.get();
      if (!getEmployeeData.ok) {
        throw new getEmployeeData.error;
      }


      ctx.status = 200;
      templateCtx.means = means;
      templateCtx.hash_mean_material = JSON.stringify(hash_mean_material);
      templateCtx.materials = materials;
      templateCtx.getEmployeeData = getEmployeeData.data;
      ctx.body = templates.getTemplate(path_cmd_view)(ctx.proc(templateCtx, ctx));
    } catch (err) {
      logger.warn(err);
      ctx.status = 500;
      ctx.body = 'Internal error';
    }
  }));

};
