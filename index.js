const Etcd = require('node-etcd');
const { promisify } = require('util');
const fs = require('fs');
const assert = require('assert');
const dotenv = require('dotenv');
const { assignConfig } = require('./lib/utils');
const defualtPath = __dirname + '/etcd.env';

/**
 * 获取远程Etcd配置
 * @param {ClientOptions} clientOptions etcd配置参数信息
 * @returns etcd 配置数据
 */
const fetchRemoteEtcdConfig = async clientOptions => {
  assert(clientOptions, '[etcd-node-config] Property ‘clientOptions’ is required!');
  assert(clientOptions.hosts, '[etcd-node-config] Property ‘clientOptions.hosts’ is required!');
  assert(Array.isArray(clientOptions.paths), '[etcd-node-config] Property ‘clientOptions.paths’ must is Array!');
  if (!clientOptions.paths.length) return;
  for (const pathConfig of clientOptions.paths) {
    if (!(typeof pathConfig === 'string' || Object.prototype.toString.call(pathConfig) === '[object Object]')) {
      assert(false, `[etcd-node-config] Property ‘${pathConfig}’ must is String or Object!`);
    }
    if (Object.prototype.toString.call(pathConfig) === '[object Object]') {
      assert(pathConfig.path, '[etcd-node-config] Property path is required!');
    }
  }
  const configResult = {};
  try {
    const pathConfigs = clientOptions.paths.map(item => typeof item === 'string' ? { path: item } : item);
    const pathTypeObj = pathConfigs.reduce((obj, item) => Object.assign(obj, { [item.path[0] === '/' ? item.path : `/${item.path}`]: item.type }), {})
    const etcd = new Etcd(clientOptions.hosts, clientOptions.options);
    const configDataResult = await Promise.all(pathConfigs.map(config => (promisify(etcd.get).call(etcd, config.path, config.options || {}))));
    configDataResult.forEach(data => {
      if (data.node.dir === true) {
        for (const node of data.node.nodes) {
          if (!node.dir) {
            assignConfig(configResult, node, pathTypeObj[data.node.key])
          } else {
            console.warn('warning： 忽略目录key:', node ? node.key : node)
          }
        }
      } else {
        assignConfig(configResult, data.node, pathTypeObj[data.node.key])
      }
    });
  } catch (error) {
    assert(false, JSON.stringify(error));
  }

  // 写入到 etcd.env 文件中
  createEnvFile(configResult);
  return configResult;
}


/**
 * 生成 etcd.env
 * @param {*} config etcd 配置数据
 * @param {*} filePath 需要将配置数据写入进的文件地址
 */
const createEnvFile = (config, filePath) => {
  if (!filePath) filePath = defualtPath;
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  for (let key of Object.keys(config)) {
    fs.appendFileSync(filePath, `etcd.${key}=${JSON.stringify(config[key])}\n`);
  }
}


/**
 * 注入到环境变量
 */
const setEnv = () => {
  try {
    dotenv.config({ path: defualtPath });
  } catch (err) {
    assert(false, err);
  }
}

/**
 * 获取etcd环境变量数据
 * @param {*} filePath .env文件地址
 * @param {*} isDelEtcdPrefix 是否删除key的etcd前缀
 * @returns 
 */
const getEnv = (filePath, isDelEtcdPrefix) => {
  if (!filePath) filePath = defualtPath;
  try {
    const env = dotenv.parse(fs.readFileSync(filePath, { encoding: 'utf8' }));
    return Object.keys(env).reduce((envObj, key) => {
      let val = env[key];
      try { val = JSON.parse(val); } catch { }
      if (isDelEtcdPrefix) key = key.substring(5)
      envObj[key] = val;
      return envObj;
    }, {})
  } catch (err) {
    assert(false, err);
  }
}

module.exports = {
  fetchRemoteEtcdConfig,
  createEnvFile,
  setEnv,
  getEnv
};