'use strict';


const assert = require('assert');
const index = require('../index');

describe('index.js', function () {
  it('createEnvFile 、 setEnv 、getEnv', function () {
    index.createEnvFile({ test1: 1, test2: '2', 'test.a': 'a' });
    index.setEnv();
    assert.strictEqual(process.env['etcd.test1'], '1');
    assert.strictEqual(process.env['etcd.test2'], '2');
    assert.strictEqual(process.env['etcd.test.a'], 'a');
    assert.strictEqual(index.getEnv()['etcd.test1'], 1);
    assert.strictEqual(index.getEnv()['etcd.test2'], '2');
    assert.strictEqual(index.getEnv(null, true)['test.a'], 'a');

    const filePath = __dirname + '/etcd.test.env';
    index.createEnvFile({ 'test.env': 'test' }, filePath);
    assert.strictEqual(index.getEnv(filePath, true)['test.env'], 'test');
  });

});