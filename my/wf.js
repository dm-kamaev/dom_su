'use strict';

// WORK WITH FILE

const fs = require('fs');

const wf = exports;

wf.read = function(path) {
  return new Promise((reslove, reject) => {
    fs.readFile(path, {
      encoding: 'utf8'
    }, function(err, file) {
      if (err)
        reject(file);
      else {
        reslove(file);
      }
    });
  });
};


wf.write = function(path, data) {
  return new Promise((reslove, reject) => {
    fs.writeFile(path, data, 'utf8', function (err) {
      if (err) {
        reject(err);
      } else {
        reslove();
      }
    });
  });
};


wf.write_base64 = function(path, data) {
  return new Promise((reslove, reject) => {
    fs.writeFile(path, data, { encoding: 'base64' }, function (err) {
      if (err) {
        reject(err);
      } else {
        reslove();
      }
    });
  });
};


wf.read_base64 = function(path, data) {
  return new Promise((reslove, reject) => {
      fs.readFile(path, {
        encoding: 'base64'
      }, function(err, file) {
        if (err)
          reject(file);
        else {
          reslove(file);
        }
      });
    });
};