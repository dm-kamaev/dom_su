"use strict";

const Router = require('koa-router');
const router = new Router();
const fs = require('fs-promise')
const Handlebars = require('handlebars');

const statpagesRouter = new Router();


const moscowTemplates = {
    'dir': 'templates/statpages/www/',
    'main': {name: 'main.html', noindex: false},
    'ezhednevnaya_uborka_ofisov': {name: 'ezhednevnaya_uborka_ofisov.html', noindex: false},
    'generalnaya_uborka_ofisov': {name: 'generalnaya_uborka_ofisov.html', noindex: false},
    'domrabotnica__perechen_rabot': {name: 'domrabotnica__perechen_rabot.html', noindex: false},
    'vechernyaya_uborka_ofisov': {name: 'vechernyaya_uborka_ofisov.html', noindex: false},
    'utrennyaya_uborka_ofisov': {name: 'utrennyaya_uborka_ofisov.html', noindex: false},
    'akcii__return': {name: 'akcii__return.html', noindex: false},
    'contract__active__': {name: 'contract__active__.html', noindex: false},
    'contract__deactive__': {name: 'contract__deactive__.html', noindex: false},
    'akcii__glazhka': {name: 'akcii__glazhka.html', noindex: false},
    'uborka-kottedzhej_posle_remonta': {name: 'uborka-kottedzhej_posle_remonta.html', noindex: false},
    'uborka_sluzhebnyh_pomeshhenij': {name: 'uborka_sluzhebnyh_pomeshhenij.html', noindex: false},
    'mite_potolkov': {name: 'mite_potolkov.html', noindex: false},
    'uborka_territorii': {name: 'uborka_territorii.html', noindex: false},
    'uborka_kvartir': {name: 'uborka_kvartir.html', noindex: false},
    'master_po_remontu_mebeli': {name: 'master_po_remontu_mebeli.html', noindex: false},
    'kompleksnaya_uborka': {name: 'kompleksnaya_uborka.html', noindex: false},
    'ezhednevnaya_uborka': {name: 'ezhednevnaya_uborka.html', noindex: false},
    'melkii-remont': {name: 'melkii-remont.html', noindex: false},
    'vakansii__': {name: 'vakansii__.html', noindex: false},
    'sitemap': {name: 'sitemap.html', noindex: false},
    'strahovka__': {name: 'strahovka__.html', noindex: false},
    'garantii__': {name: 'garantii__.html', noindex: false},
    'search': {name: 'search.html', noindex: false},
    'shemi_okon__': {name: 'shemi_okon__.html', noindex: false},
    'price__': {name: 'price__.html', noindex: false},
    'uslugi__': {name: 'uslugi__.html', noindex: false},
    'contacts__': {name: 'contacts__.html', noindex: false},
    'himchistka': {name: 'himchistka.html', noindex: false},
    'himchistka__chistka_mebeli': {name: 'himchistka__chistka_mebeli.html', noindex: false},
    'himchistka__chistka_matrasov': {name: 'himchistka__chistka_matrasov.html', noindex: false},
    'himchistka__chistka_kovrolina_i_kovrov': {name: 'himchistka__chistka_kovrolina_i_kovrov.html', noindex: false},
    'promyshlennyj-alpinizm': {name: 'promyshlennyj-alpinizm.html', noindex: false},
    'promyshlennyj-alpinizm__mite_okon_na_visote__': {name: 'promyshlennyj-alpinizm__mite_okon_na_visote__.html', noindex: false},
    'davay_druzhit__': {name: 'davay_druzhit__.html', noindex: false},
    'skidki_akcii__': {name: 'skidki_akcii__.html', noindex: false},
    'vazhno_znat__': {name: 'vazhno_znat__.html', noindex: false},
    'myte-fasadov': {name: 'myte-fasadov.html', noindex: false},
    'mite_stekol': {name: 'mite_stekol.html', noindex: false},
    'ofisnyy-master': {name: 'ofisnyy-master.html', noindex: false},
    'uborka-proizvodstvennyh-pomewenij': {name: 'uborka-proizvodstvennyh-pomewenij.html', noindex: false},
    'uborka_ofisov': {name: 'uborka_ofisov.html', noindex: false},
    'chistka_basseynov': {name: 'chistka_basseynov.html', noindex: false},
    'polirovka-polov': {name: 'polirovka-polov.html', noindex: false},
    'kristallizatsiya-i-restavratsiya-mramornykh-polov': {name: 'kristallizatsiya-i-restavratsiya-mramornykh-polov.html', noindex: false},
    'obrabotka_poverhnostey': {name: 'obrabotka_poverhnostey.html', noindex: false},
    'vizov_mastera_na_dom': {name: 'vizov_mastera_na_dom.html', noindex: false},
    'mite_okon': {name: 'mite_okon.html', noindex: false},
    'uborka-kottedzhej': {name: 'uborka-kottedzhej.html', noindex: false},
    'posle_remonta': {name: 'posle_remonta.html', noindex: false},
    'generalnaya_uborka': {name: 'generalnaya_uborka.html', noindex: false},
    'domrabotnica': {name: 'domrabotnica.html', noindex: false},
    'drugie_raboty': {name: 'drugie_raboty.html', noindex: false},
    'podderzhka': {name: 'podderzhka.html', noindex: false},
    'about__': {name: 'about__.html', noindex: false},
    'b2b__': {name: 'b2b__.html', noindex: false},
}

const spbTemplates = {
    'dir': 'templates/statpages/spb/',
    'generalnaya_uborka_ofisov': {name: 'generalnaya_uborka_ofisov.html', noindex: false},
    'ezhednevnaya_uborka_ofisov': {name: 'ezhednevnaya_uborka_ofisov.html', noindex: false},
    'skidki_akcii__': {name: 'skidki_akcii__.html', noindex: false},
    'b2b__': {name: 'b2b__.html', noindex: false},
    'glazhka': {name: 'glazhka.html', noindex: false},
    'ezhednevnaya_uborka': {name: 'ezhednevnaya_uborka.html', noindex: false},
    'kompleksnaya_uborka': {name: 'kompleksnaya_uborka.html', noindex: false},
    'price__': {name: 'price__.html', noindex: false},
    'vizov_mastera_na_dom': {name: 'vizov_mastera_na_dom.html', noindex: false},
    'melkii-remont': {name: 'melkii-remont.html', noindex: false},
    'mite_stekol': {name: 'mite_stekol.html', noindex: false},
    'mite_okon': {name: 'mite_okon.html', noindex: false},
    'myte-fasadov': {name: 'myte-fasadov.html', noindex: false},
    'mite_potolkov': {name: 'mite_potolkov.html', noindex: false},
    'podderzhka': {name: 'podderzhka.html', noindex: false},
    'polirovka-polov': {name: 'polirovka-polov.html', noindex: false},
    'uborka_ofisov': {name: 'uborka_ofisov.html', noindex: false},
    'uborka_kvartir': {name: 'uborka_kvartir.html', noindex: false},
    'uborka-kottedzhej': {name: 'uborka-kottedzhej.html', noindex: false},
    'posle_remonta': {name: 'posle_remonta.html', noindex: false},
    'uborka_territorii': {name: 'uborka_territorii.html', noindex: false},
    'uborka-proizvodstvennyh-pomewenij': {name: 'uborka-proizvodstvennyh-pomewenij.html', noindex: false},
    'domrabotnica': {name: 'domrabotnica.html', noindex: false},
    'himchistka': {name: 'himchistka.html', noindex: false},
    'himchistka__chistka_kovrolina_i_kovrov': {name: 'himchistka__chistka_kovrolina_i_kovrov.html', noindex: false},
    'about__': {name: 'about__.html', noindex: true},
    'uslugi__': {name: 'uslugi__.html', noindex: false},
    'generalnaya_uborka': {name: 'generalnaya_uborka.html', noindex: false},
    'main': {name: 'main.html', noindex: false},
    'contacts__': {name: 'contacts__.html', noindex: false},
    'search': {name: 'search.html', noindex: false},
    'strahovka__': {name: 'strahovka__.html', noindex: true},
    'garantii__': {name: 'garantii__.html', noindex: true},
    'shemi_okon__': {name: 'shemi_okon__.html', noindex: true},
    'davay_druzhit__': {name: 'davay_druzhit__.html', noindex: true},
    'vazhno_znat__': {name: 'vazhno_znat__.html', noindex: true},
};


let cityTemplate = {
    'moscow': moscowTemplates,
    'spb': spbTemplates,
}

function getCityKeyword() {
    return 'moscow'
}

async function getPage(templateDict, page, next) {
    if (templateDict[page] !== undefined){
        return await fs.readFile(`${templateDict.dir + templateDict[page].name}`, 'utf-8')
    } else {
        return null
    }
}

const city = 'moscow'

statpagesRouter.get('/list', async function (ctx, next) {
    ctx.type = 'application/json'
    ctx.body = {'MOSCOW': moscowTemplates, "SPB": spbTemplates}
})

statpagesRouter.post('/ticket-handler', async function (ctx, next) {
    ctx.type = 'application/json'
    ctx.body = JSON.stringify({ Success: true })
})

statpagesRouter.get('/', async function (ctx, next) {
    const html = await getPage(cityTemplate[city], 'main', next)
    const template = Handlebars.compile(html)
    ctx.body = template()
})

statpagesRouter.get('/:level1', async function (ctx, next) {
    const end_slash = (ctx.path.substr(ctx.path.length - 1) == '/') ? '__' : ''
    const html = await getPage(cityTemplate[city], ctx.params.level1+end_slash, next)
    if (html === null){
        await next()
    } else {
        const template = Handlebars.compile(html)
        ctx.body = template()
    }
})

statpagesRouter.get('/:level1/:level2', async function (ctx, next) {
    const end_slash = (ctx.path.substr(ctx.path.length - 1) == '/') ? '__' : ''
    const html = await getPage(cityTemplate[city], ctx.params.level1+'__'+ctx.params.level2+end_slash, next)
    if (html === null){
        await next()
    } else {
        const template = Handlebars.compile(html)
        ctx.body = template()
    }
})

module.exports = { statpagesRouter }