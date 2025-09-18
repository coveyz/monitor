import { GlobalVar } from '@coveyz/monitor-shared';
import type { ReportDataType, TrackReportData } from '@coveyz/monitor-types';

import { logger } from './logger';


/** 🍇 获取 当前的时间戳 */
export const getTimestamp = (): number => Date.now();

/** 🍇 临时静音内部 logger 防止递归或者噪音 */
export const silentConsoleScope = (callback: Function) => {
    GlobalVar.isLogAddBreadcrumb = false;
    callback();
    GlobalVar.isLogAddBreadcrumb = true;
};

/** 🍇 判断变量类型 */
export const typeofAny = (target: any, type: string): boolean => {
    return typeof target === type;
}

/** 🍇 校验选项 */
export const validateOption = (target: any, targetName: string, expectType: string) => {
    if (typeofAny(target, expectType)) return true;
    typeof target !== 'undefined' && logger.error(`${targetName}期望类型为${expectType}，但收到${typeof target}类型。`);
    return false;
};

/** 🍇 */
export const isReportDataType = (data: ReportDataType | TrackReportData): data is ReportDataType => {
    // return (<TrackReportData>data).actionType === undefined && !data.isTrackData;
    return 'actionType' in data && data.isTrackData;
}