#!/usr/local/bin/node

'use strict';

// Safe work with methods object JSON

const json = {};

module.exports = json;

// beautify strignify with two spaces
json.str = function (obj) {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (err) {
    return err;
  }
};

// in one str without format
json.one_str = function (obj) {
  try {
    return JSON.stringify(obj);
  } catch (err) {
    return err;
  }
};

json.parse = function (str) {
  try {
    return JSON.parse(str);
  } catch (err) {
    return err;
  }
};