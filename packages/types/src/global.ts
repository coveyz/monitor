import type { Breadcrumb } from '@coveyz/monitor-core';

export interface MonitorSupport {
    logger: any,
    breadcrumb: Breadcrumb,
    transportData: any,
    replaceFlag: any,
    record?: any[],
    deviceInfo?: any,
    track?: any;
};

export interface MonitorGlobal {
    console?: Console
    __Monitor__?: MonitorSupport
};