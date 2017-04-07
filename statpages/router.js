"use strict";

const Router = require('koa-router');
const router = new Router();
const fs = require('fs-promise')
const { getTemplate, loadTemplate } = require('utils')
const logger = require('logger')(module)
const {URL} = require('url')
const { checkPromotionUrl } = require('promotions')
const { CITIES } = require('cities')

const re_slash = new RegExp('\/', 'g');




const statpagesRouter = new Router();

const sectionListRegExp = [
    new RegExp('^/articles'),
    new RegExp('^/faq'),
    new RegExp('^/otzivi'),
    new RegExp('^/news'),
    //new RegExp('^/skidki_akcii'),
    new RegExp('^/private'),
    new RegExp('^/gallery'),
]

const moscowTemplates = {
    // NGINX DJANGO
    //'contract__active__': {name: 'contract__active__.html'},
    //'contract__deactive__': {name: 'contract__deactive__.html'},
    // END NGINX
    'dir': 'templates/statpages/www/',
    'key': 'moscow',
    //'akcii__return': {name: 'akcii__return.html'},
    //'sitemap': {name: 'sitemap.html'},

    //'domrabotnica__perechen_rabot': {name: 'domrabotnica__perechen_rabot.html'},
    //'akcii__glazhka': {name: 'akcii__glazhka.html'},
    //'uborka-kottedzhej_posle_remonta': {name: 'uborka-kottedzhej_posle_remonta.html'},
    //'search': {name: 'search.html'},
    //'kristallizatsiya-i-restavratsiya-mramornykh-polov': {name: 'kristallizatsiya-i-restavratsiya-mramornykh-polov.html'},
    // Exist

    // AB test
    'ab': {name: 'main_ab.html', data: {menu: {index: true}, generateCanonical: () => buildUrl('moscow', '/')}},

    'main': {name: 'main.html', data: {menu: {index: true}}},
    'strahovka__': {name: 'strahovka__.html', data:{ menu:{physical: true }}},
    'garantii__': {name: 'garantii__.html', data:{ menu:{physical: true }}},
    'ezhednevnaya_uborka_ofisov': {name: 'ezhednevnaya_uborka_ofisov.html', ServiceName: 'Уборка офисов', data:{ menu:{legal: true, uborka_ofisov: true}}},
    'generalnaya_uborka_ofisov': {name: 'generalnaya_uborka_ofisov.html', ServiceName: 'Уборка офисов', data:{ menu:{legal: true, uborka_ofisov: true}}},
    'vechernyaya_uborka_ofisov': {name: 'vechernyaya_uborka_ofisov.html', ServiceName: 'Уборка офисов', data:{menu:{legal: true, uborka_ofisov: true}}},
    'utrennyaya_uborka_ofisov': {name: 'utrennyaya_uborka_ofisov.html', ServiceName: 'Уборка офисов', data:{ menu:{legal: true, uborka_ofisov: true}}},
    'uborka_sluzhebnyh_pomeshhenij': {name: 'uborka_sluzhebnyh_pomeshhenij.html', ServiceName: 'Промышленный альпинизм', data:{ menu:{legal: true, promyshlennyj_alpinizm: true}}},
    'mite_potolkov': {name: 'mite_potolkov.html', ServiceName: 'Генеральная уборка', data:{ menu:{ generalnaya_uborka: true}}},
    'uborka_territorii': {name: 'uborka_territorii.html', ServiceName: 'Уборка производственных помещений', data:{ menu:{legal: true, uborka_proizvodstvennyh_pomewenij: true}}},
    'uborka_kvartir': {name: 'uborka_kvartir.html', ServiceName: 'Поддерживающая уборка', data:{ menu:{podderzhka: true}}},

    'uborka_kvartir__balconi': {name: 'uborka_kvartir__balconi.html', ServiceName: 'Поддерживающая уборка', data:{ menu:{podderzhka: true}}},
    'uborka_kvartir__chetirehkomnatnaya': {name: 'uborka_kvartir__chetirehkomnatnaya.html', ServiceName: 'Поддерживающая уборка', data:{ menu:{ podderzhka: true}}},
    'uborka_kvartir__dvuhkomnatnaya': {name: 'uborka_kvartir__dvuhkomnatnaya.html', ServiceName: 'Поддерживающая уборка', data:{ menu:{ podderzhka: true}}},
    'uborka_kvartir__odnokomnatnaya': {name: 'uborka_kvartir__odnokomnatnaya.html', ServiceName: 'Поддерживающая уборка', data:{ menu:{ podderzhka: true}}},
    'uborka_kvartir__trehkomnatnaya': {name: 'uborka_kvartir__trehkomnatnaya.html', ServiceName: 'Поддерживающая уборка', data:{ menu:{ podderzhka: true}}},

    'master_po_remontu_mebeli': {name: 'master_po_remontu_mebeli.html', ServiceName: 'Вызов мастера', data:{ menu:{physical: true, vizov_mastera_na_dom: true}}},
    'kompleksnaya_uborka': {name: 'kompleksnaya_uborka.html', ServiceName: 'Поддерживающая уборка', data:{ menu:{ podderzhka: true}}},
    'ezhednevnaya_uborka': {name: 'ezhednevnaya_uborka.html', ServiceName: 'Поддерживающая уборка', data:{ menu:{ podderzhka: true}}},
    'melkii-remont': {name: 'melkii-remont.html', ServiceName: 'Вызов мастера', data:{ menu:{physical: true, vizov_mastera_na_dom: true}}},
    'glazhka': {name: 'glazhka.html', ServiceName: 'Глажка', data:{ menu:{physical: true, glazhka: true}}},
    'price__': {name: 'price__.html', ServiceName: 'Цены', data:{ menu:{main: true, price: true}}},
    'uslugi__': {name: 'uslugi__.html', ServiceName: 'Услуги', data: { menu:{main: true, uslugi: true}}},
    'contacts__': {name: 'contacts__.html', ServiceName: 'Контакты', data:{ menu:{contacts: true}}},
    'himchistka': {name: 'himchistka.html', ServiceName: 'Химчистка', data:{ menu:{physical: true, himchistka: true}}},
    'himchistka__chistka_mebeli': {name: 'himchistka__chistka_mebeli.html', ServiceName: 'Химчистка', data:{ menu:{physical: true, himchistka: true}}},
    'himchistka__chistka_matrasov': {name: 'himchistka__chistka_matrasov.html', ServiceName: 'Химчистка', data:{ menu:{physical: true, himchistka: true}}},
    'himchistka__chistka_kovrolina_i_kovrov': {name: 'himchistka__chistka_kovrolina_i_kovrov.html', ServiceName: 'Химчистка', data:{ menu:{physical: true, himchistka: true}}},
    'promyshlennyj-alpinizm': {name: 'promyshlennyj-alpinizm.html', ServiceName: 'Промышленный альпинизм', data:{ menu:{legal: true, promyshlennyj_alpinizm: true}}},
    'promyshlennyj-alpinizm__mite_okon_na_visote__': {name: 'promyshlennyj-alpinizm__mite_okon_na_visote__.html', ServiceName: 'Промышленный альпинизм', data:{ menu:{legal: true, promyshlennyj_alpinizm: true}}},
    'davay_druzhit__': {name: 'davay_druzhit__.html', data: { menu:{main: true, davay_druzhit: true}}},
    'vazhno_znat__': {name: 'vazhno_znat__.html', data: { menu:{main: true, vazhno_znat: true}}},
    'myte-fasadov': {name: 'myte-fasadov.html', ServiceName: 'Мытьё фасадов', data:{ menu:{legal: true, myte_fasadov: true}}},
    'mite_stekol': {name: 'mite_stekol.html', ServiceName: 'Мытье стекол', data:{ menu:{legal: true, mite_stekol: true}}},
    'ofisnyy-master': {name: 'ofisnyy-master.html', ServiceName: 'Вызов мастера', data:{ menu:{legal: true, ofisnyy_master: true}}},
    'uborka-proizvodstvennyh-pomewenij': {name: 'uborka-proizvodstvennyh-pomewenij.html', ServiceName: 'Уборка производственных помещений', data:{ menu:{legal: true, uborka_proizvodstvennyh_pomewenij: true}}},
    'uborka_ofisov': {name: 'uborka_ofisov.html', ServiceName: 'Уборка офисов', data:{ menu:{legal: true, uborka_ofisov: true}}},
    'chistka_basseynov': {name: 'chistka_basseynov.html', ServiceName: 'Обработка поверхностей', data:{ menu:{legal: true, obrabotka_poverhnostey: true}}},
    'polirovka-polov': {name: 'polirovka-polov.html', ServiceName: 'Обработка поверхностей', data:{ menu:{legal: true, obrabotka_poverhnostey: true}}},
    'obrabotka_poverhnostey': {name: 'obrabotka_poverhnostey.html', ServiceName: 'Обработка поверхностей', data:{ menu:{legal: true, obrabotka_poverhnostey: true}}},
    'vizov_mastera_na_dom': {name: 'vizov_mastera_na_dom.html', ServiceName: 'Вызов мастера', data:{ menu:{physical: true, vizov_mastera_na_dom: true}}},
    'mite_okon': {name: 'mite_okon.html', ServiceName: 'Мойка окон', data:{ menu:{ mite_okon: true}}},
    'uborka-kottedzhej': {name: 'uborka-kottedzhej.html', ServiceName: 'Уборка коттеджей', data:{ menu:{physical: true, uborka_kottedzhej: true}}},
    'posle_remonta': {name: 'posle_remonta.html', ServiceName: 'Уборка после ремонта', data:{ menu:{physical: true, posle_remonta: true}}},
    'generalnaya_uborka': {name: 'generalnaya_uborka.html', ServiceName: 'Генеральная уборка', data:{ menu:{ generalnaya_uborka: true}}},
    'domrabotnica': {name: 'domrabotnica.html', ServiceName: 'Домработница', data:{ menu:{physical: true, domrabotnica: true}}},
    'drugie_raboty': {name: 'drugie_raboty.html', ServiceName: 'Дополнительные работы', data:{ menu:{physical: true}}},
    'podderzhka': {name: 'podderzhka.html', ServiceName: 'Поддерживающая уборка', data:{ menu:{ podderzhka: true}}},
    'about__': {name: 'about__.html', ServiceName: 'О компании', data:{ menu:{main: true, about: true}}},
    'b2b__': {name: 'b2b__.html', ServiceName: 'B2B', data:{ menu:{physical: true}}},
    'vakansii__': {name: 'vakansii__.html', ServiceName: 'Вакансии', data:{ menu:{main: true, vakansii: true}}},
    'vakansii__domrabotnica__': {name: 'vakansii__.html', ServiceName: 'Вакансии - Домработница', data: { domrabotnica: true, menu:{ main: true, vakansii: true}}},
    'vakansii__uborka-kvartir__': {name: 'vakansii__.html', ServiceName: 'Вакансии - Уборка квартир', data: { uborkaKvartir: true, menu:{ main: true, vakansii: true}}},
    'vakansii__uborka-territorii__': {name: 'vakansii__.html', ServiceName: 'Вакансии - Уборка территории', data: { uborkaTerritorii: true, menu:{ main: true, vakansii: true}}}
}

const spbTemplates = {
    // AB test
    'ab': {name: 'main_ab.html', data: {menu: {index: true, generateCanonical: () => buildUrl('spb', '/')}}},

    'dir': 'templates/statpages/spb/',
    'key': 'spb',
    'strahovka__': {name: 'strahovka__.html', data: {noindex: true, menu:{physical: true}}},
    'garantii__': {name: 'garantii__.html', data: {noindex: true, menu:{physical: true}}},
    'generalnaya_uborka_ofisov': {name: 'generalnaya_uborka_ofisov.html', ServiceName: 'Уборка офисов', data:{ menu:{legal: true, uborka_ofisov: true}}},
    'ezhednevnaya_uborka_ofisov': {name: 'ezhednevnaya_uborka_ofisov.html', ServiceName: 'Уборка офисов', data:{ menu:{legal: true, uborka_ofisov: true}}},
    'b2b__': {name: 'b2b__.html', ServiceName: 'B2B', data:{ menu:{physical: true}}},
    'glazhka': {name: 'glazhka.html', ServiceName: 'Глажка', data:{ menu:{physical: true, glazhka: true}}},
    'drugie_raboty': {name: 'drugie_raboty.html', ServiceName: 'Дополнительные работы', data:{ menu:{physical: true}}},
    'ezhednevnaya_uborka': {name: 'ezhednevnaya_uborka.html', ServiceName: 'Поддерживающая уборка', data:{ menu:{ podderzhka: true}}},
    'price__': {name: 'price__.html', ServiceName: '', data:{ menu:{price: true, main: true}}},
    'vizov_mastera_na_dom': {name: 'vizov_mastera_na_dom.html', ServiceName: 'Вызов мастера', data:{ menu:{physical: true, vizov_mastera_na_dom: true}}},
    'melkii-remont': {name: 'melkii-remont.html', ServiceName: 'Вызов мастера', data:{ menu:{physical: true, vizov_mastera_na_dom: true}}},
    'mite_stekol': {name: 'mite_stekol.html', ServiceName: 'Мытье стекол', data:{ menu:{legal: true, mite_stekol: true}}},
    'mite_okon': {name: 'mite_okon.html', ServiceName: 'Мойка окон', data:{ menu:{ mite_okon: true}}},
    'myte-fasadov': {name: 'myte-fasadov.html', ServiceName: 'Мытьё фасадов', data:{ menu:{legal: true, myte_fasadov: true}}},
    //'mite_potolkov': {name: 'mite_potolkov.html', ServiceName: 'Генеральная уборка', data:{ menu:{ generalnaya_uborka: true}}},
    'podderzhka': {name: 'podderzhka.html', ServiceName: 'Поддерживающая уборка', data:{ menu:{ podderzhka: true}}},
    //'polirovka-polov': {name: 'polirovka-polov.html', ServiceName: 'Обработка поверхностей', data:{ menu:{legal: true, obrabotka_poverhnostey: true}}},
    'uborka_ofisov': {name: 'uborka_ofisov.html', ServiceName: 'Уборка офисов', data:{ menu:{legal: true, uborka_ofisov: true}}},
    'uborka_kvartir': {name: 'uborka_kvartir.html', ServiceName: 'Поддерживающая уборка', data:{ menu:{ podderzhka: true}}},
    'uborka-kottedzhej': {name: 'uborka-kottedzhej.html', ServiceName: 'Уборка коттеджей', data:{ menu:{physical: true, uborka_kottedzhej: true}}},
    'posle_remonta': {name: 'posle_remonta.html', ServiceName: 'Уборка после ремонта', data:{ menu:{physical: true, posle_remonta: true}}},
    'uborka_territorii': {name: 'uborka_territorii.html', ServiceName: 'Уборка производственных помещений', data:{ menu:{legal: true, uborka_proizvodstvennyh_pomewenij: true}}},
    'uborka-proizvodstvennyh-pomewenij': {name: 'uborka-proizvodstvennyh-pomewenij.html', ServiceName: 'Уборка производственных помещений', data:{ menu:{legal: true, uborka_proizvodstvennyh_pomewenij: true}}},
    'domrabotnica': {name: 'domrabotnica.html', ServiceName: 'Домработница', data:{ menu:{physical: true, domrabotnica: true}}},
    'himchistka': {name: 'himchistka.html', ServiceName: 'Химчистка', data:{ menu:{physical: true, himchistka: true}}},
    'himchistka__chistka_kovrolina_i_kovrov': {name: 'himchistka__chistka_kovrolina_i_kovrov.html', ServiceName: 'Химчистка', data:{ menu:{physical: true, himchistka: true}}},
    'about__': {name: 'about__.html', ServiceName: 'О компанни', data: {noindex: true, menu:{main: true, about: true}}},
    'uslugi__': {name: 'uslugi__.html', ServiceName: 'Услуги', data: { menu:{main: true, uslugi: true}}},
    'generalnaya_uborka': {name: 'generalnaya_uborka.html', ServiceName: 'Химчистка', data:{ menu:{ generalnaya_uborka: true}}},
    'main': {name: 'main.html', ServiceName: 'Главная', data: {menu: {index: true}}},
    'contacts__': {name: 'contacts__.html', ServiceName: 'Контакты', data:{ menu:{contacts: true}}},
    'davay_druzhit__': {name: 'davay_druzhit__.html', ServiceName: 'Давай дружить', data: {noindex: true, menu:{main: true, davay_druzhit: true}}},
    'vazhno_znat__': {name: 'vazhno_znat__.html', ServiceName: 'Важно знать', data: {menu:{main: true, vazhno_znat: true}, noindex: true}},
    'vakansii__': {name: 'vakansii__.html', ServiceName: 'Вакансии', data:{ menu:{main: true, vakansii: true}}},
    'vakansii__domrabotnica__': {name: 'vakansii__.html', ServiceName: 'Вакансии - Домработница', data: {domrabotnica: true, menu:{ main: true, vakansii: true}}},
    'vakansii__uborka-kvartir__': {name: 'vakansii__.html', ServiceName: 'Вакансии - Уборка квартир', data: {uborkaKvartir: true, menu:{ main: true, vakansii: true}}},
    'vakansii__uborka-territorii__': {name: 'vakansii__.html', ServiceName: 'Вакансии - Уборка территории', data: {uborkaTerritorii: true, menu:{ main: true, vakansii: true}}},
};

const cityTemplate = {
    'moscow': moscowTemplates,
    'spb': spbTemplates,
}

function buildUrl(cityKW, url) {
    if (typeof cityKW == 'object') {
        cityKW = cityKW.keyword
    }
    if (checkPromotionUrl(cityKW, url)){
        return CITIES.URL[cityKW] + url
    }
    // TODO for PA
    if (url == '/private/auth'){
        return CITIES.URL['moscow'] + url
    }
    if (checkExistUrl(CITIES.DICT[cityKW], url)){
        return CITIES.URL[cityKW] + url
    } else {
        return CITIES.URL[cityKW]
    }
}

function checkExistUrl(city, path) {
    for (let reg of sectionListRegExp){
        if (reg.exec(path)){
            return true
        }
    }
    let url
    if (path !== '/'){
        url = path.slice(1)
    } else {
        url = 'main'
    }
    let url_without_slash = url.replace(re_slash, '__')
    if (cityTemplate[city.keyword][url_without_slash]){
        return true
    }
}


function getServiceName(city, referer) {
    try{
        let path = new URL(referer).pathname.slice(1)
        let path_without_slash = path.replace(re_slash, '__')
        return cityTemplate[city.keyword][path_without_slash].ServiceName
    } catch (e){
        return null
    }
}

async function loadStatPages(templateDict) {
    let pages = Object.keys(templateDict)
    for (let page of pages){
        if (typeof templateDict[page] == 'object'){
            try{
                await loadTemplate({name: `${templateDict.key+templateDict[page].name}`, path: `${templateDict.dir + templateDict[page].name}`})
            } catch (e){
                logger.error('Error load template ', templateDict.key+templateDict[page].name)
            }
        }
    }
}

loadStatPages(moscowTemplates)
loadStatPages(spbTemplates)

async function getPage(templateDict, page, next) {
    if (templateDict[page] !== undefined){
        let template = getTemplate({name: `${templateDict.key+templateDict[page].name}`, path: `${templateDict.dir + templateDict[page].name}`})
        let data = templateDict[page].data
        return { template, data }
    } else {
        return { template: null}
    }
}

statpagesRouter.get('/manifest.json', async function (ctx, next) {
    ctx.status = 302
    ctx.redirect('/yandex/manifest.json')
})

statpagesRouter.get('/yandex/manifest.json', async function (ctx, next) {
    ctx.type = 'application/json'
    ctx.body = await fs.readFile(`templates/file/yandex_manifest.json`, 'utf-8')
})

statpagesRouter.get('/domovenok.xml', async function (ctx, next) {
    ctx.type = 'application/xml'
    ctx.body = await fs.readFile(`templates/file/domovenok.xml`, 'utf-8')
})

statpagesRouter.get('/sitemap.xml', async function (ctx, next) {
    let sitemap_file = {
        'moscow': 'sitemap_moscow.xml',
        'spb': 'sitemap_spb.xml'
    }
    ctx.type = 'application/xml'
    ctx.body = await fs.readFile(`templates/file/${sitemap_file[ctx.state.pancakeUser.city.keyword]}`, 'utf-8')
})

statpagesRouter.get('/robots.txt', async function (ctx, next) {
    let sitemap_file = {
        'moscow': 'robots_moscow.txt',
        'spb': 'robots_spb.txt'
    }
    ctx.type = 'text/plain'
    ctx.body = await fs.readFile(`templates/file/${sitemap_file[ctx.state.pancakeUser.city.keyword]}`, 'utf-8')
})

statpagesRouter.get('/index.php', async function (ctx, next) {
    ctx.status = 301
    ctx.redirect('/')
})

statpagesRouter.get('/client_id/life/:uuid/', async function (ctx, next) {
    ctx.type = 'application/json'
    ctx.body = JSON.stringify({ Success: false })
})

statpagesRouter.get('/', async function (ctx, next) {
    const { template, data } = await getPage(cityTemplate[ctx.state.pancakeUser.city.keyword], 'main', next)
    ctx.body = template(ctx.proc(data))
})

statpagesRouter.get('/:level1', async function (ctx, next) {
    const end_slash = (ctx.path.substr(ctx.path.length - 1) == '/') ? '__' : ''
    const { template, data } = await getPage(cityTemplate[ctx.state.pancakeUser.city.keyword], ctx.params.level1+end_slash, next)
    if (template === null){
        await next()
    } else {
        ctx.body = template(ctx.proc(data))
    }
})

statpagesRouter.get('/:level1/:level2', async function (ctx, next) {
    const end_slash = (ctx.path.substr(ctx.path.length - 1) == '/') ? '__' : ''
    const { template, data } = await getPage(cityTemplate[ctx.state.pancakeUser.city.keyword], ctx.params.level1+'__'+ctx.params.level2+end_slash, next)
    if (template === null){
        await next()
    } else {
        ctx.body = template(ctx.proc(data))
    }
})

module.exports = {
    statpagesRouter,
    getServiceName,
    buildUrl,
}