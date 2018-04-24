'use strict';

// GENERATED ECOSYSTEM.JSON

const auto_config = exports;

auto_config.remove_leading_space = function (strings, ...values) {
  // Interweave the strings with the
  // substitution vars first.
  var output = '', res = [], i, l;
  for (i = 0, l = values.length; i < l; i++) {
    output += strings[i] + values[i];
  }
  output += strings[l];

  // Split on newlines.
  var lines = output.split(/(?:\r\n|\n|\r)/);

  for (i = 0, l = lines.length; i < l; i++) {
    res.push(lines[i].replace(/^\s+/gm, ''));
  }
  return res.join('\n').trim();
};