import { setSilentFlag, logger, _support, validateOption } from '@coveyz/monitor-utils';
import type { InitOptions } from "@coveyz/monitor-types";

import { breadcrumb } from './breadcrumb';



/** 🍇 初始化 initOptions 配置模块 */
export const initOptions = (paramOptions: InitOptions = {}) => {
    setSilentFlag(paramOptions);
    breadcrumb.bindOptions(paramOptions);
    logger.bindOptions(paramOptions.debug);
    //TODO: 传输层 transportData 上传数据逻辑
};


export class Options {
    /** 🍇 默认是关闭traceId，开启时，页面的所有请求都会生成一个uuid，放入请求头中 */
    enableTraceId: boolean;
    /** 🍇 traceId放入请求头中的key 默认是Trace-Id  */
    traceIdFieldName = 'Trace-Id';
    /** 🍇 按钮点击和微信触摸事件节流时间，默认是0 */
    throttleDelayTime = 0;
    /** 🍇 最多可重复上报同一个错误的次数 */
    maxDuplicateCount = 2;
    /** 🍇 默认为空，所有ajax都会被监听，不为空的时候 filterXhrUrlRegExp.test(xhr.url)为true时过滤 */
    filterXhrUrlRegExp: RegExp;
    /** 🍇 如果开启了 enableTraceId,也需要配置该配置项 includeHttpUrlTraceIdRegExp.test(xhr.url)为true时，才会在该请求头中添加traceId */
    includeHttpUrlTraceIdRegExp: RegExp;
    /** 🍇 钩子函数 拦截用户页面的 ajax 请求， 并在ajax请求发送前执行该hook， 可以对用户发送的ajax请求做xhr.setRequestHeader   */
    beforeAppAjaxSend: Function = () => { };

    constructor() {
        this.enableTraceId = false;
    };

    bindOptions(options: InitOptions = {}) {
        const {
            enableTraceId, traceIdFieldName, throttleDelayTime, maxDuplicateCount,
            filterXhrUrlRegExp, includeHttpUrlTraceIdRegExp,
            beforeAppAjaxSend
        } = options;

        validateOption(enableTraceId, 'enableTraceId', 'boolean') && (this.enableTraceId = enableTraceId);
        validateOption(traceIdFieldName, 'traceIdFieldName', 'string') && (this.traceIdFieldName = traceIdFieldName);
        validateOption(throttleDelayTime, 'throttleDelayTime', 'number') && (this.throttleDelayTime = throttleDelayTime);
        validateOption(maxDuplicateCount, 'maxDuplicateCount', 'number') && (this.maxDuplicateCount = maxDuplicateCount);
        validateOption(filterXhrUrlRegExp, 'filterXhrUrlRegExp', '[object RegExp]') && (this.filterXhrUrlRegExp = filterXhrUrlRegExp);
        validateOption(includeHttpUrlTraceIdRegExp, 'includeHttpUrlTraceIdRegExp', '[object RegExp]') && (this.includeHttpUrlTraceIdRegExp = includeHttpUrlTraceIdRegExp);
        validateOption(beforeAppAjaxSend, 'beforeAppAjaxSend', 'function') && (this.beforeAppAjaxSend = beforeAppAjaxSend);
    }
};

export const options = _support.options || (_support.options = new Options())