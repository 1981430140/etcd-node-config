

export interface ClientOptions {
    hosts: string | string[];
    etcdOptions?: any;
    paths: string[] | PathOptions[]
}

interface PathOptions {
    path: string,
    type?: 'json' | 'yaml' | 'ini' | 'text',
    options?: any
}

/**
 * 获取远程Etcd配置
 * @param {ClientOptions} clientOptions etcd配置参数信息
 * @returns etcd 配置数据
 */
export function fetchRemoteEtcdConfig(clientOptions: ClientOptions): Promise<any>;

/**
 * 生成 etcd.env
 * @param {*} config etcd 配置数据
 * @param {*} filePath 需要将配置数据写入进的文件地址
 */
export function createEnvFile(config: { [key]: any }, filePath?: string): void;

/**
 * 注入到环境变量
 */
export function setEnv(): void;

/**
 * 获取etcd环境变量数据
 * @param {*} filePath .env文件地址
 * @param {*} isDelEtcdPrefix 是否删除key的etcd前缀
 * @returns 
 */
export function getEnv(filePath?: string, isDelEtcdPrefix?: Boolean): any;
