'use strict';

// RANDOM

const random = exports;

// len –– length of string
random.str = function(len) {
  let text = '';
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const possible_length = possible.length;
  for (var i = 0; i < len; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible_length));
  }
  return text;
};