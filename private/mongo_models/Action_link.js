'use strict';

const mongoose = require('/p/pancake/lib/mongoose.js');
const Schema = mongoose.Schema;

const schema = new Schema({
  content: {
    type: String,
    required: true
  },
  headers: {
    type: String,
  },
  action: {
    type: String,
    required: true
  },
  key: {
    type: String,
    unique: true,
    required: true
  },
  created:{
    type: Date,
    default: Date.now,
    required: true
  }

}, { strict: true });


schema.static('generate', function(content, action, headers) {
  return new Promise((onSuccess, onError) => {
    const key = UUID({
      withoutDash: true
    });
    return this.create({
        content,
        action,
        key,
        headers
      },
      function(err, callbackAction) {
        if (err) {
          onError(err);
        } else {
          onSuccess(callbackAction.key);
        }
      });
  });
});
module.exports = mongoose.model('ActionLink', schema);


// ===========

/**
 * UUID
 * @param {Object} option:
 */
function UUID(option) {
  var d = new Date().getTime();
  if (option && option.withoutDash) {
    var uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  } else {
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  return uuid;
}

