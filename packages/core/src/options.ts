import { setSilentFlag, logger, _support } from '@coveyz/monitor-utils';
import type { InitOptions } from "@coveyz/monitor-types";

import { breadcrumb } from './breadcrumb';

//TODO: options
export const options = _support.options;

/** 🍇 初始化 initOptions 配置模块 */
export const initOptions = (paramOptions: InitOptions = {}) => {
    setSilentFlag(paramOptions);
    breadcrumb.bindOptions(paramOptions);
    logger.bindOptions(paramOptions.debug);
    //TODO: 传输层 transportData 上传数据逻辑
};