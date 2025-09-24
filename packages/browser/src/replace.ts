import { subscribeEvent } from '@coveyz/monitor-core';
import { _global, getTimestamp, replaceOld, variableTypeDetection } from '@coveyz/monitor-utils';
import { EventTypes, HttpTypes } from '@coveyz/monitor-shared';
import type { MonitorHttp, MonitorXMLHttpRequest, ReplaceHandler, voidFun } from '@coveyz/monitor-types';


/** 🍇 重写 XMLHttpRequest的 open 和 send */
function xhrReplace(): void {
    if (!('XMLHttpRequest' in _global)) return;

    const originalXhrProto = XMLHttpRequest.prototype;
    replaceOld(originalXhrProto, 'open', (originalOpen: voidFun) => {
        return function (this: MonitorXMLHttpRequest, ...args: any[]): void {
            this.monitor_xhr = {
                type: HttpTypes.XHR,
                method: variableTypeDetection.isString(args[0]) ? args[0].toUpperCase() : args[0],
                url: args[1],
                sTime: getTimestamp()
            };
            originalOpen.apply(this, args);
        }
    });
};

/** 🍇 根据事件类型 调用对应的拦截器去访问 */
const replace = (type: EventTypes) => {
    switch (type) {
        case EventTypes.XHR:
            xhrReplace();
            break;
        default:
            break;
    }
};

/** 🍇 添加重写处理器 */
export const addReplaceHandler = (handler: ReplaceHandler): void => {
    if (!subscribeEvent(handler)) return;
    console.log('addReplaceHandler', handler);
    replace(handler.type);
};