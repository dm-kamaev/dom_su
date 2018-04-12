'use strict';
const { models } = require('models');
const { ShortUrl } = models;
const Router = require('koa-router');

const clientShortUrlRouter = new Router();

clientShortUrlRouter.get('/s/:key', async function(ctx, next) {
  const shortUrl = await ShortUrl.findOne({
    where: {
      key: ctx.params.key
    }
  });
  if (shortUrl) {
    if (shortUrl.data) {
      let parseData = JSON.parse(shortUrl.data);
      if (parseData.Luid) {
        ctx.state.pancakeUser.sendTicket('ClientConnect', {
          'luid': parseData.Luid
        });
      }
    }
    if (shortUrl.url && shortUrl.url.startsWith('e1c')) {
      // let iframe = `<iframe src="${shortUrl.url}"></iframe><script>close();</script>`
      // ctx.type = 'text/html; charset=utf-8';
      // ctx.body = `<html><head></head><body>${iframe} <script>${js}</script></body></html>`;
      ctx.type = 'text/html; charset=utf-8';
      ctx.body = h_open_link_1c(shortUrl.url);
    } else {
      ctx.status = 301;
      ctx.redirect(shortUrl.url);
    }
  }
  await next();
});


// render [age with link, js click this link, then open app 1c on computer, then hide link
function h_open_link_1c(url) {
  const js = `
    function getById(id) {
      return document.getElementById(id);
    }
    var $link_to_1c = getById('link_to_1c');
    $link_to_1c.onclick = function() {
      // console.log('CLICK');
      getById('main').style.display = 'none';
    };
    $link_to_1c.click();
  `;

  let html = `
    <html>
      <head></head>
      <body>
        <div id=main style=text-align:center;font-size:120%>
          <a id=link_to_1c href='${url}'>Открыть ссылку в 1С</a>
        </div>
        <script>${js}</script>
      </body>
    </html>
  `;
  return html;
}


module.exports = {
  clientShortUrlRouter
};