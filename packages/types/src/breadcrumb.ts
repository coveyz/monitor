import type { BreadCrumbTypes, Severity } from '@coveyz/monitor-shared';

import type { ReportDataType } from './transportData';
import type { TNumStrObj } from './common';
import { Replace } from './replace';

export interface BreadcrumbPushData {
    type: BreadCrumbTypes;
    data: ReportDataType | Replace.IRoute | Replace.TriggerConsole | TNumStrObj;
    category?: string;
    time?: number;
    level: Severity;
};