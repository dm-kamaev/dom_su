'use strict';

const decorators = require('/p/pancake/staff/decorators.js');
const templates = require('/p/pancake/utils/templates.js');
const logger = require('/p/pancake/lib/logger.js');

const path_description_services= { path: '/p/pancake/staff/templates/mobile/description_services.html' };
templates.loadTemplate(path_description_services);


module.exports = function (employee_router) {
  // /staff/fdf74d80-de51-11e7-80e6-00155d594900/description_services dev2
  employee_router.get('/staff/:employee_id/description_services', decorators.login_required, decorators.getEmployeeHeader(page_description_services));
};

// =================================================
async function page_description_services(ctx, next, request1C, GetEmployeeData, templateCtx) {
  try {
    const enum_part = { general_work: 'Общие работы:', kitchen: 'Кухня:', bathroom: 'Ванная комната:' };
    const hash_table = {
      [enum_part.general_work]: [
        { name: 'моем и пылесосим полы и плинтусы', list: [ true, true, true, true], },
        { name: 'удаляем легкие загрязнения: жир, масло и т.д.', list: [ true, true, true, false], },
        { name: 'удаляем сложные загрязнения', list: [false, false, true, false] },
        { name: 'удаляем пыль и моем все горизонтальные поверхности', list: [true, true, true, false] },
        { name: 'удаляем пыль и моем все вертикальные поверхности', list: [true, true, true, false] },
        { name: 'удаляем пыль и паутину со стен', list: [false, false, true, false] },
        { name: 'удаляем пыль со светильников', list: [true, true, true, false] },
        { name: 'удаляем пыль и моем бытовую и кухонную технику', list: [true, true, true, false] },
        { name: 'моем кондиционеры снаружи и внутри, включая фильтры', list: [false, false, true, false] },
        { name: 'пылесосим мягкую мебель внутри', list: [false, false, true, false] },
        { name: 'моем зеркала и стеклянные поверхности', list: [true, true, true, false] },
        { name: 'моем трубы, карнизы, фоторамки, рамы картин и т.д.', list: [true, true, true, true] },
        { name: 'пылесосим мягкую мебель снаружи', list: [true, true, true, false] },
        { name: 'ухаживаем за кожаной мебелью', list: [true, true, true, false]},
        { name: 'меняем постельное белье', list: [true, true, true, false] },
        { name: 'моем двери и дверные блоки', list: [true, true, true, false] }
      ],
      [enum_part.kitchen]: [
        { name: 'чистим и дезинфицируем горизонтальные рабочие поверхности', list: [true, true, true, true], },
        { name: 'моем кухонную плиту и стену над ней', list: [true, true, true, true], },
        { name: 'моем вытяжку внутри, включая фильтры', list: [false, false, true, false], },
        { name: 'моем все вертикальные поверхности', list: [true, true, true, false], },
        { name: 'чистим и обеззараживаем сантехнику', list: [true, true, true, false], },
        { name: 'моем грязную посуду', list: [true, true, true, false], },
        { name: 'моем холодильник снаружи', list: [true, true, true, true], },
        { name: 'моем вытяжку снаружи', list: [true, true, true, false], },
        { name: 'моем микроволновую печь снаружи и внутри', list: [true, true, true, false], },
        { name: 'моем и обеззараживаем мусорную корзину, выносим мусор', list: [true, true, true, true], },
      ],
      [enum_part.bathroom]: [
        { name: 'чистим и обеззараживаем сантехнику и раковину', list: [true, true, true, true], },
        { name: 'моем все зеркальные и стеклянные поверхности', list: [true, true, true, true], },
        { name: 'моем душевую кабину и ванну (снаружи и внутри)', list: [true, true, true, false], },
        { name: 'очищаем межплиточные швы', list: [false, false, true, false], },
      ]
    };

    templateCtx.table_info_services = [{
      name: enum_part.general_work,
      list: hash_table[enum_part.general_work]
    }, {
      name: enum_part.kitchen,
      list: hash_table[enum_part.kitchen],
    }, {
      name: enum_part.bathroom,
      list: hash_table[enum_part.bathroom],
    }];
    ctx.body = templates.getTemplate(path_description_services)(ctx.proc(templateCtx, ctx));
  } catch (err) {
    logger.warn(err);
    ctx.status = 500;
    ctx.body = 'Internal error';
  }
}
// =================================================





