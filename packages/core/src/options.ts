import { setSilentFlag } from '@coveyz/monitor-utils';

import type { InitOptions } from "@coveyz/monitor-types";

/** 🍇 初始化 initOptions */
export const initOptions = (paramOptions: InitOptions = {}) => {
    setSilentFlag(paramOptions);
};