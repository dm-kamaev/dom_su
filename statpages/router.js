"use strict";

const Router = require('koa-router');
const router = new Router();
const fs = require('fs-promise')
const Handlebars = require('handlebars');

const statpagesRouter = new Router();


const moscowTemplates = {
    'dir': 'templates/statpages/www/',
    'main': {name: 'main.html'},
    'ezhednevnaya_uborka_ofisov': {name: 'ezhednevnaya_uborka_ofisov.html', ServiceName: 'Ежедневная уборка офисов'},
    'generalnaya_uborka_ofisov': {name: 'generalnaya_uborka_ofisov.html', ServiceName: 'Генеральная уборка офисов'},
    'domrabotnica__perechen_rabot': {name: 'domrabotnica__perechen_rabot.html'},
    'vechernyaya_uborka_ofisov': {name: 'vechernyaya_uborka_ofisov.html'},
    'utrennyaya_uborka_ofisov': {name: 'utrennyaya_uborka_ofisov.html'},
    'akcii__return': {name: 'akcii__return.html'},
    'contract__active__': {name: 'contract__active__.html'},
    'contract__deactive__': {name: 'contract__deactive__.html'},
    'akcii__glazhka': {name: 'akcii__glazhka.html'},
    'uborka-kottedzhej_posle_remonta': {name: 'uborka-kottedzhej_posle_remonta.html'},
    'uborka_sluzhebnyh_pomeshhenij': {name: 'uborka_sluzhebnyh_pomeshhenij.html'},
    'mite_potolkov': {name: 'mite_potolkov.html'},
    'uborka_territorii': {name: 'uborka_territorii.html'},
    'uborka_kvartir': {name: 'uborka_kvartir.html'},
    'master_po_remontu_mebeli': {name: 'master_po_remontu_mebeli.html'},
    'kompleksnaya_uborka': {name: 'kompleksnaya_uborka.html'},
    'ezhednevnaya_uborka': {name: 'ezhednevnaya_uborka.html'},
    'melkii-remont': {name: 'melkii-remont.html'},
    'sitemap': {name: 'sitemap.html'},
    'strahovka__': {name: 'strahovka__.html'},
    'garantii__': {name: 'garantii__.html'},
    'search': {name: 'search.html'},
    'shemi_okon__': {name: 'shemi_okon__.html'},
    'price__': {name: 'price__.html'},
    'uslugi__': {name: 'uslugi__.html'},
    'contacts__': {name: 'contacts__.html'},
    'himchistka': {name: 'himchistka.html'},
    'himchistka__chistka_mebeli': {name: 'himchistka__chistka_mebeli.html'},
    'himchistka__chistka_matrasov': {name: 'himchistka__chistka_matrasov.html'},
    'himchistka__chistka_kovrolina_i_kovrov': {name: 'himchistka__chistka_kovrolina_i_kovrov.html'},
    'promyshlennyj-alpinizm': {name: 'promyshlennyj-alpinizm.html'},
    'promyshlennyj-alpinizm__mite_okon_na_visote__': {name: 'promyshlennyj-alpinizm__mite_okon_na_visote__.html'},
    'davay_druzhit__': {name: 'davay_druzhit__.html'},
    'vazhno_znat__': {name: 'vazhno_znat__.html'},
    'myte-fasadov': {name: 'myte-fasadov.html'},
    'mite_stekol': {name: 'mite_stekol.html'},
    'ofisnyy-master': {name: 'ofisnyy-master.html'},
    'uborka-proizvodstvennyh-pomewenij': {name: 'uborka-proizvodstvennyh-pomewenij.html'},
    'uborka_ofisov': {name: 'uborka_ofisov.html'},
    'chistka_basseynov': {name: 'chistka_basseynov.html'},
    'polirovka-polov': {name: 'polirovka-polov.html'},
    'kristallizatsiya-i-restavratsiya-mramornykh-polov': {name: 'kristallizatsiya-i-restavratsiya-mramornykh-polov.html'},
    'obrabotka_poverhnostey': {name: 'obrabotka_poverhnostey.html'},
    'vizov_mastera_na_dom': {name: 'vizov_mastera_na_dom.html'},
    'mite_okon': {name: 'mite_okon.html'},
    'uborka-kottedzhej': {name: 'uborka-kottedzhej.html'},
    'posle_remonta': {name: 'posle_remonta.html'},
    'generalnaya_uborka': {name: 'generalnaya_uborka.html'},
    'domrabotnica': {name: 'domrabotnica.html'},
    'drugie_raboty': {name: 'drugie_raboty.html'},
    'podderzhka': {name: 'podderzhka.html'},
    'about__': {name: 'about__.html'},
    'b2b__': {name: 'b2b__.html'},
    'vakansii__': {name: 'vakansii__.html'},
    'vakansii__domrabotnica__': {name: 'vakansii__.html', data: {domrabotnica: true}},
    'vakansii__uborka-kvartir__': {name: 'vakansii__.html', data: {uborkaKvartir: true}},
    'vakansii__uborka-territorii__': {name: 'vakansii__.html', data: {uborkaTerritorii: true}},
}

const spbTemplates = {
    'dir': 'templates/statpages/spb/',
    'generalnaya_uborka_ofisov': {name: 'generalnaya_uborka_ofisov.html'},
    'ezhednevnaya_uborka_ofisov': {name: 'ezhednevnaya_uborka_ofisov.html'},
    'b2b__': {name: 'b2b__.html'},
    'glazhka': {name: 'glazhka.html'},
    'ezhednevnaya_uborka': {name: 'ezhednevnaya_uborka.html'},
    'kompleksnaya_uborka': {name: 'kompleksnaya_uborka.html'},
    'price__': {name: 'price__.html'},
    'vizov_mastera_na_dom': {name: 'vizov_mastera_na_dom.html'},
    'melkii-remont': {name: 'melkii-remont.html'},
    'mite_stekol': {name: 'mite_stekol.html'},
    'mite_okon': {name: 'mite_okon.html'},
    'myte-fasadov': {name: 'myte-fasadov.html'},
    'mite_potolkov': {name: 'mite_potolkov.html'},
    'podderzhka': {name: 'podderzhka.html'},
    'polirovka-polov': {name: 'polirovka-polov.html'},
    'uborka_ofisov': {name: 'uborka_ofisov.html'},
    'uborka_kvartir': {name: 'uborka_kvartir.html'},
    'uborka-kottedzhej': {name: 'uborka-kottedzhej.html'},
    'posle_remonta': {name: 'posle_remonta.html'},
    'uborka_territorii': {name: 'uborka_territorii.html'},
    'uborka-proizvodstvennyh-pomewenij': {name: 'uborka-proizvodstvennyh-pomewenij.html'},
    'domrabotnica': {name: 'domrabotnica.html'},
    'himchistka': {name: 'himchistka.html'},
    'himchistka__chistka_kovrolina_i_kovrov': {name: 'himchistka__chistka_kovrolina_i_kovrov.html'},
    'about__': {name: 'about__.html', noindex: true},
    'uslugi__': {name: 'uslugi__.html'},
    'generalnaya_uborka': {name: 'generalnaya_uborka.html'},
    'main': {name: 'main.html'},
    'contacts__': {name: 'contacts__.html'},
    'search': {name: 'search.html'},
    'strahovka__': {name: 'strahovka__.html', noindex: true},
    'garantii__': {name: 'garantii__.html', noindex: true},
    'shemi_okon__': {name: 'shemi_okon__.html', noindex: true},
    'davay_druzhit__': {name: 'davay_druzhit__.html', noindex: true},
    'vazhno_znat__': {name: 'vazhno_znat__.html', noindex: true},

    'vakansii__': {name: 'vakansii__.html'},
    'vakansii__domrabotnica__': {name: 'vakansii__.html', data: {domrabotnica: true}},
    'vakansii__uborka-kvartir__': {name: 'vakansii__.html', data: {uborkaKvartir: true}},
    'vakansii__uborka-territorii__': {name: 'vakansii__.html', data: {uborkaTerritorii: true}},
};


let cityTemplate = {
    'moscow': moscowTemplates,
    'spb': spbTemplates,
}

async function getPage(templateDict, page, next) {
    if (templateDict[page] !== undefined){
        let html = await fs.readFile(`${templateDict.dir + templateDict[page].name}`, 'utf-8')
        let noindex = templateDict[page].noindex
        let data = templateDict[page].data
        return { html, noindex, data }
    } else {
        await next()
    }
}

const city = 'moscow'

statpagesRouter.get('/list', async function (ctx, next) {
    ctx.type = 'application/json'
    ctx.body = {'MOSCOW': moscowTemplates, "SPB": spbTemplates}
})

statpagesRouter.get('/robots.txt', async function (ctx, next) {
    ctx.type = 'text/plain'
    ctx.body = "User-agent: *\nDisallow: /\nUser-Agent: Sitereport\nAllow: /"
})

statpagesRouter.get('/', async function (ctx, next) {
    const { html, noindex, data } = await getPage(cityTemplate[ctx.state.pancakeUser.city.keyword], 'main', next)
    const template = Handlebars.compile(html)
    ctx.body = template(data)
})

statpagesRouter.get('/:level1', async function (ctx, next) {
    const end_slash = (ctx.path.substr(ctx.path.length - 1) == '/') ? '__' : ''
    const { html, noindex, data } = await getPage(cityTemplate[ctx.state.pancakeUser.city.keyword], ctx.params.level1+end_slash, next)
    if (html === null){
        await next()
    } else {
        const template = Handlebars.compile(html)
        ctx.body = template(data)
    }
})

statpagesRouter.get('/:level1/:level2', async function (ctx, next) {
    const end_slash = (ctx.path.substr(ctx.path.length - 1) == '/') ? '__' : ''
    const { html, noindex, data } = await getPage(cityTemplate[ctx.state.pancakeUser.city.keyword], ctx.params.level1+'__'+ctx.params.level2+end_slash, next)
    if (html === null){
        await next()
    } else {
        const template = Handlebars.compile(html)
        ctx.body = template(data)
    }
})

module.exports = { statpagesRouter }