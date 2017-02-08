'use strict';

const Router = require('koa-router');
const router = new Router();
const fs = require('fs-promise')
const Handlebars = require('handlebars');

const {adminPanel} = require('./init')

const type_html = {
    'INTEGER': (name, value) => `<span>${name}</span><input value="${value}">`,
    'STRING': (name, value) => `<span>${name}</span><input value="${value}">`,
    'DATEONLY': (name, value) => `<span>${name}</span><input value="${value}">`,
    'TEXT': (name, value) => `<span>${name}</span><textarea>${value}</textarea>`,
    'BOOLEAN': (name, value) => `<span>${name}</span><input type="checkbox" value="${value}">`,
    'DATE': (name, value) => `<span>${name}</span><input value="${value}">`,
    'ref': (name, value) => `<span>${name}</span><select><option>---</option><option selected >${value}</option></select>`,
}

Handlebars.registerHelper({
    'showModel': function (model, attrs) {
        let tag = {}
        const keys = Object.keys(model.dataValues)
        for (let i of attrs){
            if (i.ref === false){
                tag[i.name] = type_html[i.type]
            } else {
                tag[i.refModel.name] = {}
                i.refModel.getRefPreviewField({withType: true}).forEach((refAttr)=>{
                    tag[i.refModel.name][refAttr.name] = type_html.ref
                })
            }
        }
        if (!model) {
            return "Netu"
        }
        let template = ""
        for (let i of keys) {
            if (model.dataValues[i].dataValues){
                for (let refAttr of Object.keys(model.dataValues[i].dataValues)){
                    template += `<div>${tag[i][refAttr](i+refAttr, model.dataValues[i].dataValues[refAttr])}</div>`
                }
            } else {
                template += `<div>${tag[i](i, model.dataValues[i])}</div>`
            }
        }
        return template
    }
});


function validationLimit(limit) {
    if (limit) {
        if (false === isNaN(limit))
            limit = Number(limit)
        if (limit > 0 && limit < 100) {
            return limit
        }
    }
    return 100
}

function validationOffset(offset) {
    if (offset) {
        if (false === isNaN(offset))
            offset = Number(offset)
        if (offset > 0) {
            return offset - 1
        }
    }
    return 0
}


router.get('/admin', async function (ctx, next) {
    const source = await fs.readFile('admin/template/index.html', 'utf-8')
    const template = Handlebars.compile(source)
    const models = adminPanel.getAllModel()
    ctx.body = template({models: models})
})

router.get('/admin/:model', async function (ctx, next) {
    /* validation param */
    const limit = validationLimit(ctx.query.limit)
    const offset = limit * validationOffset(ctx.query.offset)
    const options = {limit: limit, offset: offset}
    /* end vlidation */

    const source = await fs.readFile('admin/template/itemList.html', 'utf-8')
    const template = Handlebars.compile(source)
    const attrList = ['id', 'title']
    const {count, rows} = await adminPanel.getModelItemList(ctx.params.model, options)
    ctx.body = template({itemList: rows, attrList: attrList})
})

router.get('/admin/:model/:id', async function (ctx, next) {
    const source = await fs.readFile('admin/template/itemDetail.html', 'utf-8')
    const template = Handlebars.compile(source)
    const {item, attrs} = await adminPanel.getModelItem(ctx.params.model, ctx.params.id, {})
    ctx.body = template({item: item, attr: attrs})
})

module.exports = {adminRouter: router}
