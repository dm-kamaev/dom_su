'use strict';

const mongoose = require('/p/pancake/lib/mongoose.js');
const Schema = mongoose.Schema;


const schema = new Schema({
  clientId: {
    type: String,
    unique: true,
    required: true
  },
  promo: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    default: Date.now,
    required: true
  }
}, {
  strict: true
});


schema.static('make', function(clientId, promo) {
  return new Promise((onSuccess, onError) => {
    this.create({
      clientId,
      promo
    }, function(err, promoCode) {
      if (err) {
        onError(err);
      } else {
        onSuccess(promoCode);
      }
    });
  });
});

schema.static('getPromo', function(clientId) {
  return new Promise((onSuccess, onError) => {
    this.findOne({
      clientId
    }, function(err, promoCode) {
      if (err) {
        onError(err);
      } else if (promoCode) {
        onSuccess(promoCode.promo);
      } else {
        onSuccess(null);
      }
    });
  });
});

// schema.static('checkAndCreate', function(clientId, promo) {
//   return new Promise((onSuccess, onError) => {
//     this.findOne({
//       clientId: clientId
//     }, function(err, promoCode) {

//       if (err) onError(err);
//       if (promoCode) {
//         onSuccess(promoCode.promo);
//       } else {
//         onSuccess(PromoCode.make(clientId, promo));
//       }
//     });
//   });
// });

module.exports = mongoose.model('PromoCode', schema);
