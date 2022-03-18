## 安装插件

```bash
$ npm i etcd-node-config --save
```

## 获取ETCD配置数据使用方式

用法也可以参考 [node-apollo](https://www.npmjs.com/package/node-apollo) 

### 1.根目录下创建脚本
{app_root}/etcd.js

```js
const { fetchRemoteEtcdConfig } = require('etcd-node-config');
fetchRemoteEtcdConfig({
  hosts: process.env['ETCD_HOST'] || "127.0.0.1:2379",
  paths: ['redis', { path: '/db/test_db', type: 'json' }] // // 需要读取 etcd 上的配置目录地址 
}).then(env => {
  console.log("获取 ETCD 数据：", env)
})
```
### 2.启动项目时运行脚本
{app_root}/package.json

```js
...
"scripts": {
  "start": "node etcd.js && node index.js",
  "nest": "node etcd.js && nest start",
  "egg": "node etcd.js && egg-scripts start",
  "other": "node etcd.js && ..."
}
...
```

### 3.在项目入口文件中将配置设置到环境变量中

```js
// {app_root}/入口文件
require('etcd-node-config').setEnv();
// or
import { setEnv } from 'etcd-node-config';
setEnv()
```
### 4.在项目中从环境变量读取配置
注意： 从环境变量中读取配置时属性名需要加上前缀 etcd , 如： process.env["etcd.redis"] or process.env["etcd.xxx"]
```js
...
config.redis = {
  client: {
    host: process.env["etcd.redis.host"], // 从环境变量中读取配置
    port: process.env["etcd.redis.port"],
    password: process.env["etcd.redis.password"],
    db: process.env["etcd.redis.db"],
  },
};
// or
config.db = JSON.parse(process.env["etcd.db"]);
// or
Object.assign(config, getEnv(null, true));
...
```
## ETCD配置数据格式支持
- json
```
{
    "a":1,
    "b":2
}

// code
console.log(process.env["etcd.a"]) // 输出： 1
console.log(process.env["etcd.b"]) // 输出： 2
```
- yaml 
```
db:
  - name: db001
    host: localhost
    port: 5432
  - name: db002
    host: localhost
    port: 5433

// code
console.log(process.env["etcd.db[0].name"]) // 输出： db001
console.log(process.env["etcd.db[1].name"]) // 输出： db002
```
- ini
```
a=1
b = 2
c.d= 3

// code
console.log(process.env["etcd.a"]) // 1
console.log(process.env["etcd.b"]) // 2
console.log(process.env["etcd.c.d"]) // 3
```
- text
```
// path: /config/test

test01
test02

// code
console.log(process.env["etcd.config.test"]) // 输出： test01\ntest02  （从环境变量中读取text数据格式时以 etcd 配置的path名称读取）

```

### APIs

- `fetchRemoteEtcdConfig(clientOptions)` 获取远程 ETCD 配置信息
  - clientOptions {ClientOptions}
- `createEnvFile(config, filePath)` 将配置信息写入到文件
  - config {Object}
  - filePath {String}
- `setEnv()` 注入到环境变量
- `getEnv(filePath, isDelEtcdPrefix)` 获取ETCD配置数据
  - filePath {String}
  - isDelEtcdPrefix {Boolean}
## License

[BSD-2-Clause](LICENSE)