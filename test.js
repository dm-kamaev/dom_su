"use strict";

const https = require('https');

var options = {
  hostname: 'www.dev.domovenok.su',
  port: 443,
  path: '/',
  method: 'GET',
  rejectUnauthorized: false
};

var req = https.request(options, (res) => {
  console.log('statusCode:', res.statusCode);
  console.log('headers:', res.headers);

  res.on('data', (d) => {
    //process.stdout.write(d);
  });
});

req.on('error', (e) => {
  //console.error(e);
});
req.end();