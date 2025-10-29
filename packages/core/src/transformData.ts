import { GlobalVar, SpanStatus, ErrorTypes, Severity } from "@coveyz/monitor-shared";
import { MonitorHttp, ReportDataType, ResourceErrorTarget } from "@coveyz/monitor-types";
import { fromHttpStatus, getLocationHref, getTimestamp, interceptStr } from "@coveyz/monitor-utils";

import { getRealPath } from "./errorId";

const resourceMap = {
    img: '图片',
    script: 'js脚本',
}


/** 🍇 http请求信息转换 统一格式 */
export const httpTransform = (data: MonitorHttp): ReportDataType => {
    let message = '';

    const { elapsedTime, time, method, traceId, type, status } = data;
    const name =`${type}--${method}`;

    // 🍇 生成信息
    if (status === 0) {
        message = elapsedTime <= GlobalVar.crossOriginThreshold 
            ? 'http请求失败，失败原因：跨域限制或域名不存在' 
            : 'http请求超时，超时';
    } else {
        message = fromHttpStatus(status);
    };
    // 🍇 加强
    message = message === SpanStatus.Ok 
        ? message
        : `${message} ${getRealPath(data.url)}`

    /** 🍇 生成最终信息 */
    return {
        type: ErrorTypes.FETCH_ERROR,
        url: getLocationHref(),
        time,
        elapsedTime,
        level: Severity.Low,
        message,
        name,
        request: {
            httpType: type,
            traceId,
            method,
            url: data.url,
            data: data.reqData || ''
        },
        response: {
            status,
            data: data.responseText
        }
    }
};

/** 🍇 转换资源为标准模式 */
export const resourceTransform = (target: ResourceErrorTarget): ReportDataType => {
    return {
        type: ErrorTypes.RESOURCE_ERROR,
        url: getLocationHref(),
        message: `资源地址：${interceptStr(target.src, 120) || interceptStr(target.href, 120)}`,
        level: Severity.Low,
        time: getTimestamp(),
        name: `${resourceMap[target.localName] || target.localName}加载失败`,
    }
};