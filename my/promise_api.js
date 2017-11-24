#!/usr/local/bin/node

"use strict";

// METHODS FOR WORK WITH PRoMISE

const promise_api = exports;

/**
 * queue –– call promise step by step
 * @param  {Array} data
 * @param  {Promise} promise_handler
 * @return {Promise}
 */
promise_api.queue = function (data, promise_handler) {
  let start = Promise.resolve();
  for (let i = 0, l = data.length; i < l; i++) {
    start = start.then((res) => promise_handler(data[i], res));
  }
  return start;
};

// EXMAPLE:
// promise_api.queue([3000, 2000, 1000], function(i) {
//   return new Promise((resolve, reject) => {
//     setTimeout(function() {
//       console.log('HERE=', i);
//       resolve(i);
//       // reject(12312)
//     }, i);
//   });
// }).then(res => console.log(res)).catch(err => console.log(err));