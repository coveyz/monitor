import { subscribeEvent, options, setTraceId, transportData, triggerHandlers } from '@coveyz/monitor-core';
import { _global, getTimestamp, on, replaceOld, variableTypeDetection } from '@coveyz/monitor-utils';
import { EMethods, EventTypes, HttpTypes } from '@coveyz/monitor-shared';
import type { MonitorHttp, MonitorXMLHttpRequest, ReplaceHandler, voidFun } from '@coveyz/monitor-types';


const isFilterHttpUrl = (url: string) => {
    return options.filterXhrUrlRegExp && options.filterXhrUrlRegExp.test(url);
}


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

    replaceOld(originalXhrProto, 'send', (originalSend: voidFun) => {
        return function (this: MonitorXMLHttpRequest, ...args: any[]): void {
            const { method, url } = this.monitor_xhr;
            // 🍇 生成traceId并添加到请求头中
            setTraceId(url, (headerFieldName, traceId) => {
                this.monitor_xhr.traceId = traceId;
                this.setRequestHeader(headerFieldName, traceId);
            });
            // 🍇 调用用户配置的钩子函数
            options.beforeAppAjaxSend && options.beforeAppAjaxSend({ method, url }, this);

            // 🍇 监听请求完成事件
            on(this, 'loadend', function (this: MonitorXMLHttpRequest) {
                // 🍇 过滤逻辑： 跳过SDK自身请求 和 需要被过滤URL
                if (
                    (method === EMethods.POST && transportData.isSdkTransportUrl(url)) ||
                    isFilterHttpUrl(url)
                ) return;
                // 🍇 收集 响应体数据
                const { responseType, response, status } = this;
                this.monitor_xhr.reqData = args[0];
                const eTime = getTimestamp();
                this.monitor_xhr.time =  eTime;
                this.monitor_xhr.status = status;
                // 🍇 处理 响应体数据
                if (['', 'json', 'text'].indexOf(responseType) !== -1) {
                    this.monitor_xhr.responseText = typeof response === 'object' ? JSON.stringify(response) : response;
                };
                // 🍇 计算 请求耗时
                this.monitor_xhr.elapsedTime = eTime - this.monitor_xhr.sTime;
                triggerHandlers(EventTypes.XHR, this.monitor_xhr);
            })

            originalSend.apply(this, args);
        };
    })
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