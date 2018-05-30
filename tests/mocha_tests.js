'use strict';

// START ALL TESTS

const CONF = require('/p/pancake/settings/config.js');
const test_request_as_robot = require('/p/pancake/tests/test_request_as_robot.js');
const test_auth = require('/p/pancake/tests/test_auth.js');

describe('Check API', function() {

  it('check auth for cordova', async function () {
    return await test_auth(CONF.domain);
  });

  it('check user uuid for webbots', async () => {
    return await test_request_as_robot(CONF.domain);
  });

  after(() => {
    global.process.exit(0);
  });
});