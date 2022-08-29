const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const defualtConfigPath = path.join(__dirname, '/../config.json');

/**
 * 合并配置数据
 * @param {*} configResult 
 * @param {*} node 
 * @param {*} pathConfig 
 * @returns 
 */
exports.assignConfig = (configResult, node, pathConfig = {}) => {
  if (!configResult || !node || !node.value) return;
  const result = pathConfig.name && configResult[pathConfig.name] ? configResult[pathConfig.name] : {};
  let valueObj;
  if (pathConfig.type) {
    valueObj = this.typeParse(node, pathConfig.type, pathConfig.name); // 根据 type 解析数据
    if (!valueObj) console.warn(`warning： ${node.key} 配置下的信息不是【${pathConfig.type}】类型, 将自动对应格式来处理数据！`)
  }
  if (valueObj && Object.prototype.toString.call(valueObj) === '[object Object]') {
    Object.assign(result, valueObj);
  } else {
    Object.assign(result, this.autoParse(node, pathConfig.name));
  }
  Object.assign(configResult, result);
}

/**
 * 自动解析
 * @param {*} node 
 * @param {*} alias 别名
 * @returns 
 */
exports.autoParse = (node, alias) => {
  let valueObj = this.jsonParse(node.value, alias);  // 处理 json 格式的数据
  if (!valueObj) valueObj = this.yamlParse(node.value, alias); // 处理 yaml 格式的数据
  if (Object.prototype.toString.call(valueObj) === '[object Object]') {
    return alias ? { [alias]: valueObj } : valueObj;
  } else {
    valueObj = this.iniParse(node.value, true, alias);   // 处理 ini 格式的数据
    if (valueObj) {
      return alias ? { [alias]: valueObj } : valueObj;
    } else {
      return this.textParse(node, alias); // json 、 yaml 、ini 类型都不是的情况下当成 text 类型处理
    }
  }
}

/**
 * 类型解析
 * @param {*} node 
 * @param {*} type 
 * @param {*} alias 别名
 * @returns 
 */
exports.typeParse = (node, type, alias) => {
  if (!node || !node.value || !type) return;
  let valueObj
  switch (type) {
    case 'json':
      valueObj = this.jsonParse(node.value);
      break;
    case 'yaml':
      valueObj = this.yamlParse(node.value);
      break;
    case 'ini':
      valueObj = this.iniParse(node.value);
      break;
    case 'text':
      return this.textParse(node, alias);
  }
  return alias && valueObj !== undefined && valueObj !== null ? { [alias]: valueObj } : valueObj;
}

/**
 * 处理 json 格式的数据
 * @param {*} data 
 * @returns 
 */
exports.jsonParse = data => {
  if (!data) return;
  try {
    return JSON.parse(data);
  } catch { }
  return;
}

/**
 * 处理 yaml 格式的数据
 * @param {*} data 
 * @returns 
 */
exports.yamlParse = data => {
  if (!data) return;
  try {
    return yaml.load(data);
  } catch { }
  return;
}

/**
 * a=1
 * b=2
 * c=3
 * ....
 * 
 * 处理 ini 格式的数据
 * @param {*} data 
 * @param {*} verify 
 * @returns 
 */
exports.iniParse = (data, verify = true) => {
  if (!data) return;
  const result = {};
  let lines = data.split(/[\r\n]+/g);
  for (const item of lines) {
    const match = item.match(/^([^=]+)(=(.*))?$/i);
    if (!match || !~match[0].indexOf('=')) {
      if (verify) return;
      continue;
    }
    const line = match[0];
    const index = line.indexOf('=');
    const key = line.substring(0, index).trim();
    const val = line.substring(index + 1, line.length).trim();
    result[key] = val;
  }
  return result;
}

/**
 * 处理 text 格式的数据
 * @param {*} node 
 * @param {*} alias 别名
 * @returns 
 */
exports.textParse = (node, alias) => {
  if (!node || !node.key || !node.value) return;
  let key = alias || node.key.replace(/\//g, '.');
  if (key.indexOf('.') === 0) key = key.substring(1);
  return { [key]: node.value };
}

/**
 * 生成 config.json, 只有需要 watcher 的时候才会生成config.json 文件
 * @param {*} clientOptions etcd 配置数据
 */
exports.createConfigFile = (clientOptions) => {
  if (fs.existsSync(defualtConfigPath)) {
    fs.unlinkSync(defualtConfigPath);
  }
  for (const item of clientOptions.paths) {
    if (typeof item === 'object' && item.watcher) {
      fs.writeFileSync(defualtConfigPath, JSON.stringify(clientOptions));
      return;
    }
  }
}

/**
 * 获取config.json 配置文件数据
 * @returns 
 */
exports.requireConfigJson = () => {
  if (fs.existsSync(defualtConfigPath)) {
    return require(defualtConfigPath);
  } else {
    return null;
  }
}
