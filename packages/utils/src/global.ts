import type { EventTypes } from '@coveyz/monitor-shared';
import type { MonitorSupport, MonitorGlobal } from '@coveyz/monitor-types';

import { variableTypeDetection } from './is';


/** 🍇 检查浏览器环境 */
export const isBrowserEnv = variableTypeDetection.isWindow(
    typeof window !== 'undefined' ? window : 0
);

/** 🍇 检查 Node 环境 */
export const isNodeEnv = variableTypeDetection.isProcess(
    typeof process !== 'undefined' ? process : 0
);

/** 🍇 获取 全局变量 */
export const getGlobal = <T>() => {
    console.log({ isBrowserEnv, isNodeEnv, }, typeof window)
    if (isBrowserEnv) return window as unknown as MonitorGlobal & T;
    if (isNodeEnv) return process as unknown as MonitorGlobal & T;
};

/** 🍇 获取 Monitor 支持 */
export const getGlobalMonitorSupport = (): MonitorSupport => {
    _global.__Monitor__ = _global.__Monitor__ || ({} as MonitorSupport);
    return _global.__Monitor__;
};


export const _global = getGlobal<Window>();
export const _support = getGlobalMonitorSupport();


_support.replaceFlag = _support.replaceFlag || {};
const replaceFlag = _support.replaceFlag;

export const setFlag = (replaceType: EventTypes, isSet: boolean): void => {
    if (replaceFlag[replaceType]) return;
    replaceFlag[replaceType] = isSet;
};