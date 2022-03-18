const yaml = require('js-yaml');

/**
 * 合并配置数据
 * @param {*} configResult 
 * @param {*} node 
 * @param {*} type 
 * @returns 
 */
exports.assignConfig = (configResult, node, type) => {
  if (!configResult || !node || !node.value) return;
  let valueObj;
  if (type) {
    valueObj = this.typeParse(node, type); // 根据 type 解析数据
    if (!valueObj) console.warn(`warning： ${node.key} 配置下的信息不是【${type}】类型, 将自动对应格式来处理数据！`)
  }
  if (valueObj && Object.prototype.toString.call(valueObj) === '[object Object]') {
    Object.assign(configResult, valueObj);
  } else {
    Object.assign(configResult, this.autoParse(node));
  }
}

/**
 * 自动解析
 * @param {*} node 
 * @returns 
 */
exports.autoParse = node => {
  let valueObj = this.jsonParse(node.value);  // 处理 json 格式的数据
  if (!valueObj) valueObj = this.yamlParse(node.value); // 处理 yaml 格式的数据
  if (Object.prototype.toString.call(valueObj) === '[object Object]') {
    return valueObj;
  } else {
    valueObj = this.iniParse(node.value);   // 处理 ini 格式的数据
    if (valueObj) {
      return valueObj;
    } else {
      return this.textParse(node); // json 、 yaml 、ini 类型都不是的情况下当成 text 类型处理
    }
  }
}

/**
 * 类型解析
 * @param {*} node 
 * @param {*} type 
 * @returns 
 */
exports.typeParse = (node, type) => {
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
      valueObj = this.textParse(node);
      break;
  }
  return valueObj;
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
 * @returns 
 */
exports.iniParse = data => {
  if (!data) return;
  const result = {};
  let lines = data.split(/[\r\n]+/g);
  for (const item of lines) {
    const match = item.match(/^([^=]+)(=(.*))?$/i);
    if (!match || !~match[0].indexOf('=')) return;
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
 * @returns 
 */
exports.textParse = node => {
  if (!node || !node.key || !node.value) return;
  let key = node.key.replace(/\//g, '.');
  if (key.indexOf('.') === 0) key = key.substring(1);
  return { [key]: node.value };
}
