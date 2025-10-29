import { breadcrumb, httpTransform, resourceTransform, transportData } from '@coveyz/monitor-core';
import { ERROR_TYPE_RE, HttpCodes, Severity, BreadCrumbTypes, ErrorTypes } from '@coveyz/monitor-shared';
import { extractErrorStack, getLocationHref, getTimestamp, isError } from '@coveyz/monitor-utils';
import type { MonitorHttp, ResourceErrorTarget, ReportDataType } from "@coveyz/monitor-types";



/**
 * 🍇 监控SDK 事件处理中心， 负责将各种原始事件转换为标准化的监控事件
 */
export const HandleEvents = {
    /** 🍇 处理 XHR 和 Fetch 网络请求的回调 */
    handleHttp(data: MonitorHttp, type: BreadCrumbTypes): void {
        const isError =
            data.status === 0 || // 网络错误 / 跨域 / 超时
            data.status === HttpCodes.BAD_REQUEST || // 400错误
            data.status > HttpCodes.UNAUTHORIZED; // > 401 的所有错误

        // 🍇 转换数据格式 ---> 统一格式
        const result = httpTransform(data);

        // 🍇 添加到面包屑 （所有请求都会被记录）
        breadcrumb.push({
            type,
            category: breadcrumb.getCategory(type),
            data: { ...result },
            level: Severity.Info,
            time: data.time
        });

        // 🍇 错误处理 上报
        if (isError) {
            breadcrumb.push({
                type,
                category: breadcrumb.getCategory(BreadCrumbTypes.CODE_ERROR),
                data: { ...result },
                level: Severity.Error,
                time: data.time
            });
            transportData.send(result);
        };
    },
    /** 🍇 处理 window.error监听事件回调 */
    handleError(errorEvent: ErrorEvent) {
        const target = errorEvent.target as ResourceErrorTarget;

        // 🍇 判断错误类型
        if (target.localName) {
            // 🍇 资源加载错误 提取有用数据 (图片， css， js 文件等)
            const data = resourceTransform(errorEvent.target as ResourceErrorTarget);

            breadcrumb.push({
                type: BreadCrumbTypes.RESOURCE,
                category: breadcrumb.getCategory(BreadCrumbTypes.RESOURCE),
                data,
                level: Severity.Error,
            });

            return transportData.send(data);
        };

        // 🍇 code error Javascript执行错误
        const { message, filename, lineno, colno, error } = errorEvent;
        let result: ReportDataType;
        if (error && isError(error)) {
            result = extractErrorStack(error, Severity.Normal)
        };
        result || (result = HandleEvents.handleNotErrorInstance(message, filename, lineno, colno));
        // 🍇 标准化 & 上报
        result.type = ErrorTypes.JAVASCRIPT_ERROR;
        breadcrumb.push({
            type: BreadCrumbTypes.CODE_ERROR,
            category: breadcrumb.getCategory(BreadCrumbTypes.CODE_ERROR),
            data: { ...result },
            level: Severity.Error,
        });
        transportData.send(result);
    },
    /** 🍇 处理没有完整 Error对象的情况， 🎬 应用场景：SyntaxError，跨域脚本错误等 */
    handleNotErrorInstance(message: string, filename: string, lineno: number, colno: number) {
        let name: string | ErrorTypes = ErrorTypes.UNKNOWN;
        const url = filename || getLocationHref();
        let msg = message;

        const matches = message.match(ERROR_TYPE_RE);
        // 🍇 如果能匹配到错误类型， 则提取出来
        if (matches[1]) {
            name = matches[1];
            msg = matches[2];
        };

        const element = {
            url,
            func: ErrorTypes.UNKNOWN_FUNCTION,
            args: ErrorTypes.UNKNOWN,
            line: lineno || null,
            column: colno || null
        };

        return {
            url,
            name,
            message: msg,
            level: Severity.Normal,
            time: getTimestamp(),
            stack: [element]
        }
    }
};