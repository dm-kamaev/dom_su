'use strict';

const { ShortUrl } = require('/p/pancake/models/models.js');
const Router = require('koa-router');

const clientShortUrlRouter = new Router();

// /s/2wtZbS
clientShortUrlRouter.get('/s/:key', async function(ctx, next) {
  const shortUrl = await ShortUrl.findOne({
    where: {
      key: ctx.params.key
    }
  });
  if (shortUrl) {
    if (shortUrl.data) {
      let parseData = JSON.parse(shortUrl.data);
      const user = ctx.state.pancakeUser;
      if (parseData.Luid && !user.its_robot()) {
        user.sendTicket('ClientConnect', {
          luid: parseData.Luid
        });
      }
    }
    // render page for open in 1c
    if (shortUrl.url && shortUrl.url.startsWith('e1c')) {

      ctx.type = 'text/html; charset=utf-8';
      ctx.body = h_open_link_1c(shortUrl.url);
    } else {
      var url = fix_url(shortUrl.url);
      ctx.status = 301;
      // maybe this: http://www.domovenok.su/payments/?order_id=INV-000000786&amount=12345
      ctx.redirect(url);

      // render page with text about for redirect to client_pa
      // ctx.status = 200;
      // ctx.body = render_page_for_redirect_to_client_pa();
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

// console.log(fix_url('https://www.domovenok.su/private/psm201807?=&luid=f8028052-f053-4bad-a716-896bdcbf1fd5 ')); // rigth url
// console.log(fix_url('https://www.domovenok.su/private/psm201807.?=&luid=f8028052-f053-4bad-a716-896bdcbf1fd5 ')); // wrong url
function fix_url(url) {
  if (/\.su\/private\/psm\d{6}\./.test(url)) {
    url = url.replace(/(psm\d{6})\./g, '$1');
  }
  return url;
}

module.exports = {
  clientShortUrlRouter
};