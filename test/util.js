'use strict';


const assert = require('assert');
const utils = require('../lib/utils');

describe('lib/utils.js', function () {
  it('assignConfig', function () {
    const configResult = {};
    utils.assignConfig(configResult, { key: '/json', value: '{"json":1}' }, 'json')
    utils.assignConfig(configResult, { key: '/yaml', value: 'yaml: 2\nyaml2: y2' }, 'json')
    utils.assignConfig(configResult, { key: '/ini', value: 'ini=3\nini2 = n3' })
    utils.assignConfig(configResult, { key: '/text', value: 'text' })
    assert.strictEqual(configResult.json, 1);
    assert.strictEqual(configResult.yaml, 2);
    assert.strictEqual(configResult.yaml2, 'y2');
    assert.strictEqual(configResult.ini, '3');
    assert.strictEqual(configResult.ini2, 'n3');
    assert.strictEqual(configResult.text, 'text');

    assert.strictEqual(utils.assignConfig(), undefined);
    assert.strictEqual(utils.assignConfig({}), undefined);
    assert.strictEqual(utils.assignConfig({}, { value: '1' }), undefined);
  });

  it('typeParse', function () {
    assert.strictEqual(utils.typeParse({ key: '/json', value: '{"json":1}' }, 'json').json, 1);
    assert.strictEqual(utils.typeParse({ key: '/yaml', value: 'yaml: 2\nyaml2: y2' }, 'yaml').yaml, 2);
    assert.strictEqual(utils.typeParse({ key: '/ini', value: 'ini=3\nini2 = n3' }, 'ini').ini, '3');
    assert.strictEqual(utils.typeParse({ key: '/text', value: 'textval' }, 'text').text, 'textval');

    assert.strictEqual(utils.typeParse({ key: '/json', value: 'is undefined' }, 'json'), undefined);
    assert.strictEqual(utils.typeParse(), undefined);
  });


  it('jsonParse', function () {
    assert.strictEqual(utils.jsonParse('{"a":1}').a, 1);
    assert.strictEqual(utils.jsonParse(), undefined);
    assert.strictEqual(utils.jsonParse('error'), undefined);
  });

  it('yamlParse', function () {
    const str = `db:
      name: db_name
      host: localhost`
    const yamlResult = utils.yamlParse(str)
    assert.strictEqual(yamlResult.db.name, 'db_name');
    assert.strictEqual(yamlResult.db.host, 'localhost');
    assert.strictEqual(utils.yamlParse(), undefined);
    assert.strictEqual(utils.yamlParse('{a=b:c=d'), undefined);
  });


  it('iniParse', function () {
    const iniResult = utils.iniParse('a=1\nb = abc');
    assert.strictEqual(Number(iniResult.a), 1);
    assert.strictEqual(iniResult.b, 'abc');
    assert.strictEqual(utils.iniParse(), undefined);
    assert.strictEqual(utils.iniParse('error'), undefined);
  });

  it('textParse', function () {
    assert.strictEqual(utils.textParse({ key: '/test/key', value: 'test1' })['test.key'], 'test1');
    assert.strictEqual(utils.textParse({ key: 'test/key/name', value: 'test2' })['test.key.name'], 'test2');
    assert.strictEqual(utils.textParse({ key: 'key', value: 'test3' })['key'], 'test3');
    assert.strictEqual(utils.textParse(), undefined);
    assert.strictEqual(utils.textParse({ value: 'test1' }), undefined);
    assert.strictEqual(utils.textParse({ key: '/test/key' }), undefined);
  });

});