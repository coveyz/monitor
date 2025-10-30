import { subscribeEvent, options, setTraceId, transportData, triggerHandlers } from '@coveyz/monitor-core';
import { _global, getTimestamp, on, replaceOld, variableTypeDetection } from '@coveyz/monitor-utils';
import { EMethods, EventTypes, HttpTypes, HttpCodes } from '@coveyz/monitor-shared';
import type { MonitorHttp, MonitorXMLHttpRequest, ReplaceHandler, voidFun } from '@coveyz/monitor-types';

/** 🍇 过滤请求URL */
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
                this.monitor_xhr.time = eTime;
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

/** 🍇 重写 fetch 的相关方法 */
function fetchReplace(): void {
    // 🍇 环境监测
    if (!('fetch' in _global)) return;

    replaceOld(_global, 'fetch', (originalFetch) => {
        return function (url: string, config: Partial<Request> = {}): void {
            // 🍇 数据收集
            const sTime = getTimestamp();
            const method = (config && config.method) || 'GET';
            let handlerData: MonitorHttp = {
                type: HttpTypes.FETCH,
                method,
                url,
                reqData: config && config.body,
            }
            // 🍇 请求头处理 & 链路追踪
            let headers = new Headers(config.headers || {});
            Object.assign(headers, {
                setRequestHeader: headers.set
            });
            setTraceId(url, (headerFieldName, traceId) => {
                handlerData.traceId = traceId;
                headers.set(headerFieldName, traceId);
            });
            // 🍇 调用用户配置的钩子函数
            options.beforeAppAjaxSend && options.beforeAppAjaxSend({ method, url }, headers);
            config = { ...config, headers };

            originalFetch.apply(_global, [url, config]).then(
                (res: Response) => {
                    // 🍇 克隆响应体 
                    const tmpRes = res.clone();
                    const eTime = getTimestamp();

                    handlerData = {
                        ...handlerData,
                        elapsedTime: eTime - sTime,
                        status: tmpRes.status,
                        time: sTime,
                    };

                    tmpRes.text().then((data) => {
                        // 🍇 过滤逻辑： 跳过SDK自身请求 和 需要被过滤URL
                        if(method === EMethods.POST && transportData.isSdkTransportUrl(url)) return;
                        if (isFilterHttpUrl(url)) return;

                        // 🍇 只在错误状态码的情况下 记录响应内容 （避免大量数据）
                        handlerData.responseText = tmpRes.status > HttpCodes.UNAUTHORIZED && data;
                        // 🍇 触发请求完成事件
                        triggerHandlers(EventTypes.FETCH, handlerData);
                    });
                    return res;
                },
                (err: Error) => {
                    const eTime = getTimestamp();
                    if (method === EMethods.POST && transportData.isSdkTransportUrl(url)) return;
                    if (isFilterHttpUrl(url)) return;

                    handlerData = {
                        ...handlerData,
                        elapsedTime: eTime - sTime,
                        status: 0,
                        time: sTime,
                    };

                    triggerHandlers(EventTypes.FETCH, handlerData);
                    throw err;
                }
            )
        }
    })
};

/** 🍇 重写 拦截全局 error 事件 */
function listenError(): void {
    on(_global, 'error', function(e: ErrorEvent) {
        triggerHandlers(EventTypes.ERROR, e);
    });
};

/** 🍇 重写 console  */
function consoleReplace(): void {
    if (!('console' in _global)) return;

    const logType = ['log', 'info', 'warn', 'debug', 'error', 'assert'];
    logType.forEach(function(level: string): void {
        if (!(level in _global.console)) return;

        replaceOld(_global.console, level, function (originalConsole: () => any): Function {
            return function (...args: any[]): void {
                if (originalConsole) {
                    // 🍇 触发监听
                    triggerHandlers(EventTypes.CONSOLE, { args, level });
                    // 🍇 调用 console 的方法
                    originalConsole.apply(_global.console, args);
                };
            };
        })
    });
}

/** 🍇 根据事件类型 调用对应的拦截器去访问 */
const replace = (type: EventTypes) => {
    switch (type) {
        case EventTypes.XHR:
            xhrReplace();
            break;
        case EventTypes.FETCH:
            fetchReplace();
            break;
        case EventTypes.ERROR: 
            listenError();
            break;
        case EventTypes.CONSOLE: 
            consoleReplace();
        default:
            break;
    }
};

/** 🍇 添加重写处理器 */
export const addReplaceHandler = (handler: ReplaceHandler): void => {
    if (!subscribeEvent(handler)) return;
    // console.log('addReplaceHandler', handler);
    replace(handler.type);
};