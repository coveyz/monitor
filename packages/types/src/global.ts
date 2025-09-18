import type { Breadcrumb, TransportData } from '@coveyz/monitor-core';
import type { Logger } from '@coveyz/monitor-utils';
import type { EventTypes } from '@coveyz/monitor-shared';

import type { DeviceInfo } from './track';

export interface MonitorSupport {
    logger: Logger,
    breadcrumb: Breadcrumb,
    transportData: TransportData,
    replaceFlag: { [key in EventTypes]?: boolean },
    record?: any[],
    deviceInfo?: DeviceInfo,
    //TODO: type
    options: any;
    track?: any;
};

export interface MonitorGlobal {
    console?: Console
    __Monitor__?: MonitorSupport
};