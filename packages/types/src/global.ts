import type { Breadcrumb, TransportData, Options } from '@coveyz/monitor-core';
import type { Logger } from '@coveyz/monitor-utils';
import type { EventTypes, HttpTypes } from '@coveyz/monitor-shared';

import type { DeviceInfo } from './track';

export interface MonitorSupport {
    logger: Logger,
    breadcrumb: Breadcrumb,
    transportData: TransportData,
    replaceFlag: { [key in EventTypes]?: boolean },
    record?: any[],
    deviceInfo?: DeviceInfo,
    options: Options;
    track?: any;
};

export interface MonitorGlobal {
    console?: Console
    __Monitor__?: MonitorSupport
};

export interface MonitorHttp {
    type: HttpTypes;
    traceId?: string;
    method?: string;
    url?: string;
    status?: number;
    reqData?: any;
    sTime?: number;
    elapsedTime?: number;
    responseText?: any;
    time?: number;
    isSdkUrl?: boolean;
    errMsg?: string;
}
export interface MonitorXMLHttpRequest extends XMLHttpRequest {
    [key: string]: any;
    monitor_xhr?: MonitorHttp
}
