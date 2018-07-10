'use strict';
const wf = require('/p/pancake/my/wf.js');

function addRobotsFileInRouting(statpagesRouter) {
  statpagesRouter.get('/manifest.json', async function (ctx) {
    ctx.status = 302;
    ctx.redirect('/yandex/manifest.json');
  });

  statpagesRouter.get('/yandex/manifest.json', async function (ctx) {
    ctx.type = 'application/json';
    ctx.body = await wf.read('templates/file/yandex_manifest.json', 'utf-8');
  });

  statpagesRouter.get('/domovenok.xml', async function (ctx) {
    ctx.type = 'application/xml';
    ctx.body = await wf.read('templates/file/domovenok.xml', 'utf-8');
  });

  statpagesRouter.get('/sitemap.xml', async function (ctx) {
    let sitemap_file = {
      'moscow': 'sitemap_moscow.xml',
      'spb': 'sitemap_spb.xml',
      'nn': 'sitemap_nn.xml'
    };
    ctx.type = 'application/xml';
    ctx.body = await wf.read(`templates/file/${sitemap_file[ctx.state.pancakeUser.city.keyword]}`, 'utf-8');
  });

  statpagesRouter.get('/robots.txt', async function (ctx) {
    const sitemap_file = {
      moscow: 'robots_moscow.txt',
      spb: 'robots_spb.txt',
      nn: 'robots_nn.txt',
    };
    const host = ctx.request.headers.host;
    // www-dev3.domovenok.su
    if (/\w+-\w+\.domovenok\.su/.test(host) || /promyshlennyj-alpinizm\.domovenok\.su/.test(host) || /family.domovenok\.su/.test(host)) {
      ctx.type = 'text/plain';
      ctx.body = await wf.read(`templates/file/robots_dev.txt`, 'utf-8');
    } else {
      ctx.type = 'text/plain';
      ctx.body = await wf.read(`templates/file/${sitemap_file[ctx.state.pancakeUser.city.keyword]}`, 'utf-8');
    }
  });

  statpagesRouter.get('/index.php', async function (ctx) {
    ctx.status = 301;
    ctx.redirect('/');
  });
}

module.exports = {
  addRobotsFileInRouting
};
