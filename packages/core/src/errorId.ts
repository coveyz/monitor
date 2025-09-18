import { ErrorTypes, EventTypes } from '@coveyz/monitor-shared';
import { variableTypeDetection } from '@coveyz/monitor-utils';
import type { InitOptions, ReportDataType } from '@coveyz/monitor-types';

import { options } from './options';

const allErrorNumber: unknown = {};

/** 
 * 🍇 对象所有键值排序排序 
 ** { b: 2, a: { d: 4, c: 3 } } -> {"a":{"c":3,"d":4},"b":2}
*/
const objectOrder = (reason: any) => {
    const sortFn = (obj: any) => {
        return Object.keys(obj)
            .sort()
            .reduce((acc,cur) => {
                if (variableTypeDetection.isObject(obj[cur])) {
                    acc[cur] = sortFn(obj[cur]);
                } else {
                    acc[cur] = obj[cur];
                }
                return acc;
            }, {})
    };

    try {
        //🍇 检查 reason 是否是 json结构的数据
        if (/\{.*\}/.test(reason)) {
            let obj = JSON.parse(reason);
            obj = sortFn(obj);
            return JSON.stringify(obj);
        }
    } catch (error) {
        return reason;
    }
}

/** 🍇 字符串 转换成 数字形 hash */
export const hasCode = (str: string): number => {
    let hash = 0;
    if (str.length === 0) return hash;

    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    };

    return hash;
}

/**
 * 🍇 获取请求的真实路径
 ** /api/user/123?token=xxx#section' -> /api/user/{param}
 ** /api/order/456/ -> /api/order/{param}/
 ** /api/project?id=1#a -> /api/project
 */
export const getRealPath = (url: string): string => {
    return url.replace(/[\?#].*$/, '').replace(/\/\d+([\/]*$)/, '{param}$1');
};

/** 🍇 对Promise错误做特殊处理，保证内容一致 */
export const generatePromiseErrorId = (data: ReportDataType, apiKey: InitOptions['apiKey']) => {
    const locationURL = getRealPath(data.url);

    if (data.name === EventTypes.UNHANDLEDREJECTION) {
        return data.type + objectOrder(data.message) + apiKey;
    };

    return data.type + data.name + objectOrder(data.message) + locationURL;
};

/** 🍇 生成唯一错误的标识Id， 用于区分和统计不同类型的错误 */
export const createErrorId = (data: ReportDataType, apiKey: InitOptions['apiKey']) => {
    let id: any;

    switch (data.type) {
        case ErrorTypes.FETCH_ERROR:
            id = data.type + data.request.method + data.response.status + getRealPath(data.request.url) + apiKey;
            break;
        case ErrorTypes.JAVASCRIPT_ERROR:
        case ErrorTypes.VUE_ERROR:
        case ErrorTypes.REACT_ERROR:
            id = data.type + data.name + data.message + apiKey;
            break;
        case ErrorTypes.LOG_ERROR:
            id = data.customTag + data.type + data.name + apiKey;
            break;
        case ErrorTypes.PROMISE_ERROR:
            id = generatePromiseErrorId(data, apiKey);
            break;
        default:
            id = data.type + data.message + apiKey;
            break;
    };

    // 🍇 返回一个数字形的 hash 作为 errorId
    id = hasCode(id);

    // 🍇 控制重复上报，超过返回null
    if (allErrorNumber[id] >= options.maxDuplicateCount) {
        return null;
    };

    allErrorNumber[id] = typeof allErrorNumber[id] === 'number' 
        ? allErrorNumber[id] + 1 
        : 1;
    
    return id;
}