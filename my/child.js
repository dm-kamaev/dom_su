#!/usr/local/bin/node

'use strict';

// WORK С CHILD PROCESS

const child_process = require('child_process');

const child = exports;


child.exec = function(cmd) {
  return new Promise((resolve, reject) => {
    child_process.exec(cmd, function(err, stdout, stderr) {
      if (err) {
        reject({ stdout, err, stderr });
      } else if (stderr) {
        reject({ stdout, err, stderr });
      } else {
        resolve(stdout);
      }
    });
  });
};

child.sync_shell = function (cmd) {
  try {
    let res = child_process.execSync(cmd);
    // const output = res.output.filter(el => { return el && el.toString(); }).join(' ');
    const output = '';
    const stdout = res.toString();
    return 'STDOUT ='+stdout+'\nOUTPUT = '+output;
  } catch (err) {
    const stderr = (err && err.stderr) ? err.stderr.toString() : '';
    const output = err.output.filter(el => { return el && el.toString(); }).join(' ');
    return new Error('STDERR ='+stderr+'\nOUTPUT = '+output);
  }
};
// console.log(child.exec_sync('ls -alh'));