export const nativeToString = Object.prototype.toString;

/** 🍇 判断是否为特定类型 */
const isType = (type: string) => {
    return (value: any): boolean => {
        return nativeToString.call(value) === `[object ${type}]`;
    }
};

/** 🍇 检查变量类型 */
export const variableTypeDetection = {
    isNumber: isType('Number'),
    isString: isType('String'),
    isBoolean: isType('Boolean'),
    isNull: isType('Null'),
    isUndefined: isType('Undefined'),
    isSymbol: isType('Symbol'),
    isFunction: isType('Function'),
    isObject: isType('Object'),
    isArray: isType('Array'),
    isProcess: isType('process'),
    isWindow: isType('Window'),
    isPromise: isType('Promise'),
};

/** 🍇 检查 数据是否为空 */
export const isEmpty = (data: any) => {
    if (data === null || data === undefined) return true;
    if (typeof data === 'string') return data.trim() === '';
    if (data instanceof Map || data instanceof Set) {
        return data.size === 0;
    }
    if (typeof data === 'object' || Array.isArray(data)) {
        for (const _key in data) {
            return false;
        }
        return true;
    }
    return false;
};