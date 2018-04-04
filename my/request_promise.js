#!/usr/local/bin/node

"use strict";

// WRAP FOR MODULE request

const request = require('request');

const rp = exports;

/**
 * GET
 * @param  {string} url    'https://www.dev2.domovenok.su/private/get_promotion/6ed99ac9-9657-11e2-beb6-1078d2da50b0'
 * @param  {object} option { rejectUnauthorized: false }
 * @return {promise}
 * {
     error,
     response,
     body
   }
 */
rp.get = function (url, option) {
  return new Promise((resolve, reject) => {
    request(url, option, function (error, response, body) {
      if (error) {
        reject(error);
      } else {
        const content_type = response.headers['content-type'];
        if (/application\/json/.test(content_type)) {
          body = JSON.parse(body);
        }
        resolve({
          error,
          response,
          body
        });
      }
    });
  });
};

// EXMAPLE
// rp.get('http://www.google.com')
//    .then(({ response, body }) => console.log(response, body))
//    .catch(err => console.log('Error= '+err));


// rp.get('https://www.dev2.domovenok.su/private/get_promotion/6ed99ac9-9657-11e2-beb6-1078d2da50b0')
//    .then(({ response, body }) => console.log(response, body))
//    .catch(err => console.log('Error= '+err));


rp.post = function (url, option) {
  option = option || {};
  if (!option.headers) {
    option.headers = {};
  }
  option.method = 'POST';
  if (option.json) {
    option.headers['content-type'] = 'application/json';
  }
  return new Promise((resolve, reject) => {
    request(url, option, function (error, response, body) {
      if (error) {
        reject(error);
      } else {
        const content_type = response.headers['content-type'];
        // console.log(body);
        // if (/application\/json/.test(content_type)) {
        //   body = JSON.parse(body);
        // }
        resolve({
          error,
          response,
          body
        });
      }
    });
  });
};