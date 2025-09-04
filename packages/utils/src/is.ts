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
