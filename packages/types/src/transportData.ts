import type { EActionType } from '@coveyz/monitor-shared';

import type { BreadcrumbPushData } from './breadcrumb';
import type { DeviceInfo } from './track';

interface ICommonDataType {
    isTrackData?: boolean;
};

export interface ReportDataType extends ICommonDataType {
    type?: string;
    message?: string;
    url: string;
    name?: string;
    stack?: any;
    time?: number;
    errorId?: number;
    level: string;
    elapsedTime?: number;
    request?: {
        httpType?: string;
        traceId?: string;
        method: string;
        url: string;
        data: any;
    };
    response?: {
        status: number;
        data: string;
    };
    /** vue */
    componentName?: string;
    propsData?: any;
    customTag?: string;
}

export interface TrackReportData extends ICommonDataType {
    /** 🍇 uuid */
    id?: string;
    /** 🍇 埋点code 一般由人为传入， 可以自定义规范 */
    trackId?: string;
    /** 🍇 埋点类型 */
    actionType: EActionType;
    /** 🍇 埋点开始时间 */
    startTime?: number;
    /** 🍇 埋点停留时间 */
    durationTime?: number;
    /** 🍇 上报时间 */
    trackTime?: number;
};


export interface AuthInfo {
    apiKey?: string;
    trackKey?: string;
    sdkVersion: string;
    sdkName: string;
    trackerId: string;
};

export type FinalReportData = ReportDataType | TrackReportData;

export interface TransportDataType {
    authInfo: AuthInfo;
    breadcrumb?: BreadcrumbPushData[];
    data?: FinalReportData;
    record?: any[];
    deviceInfo?: DeviceInfo;
}