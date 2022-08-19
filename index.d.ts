import { IOptions } from "etcd3";
import EtcdWatcher, { EventEmitter } from "./lib/watcher";

export interface ClientOptions {
    hosts: string | string[]; // etcd 连接地址
    etcdOptions?: IOptions;
    paths: string[] | PathOptions[] // 配置数据的paths
}

interface PathOptions {
    path: string, // etcd 配置信息 path
    type?: 'json' | 'yaml' | 'ini' | 'text', // 配置数据的类型
    name?: string, // 名称， 返回结果会将配置数据放在 name 中
    watcher?: boolean
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

declare class EtcdWatcher extends EventEmitter {}

export function watcher(): EtcdWatcher | null;
