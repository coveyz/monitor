import { breadcrumb, httpTransform, transportData } from '@coveyz/monitor-core';
import { HttpCodes, Severity } from '@coveyz/monitor-shared';
import { BreadCrumbTypes } from "@coveyz/monitor-shared";
import type { MonitorHttp } from "@coveyz/monitor-types";



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
            data: {...result},
            level: Severity.Info,
            time: data.time
        });

        // 🍇 错误处理 上报
        if (isError) {
            breadcrumb.push({
                type,
                category: breadcrumb.getCategory(BreadCrumbTypes.CODE_ERROR),
                data: {...result},
                level: Severity.Error,
                time: data.time
            });
            transportData.send(result);
        };
    }
};