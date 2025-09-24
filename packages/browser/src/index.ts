import { _global } from '@coveyz/monitor-utils';
import { initOptions } from '@coveyz/monitor-core';
import type { InitOptions } from '@coveyz/monitor-types';

import { setupReplace } from './load';

const webInit = (options: InitOptions = {}): void => {
    if (!('XMLHttpRequest' in _global) || options.disabled) return;
    // 🍇 初始化配置
    initOptions(options);
    // 🍇 替换事件 //TODO:
    setupReplace();
};

const init = (options: InitOptions): void => {
    console.log('monitor-Init');
    webInit(options);
};

export { init };
