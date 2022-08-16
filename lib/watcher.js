const EventEmitter = require('events');
const Etcd = require('node-etcd');
const { autoParse } = require('./utils');

class EtcdWatcher extends EventEmitter {
    constructor(clientOptions) {
        super()
        const etcd = new Etcd(clientOptions.hosts, clientOptions.options);
        const watchPaths = clientOptions.paths.filter(item => typeof item === 'object' && item.watcher)
        for (const item of watchPaths) {
            const watcher = etcd.watcher(item.path);
            watcher.on("set", data => {
                // 数据处理
                const updateData = item.name ? { [item.name]: autoParse(data.node) } : autoParse(data.node)
                // 写入到 env 环境变量中
                Object.keys(updateData).forEach(key => process.env[`etcd.${key}`] = typeof updateData[key] === 'object' ? JSON.stringify(updateData[key]) : updateData[key])
                // emit
                this.emit('change', { node: data.node, prevNode: data.node, changeValue: updateData });
            });
        }
    }
}

module.exports = EtcdWatcher;