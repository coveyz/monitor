import { BreadCrumbTypes, EventTypes } from '@coveyz/monitor-shared';

import { addReplaceHandler } from './replace';
import { HandleEvents } from './handleEvents';
import { handleConsole } from '@coveyz/monitor-core';

/**
 * 🍇 为各种事件设置替换处理程序
 ** 注册各种“可观测事件”的处理器，让监控系统能够捕获并处理页面上的各种异常、行为和性能数据。
 */
export const setupReplace = (): void => {
    addReplaceHandler({
        type: EventTypes.XHR,
        callback: (data) => {
            HandleEvents.handleHttp(data, BreadCrumbTypes.XHR);
        }
    });
    addReplaceHandler({
        type: EventTypes.FETCH,
        callback: (data) => {
            HandleEvents.handleHttp(data, BreadCrumbTypes.FETCH);
        }
    });
    addReplaceHandler({
        type: EventTypes.ERROR,
        callback: (error) => {
            HandleEvents.handleError(error);
        }
    });
    addReplaceHandler({
        type: EventTypes.CONSOLE,
        callback: (data) => {
            handleConsole(data);
        }
    })
};