'use strict';

// WORK WITH FILE

const fs = require('fs');

const wf = exports;

wf.read = function(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, {
      encoding: 'utf8'
    }, function(err, file) {
      if (err)
        reject(file);
      else {
        resolve(file);
      }
    });
  });
};


wf.write = function(path, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, 'utf8', function (err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};


wf.append = function (path, data) {
  return new Promise((resolve, reject) => {
    fs.appendFile(path, data, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};


wf.write_base64 = function(path, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, { encoding: 'base64' }, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};


wf.read_base64 = function(path, data) {
  return new Promise((resolve, reject) => {
      fs.readFile(path, {
        encoding: 'base64'
      }, function(err, file) {
        if (err)
          reject(file);
        else {
          resolve(file);
        }
      });
    });
};