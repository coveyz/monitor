import { GlobalVar, SpanStatus, ErrorTypes, Severity } from "@coveyz/monitor-shared";
import { MonitorHttp, ReportDataType } from "@coveyz/monitor-types";
import { fromHttpStatus, getLocationHref } from "@coveyz/monitor-utils";

import { getRealPath } from "./errorId";


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