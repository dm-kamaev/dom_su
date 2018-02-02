#!/usr/local/bin/node

"use strict";

// WORK WITH PARAM COMMAND LINE

const argv = exports;

// return ['param1', 'param2']
argv.get_all = function () { return process.argv.slice(2); };

// node nodejs/my/argv.js form=135 bank_id=1
// { form: '135', bank_id: '1' }
argv.get_hash = function () {
  var hash = {};
  var list = argv.get_all();
  for (var i = 0, l = list.length; i < l; i++) {
    var pair = list[i];
    var els = pair.split('=');
    hash[els[0]] = els[1];
  }
  return hash;
};
// console.log(argv.get_hash().date);

