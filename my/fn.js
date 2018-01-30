'use strict';

const fn = exports;

fn.deep_value = function (object, path) {
  const parts = path.split('.');
  let val = object;
  for (var i = 0, l = parts.length; i < l; i++) {
    var key = parts[i];
    var temp_val = val[key];
    if (temp_val) {
      val = temp_val;
    } else {
      val = null;
      break;
    }
  }
  return val;
};

// console.log(fn.deep_value({ a: { b: { c: [1,2,3]}}}, 'a.b.c.1'));