'use strict';

const Router = require('koa-router');
const router = new Router();
const fs = require('fs-promise')
const Handlebars = require('handlebars');

const { adminPanel } = require('./init')

function validationLimit(limit) {
    if (limit){
        if (false === isNaN(limit))
            limit = Number(limit)
            if (limit > 0 && limit < 100){
                return limit
            }
    }
    return 100
}

function validationOffset(offset) {
    if (offset){
        if (false === isNaN(offset))
            offset = Number(offset)
            if (offset > 0){
                return offset - 1
            }
    }
    return 0
}


router.get('/admin', async function (ctx, next) {
    const source = await fs.readFile('admin/template/index.html', 'utf-8')
    const template = Handlebars.compile(source)
    const models = adminPanel.getAllModel()
    ctx.body = template({models:models})
})

router.get('/admin/:model', async function (ctx, next) {
    /* validation param */
    const limit = validationLimit(ctx.query.limit)
    const offset = limit*validationOffset(ctx.query.offset)
    const options = { limit: limit, offset: offset }
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
    const item = await adminPanel.getModelItem(ctx.params.model, ctx.params.id,{})
    console.log(item)
    ctx.body = template({item: item, attr: {id:'OPA'}})
})

module.exports = { router: router }
