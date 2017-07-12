'use strict';
const fs = require('fs-promise')

function addRobotsFileInRouting(statpagesRouter) {
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
            'spb': 'sitemap_spb.xml',
            'nn': 'sitemap_nn.xml'
        }
        ctx.type = 'application/xml'
        ctx.body = await fs.readFile(`templates/file/${sitemap_file[ctx.state.pancakeUser.city.keyword]}`, 'utf-8')
    })

    statpagesRouter.get('/robots.txt', async function (ctx, next) {
        let sitemap_file = {
            'moscow': 'robots_moscow.txt',
            'spb': 'robots_spb.txt',
            'nn': 'robots_nn.txt'
        }
        ctx.type = 'text/plain'
        ctx.body = await fs.readFile(`templates/file/${sitemap_file[ctx.state.pancakeUser.city.keyword]}`, 'utf-8')
    })

    statpagesRouter.get('/index.php', async function (ctx, next) {
        ctx.status = 301
        ctx.redirect('/')
    })
}

module.exports = {
    addRobotsFileInRouting
}
