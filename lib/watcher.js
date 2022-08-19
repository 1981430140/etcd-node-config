const EventEmitter = require('events');
const { autoParse } = require('./utils');
const { Etcd3 } = require('etcd3');
class EtcdWatcher extends EventEmitter {
    constructor(clientOptions) {
        super()
        const etcd = new Etcd3({
            hosts: clientOptions.hosts,
            ...clientOptions.options
        });
        const watchPaths = clientOptions.paths.filter(item => typeof item === 'object' && item.watcher)
        for (const item of watchPaths) {
            etcd.watch()
                .key(item.path)
                .create()
                .then(watcher => {
                    watcher
                        .on('disconnected', () => console.log('[etcd-node-config] etcd watcher disconnected...'))
                        .on('connected', () => console.log('[etcd-node-config] etcd watcher successfully reconnected!'))
                        .on('put', data => {
                            const node = { key: data.key.toString(), value: data.value.toString() }
                            const updateData = item.name ? { [item.name]: autoParse(node) } : autoParse(node)
                            // 写入到 env 环境变量中
                            Object.keys(updateData).forEach(key => process.env[`etcd.${key}`] = typeof updateData[key] === 'object' ? JSON.stringify(updateData[key]) : updateData[key])
                            // emit
                            this.emit('change', { node: node, changeValue: updateData });
                        });
                })
        }
    }
}

module.exports = EtcdWatcher;