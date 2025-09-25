import { GlobalVar } from '@coveyz/monitor-shared';
import type { ReportDataType, TrackReportData, AnyObj, TotalEventName, voidFun } from '@coveyz/monitor-types';

import { logger } from './logger';


/** 🍇 获取 当前的时间戳 */
export const getTimestamp = (): number => Date.now();

/** 🍇 临时静音内部 logger 防止递归或者噪音 */
export const silentConsoleScope = (callback: Function) => {
    GlobalVar.isLogAddBreadcrumb = false;
    callback();
    GlobalVar.isLogAddBreadcrumb = true;
};

/** 🍇 判断变量类型 */
export const typeofAny = (target: any, type: string): boolean => {
    return typeof target === type;
}

/** 🍇 校验选项 */
export const validateOption = (target: any, targetName: string, expectType: string) => {
    if (typeofAny(target, expectType)) return true;
    typeof target !== 'undefined' && logger.error(`${targetName}期望类型为${expectType}，但收到${typeof target}类型。`);
    return false;
};

/** 🍇 */
export const isReportDataType = (data: ReportDataType | TrackReportData): data is ReportDataType => {
    // return (<TrackReportData>data).actionType === undefined && !data.isTrackData;
    return 'actionType' in data && data.isTrackData;
}

/** 
 * 🍇  通用 劫持/重写 工具方法
 * 保留原始方法 / 增强原始方法 / 透明替换
 * @param source 需要被重写的对象
 * @param name 需要被重写的对象的方法名
 * @param replacement 重写的函数，接收原始方法作为参数
 * @param isForced 是否强制重写（即使对象上不存在该方法）
 */
export const replaceOld = (
    source: AnyObj,
    name: string,
    replacement: (...args: any[]) => any,
    isForced = false
) => {
    if (!source) return;

    if (name in source || isForced) {
        const original = source[name]; // 🍇 保留 原始方法
        const wrapped = replacement(original); // 🍇 传入原始方法，返回一个新方法
        if (typeof wrapped === 'function') {
            source[name] = wrapped; // 🍇 替换
        };
    };
};

/**
 * 🍇 事件监听
 * @param target 
 * @param eventName 
 * @param handler 
 * @param options 
 */
export function on(
    target: { addEventListener: Function },
    eventName: TotalEventName,
    handler: Function,
    options: boolean | unknown = false
) {
    target.addEventListener(eventName, handler, options);
};

/**
 * 🍇 生成符合 UUID v4 格式的唯一标识符
 ** 返回格式： xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
export const generateUUID = () => {
    let d = new Date().getTime(); // 时间戳中字

    /**
     * 🍇 替换模版
     ** x：需要替换为随机的16进制字符（0-9, a-f）
     ** y：需要替换为特定范围的16进制字符（8, 9, a, b）
     ** 4：固定字符，表示UUID版本4
     */
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (d + Math.random() * 16) % 16 | 0; // 随机数 0-16 // ｜ 相当于 Math.floor
        d = Math.floor(d / 16); // 消耗时间戳 避免重复
        // 🍇 如果当前是 x 直接返回 r的十六进制， 
        // 🍇 如果是 y， 
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    })

    return uuid;
}

/** 
 * 🍇 错误捕获 
 ** 确保单个事件处理器 出错时 不会影响其他代码执行
 ** 记录哪个处理器出现了错误
 */
export function nativeTryCatch(fn: voidFun, errorFn?: (err: any) => void): void {
    try {
        fn();
    } catch (error) {
        console.log('error', error);
        errorFn && errorFn(error);
    }
};

export const defaultFunction = '<anonymous>';

/**
 * 🍇 获取函数名称, 匿名函数返回 <anonymous>
 */
export function getFunctionName(fn: unknown): string {
    if (!fn || typeof fn !== 'function') {
        return defaultFunction;
    }
    return fn.name || defaultFunction;
};
