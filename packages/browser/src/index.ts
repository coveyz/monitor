import { _global } from '@coveyz/monitor-utils';
import { initOptions } from '@coveyz/monitor-core';
import type { InitOptions } from '@coveyz/monitor-types';

const webInit = (options: InitOptions = {}): void => {
    if (!('XMLHttpRequest' in _global) || options.disabled) return;
    //TODO: 初始化配置
    initOptions(options)
};

const init = (options: InitOptions): void => {
    console.log('monitor-Init');
    webInit(options);
};

export { init };
