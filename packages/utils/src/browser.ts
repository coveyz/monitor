import { EventTypes } from '@coveyz/monitor-shared';
import type { InitOptions } from '@coveyz/monitor-types';

import { setFlag } from './global';


/** 🍇 设置 静默 */
export const setSilentFlag = (paramOptions: InitOptions = {}) => {
    setFlag(EventTypes.XHR, !!paramOptions.silentXhr);
    setFlag(EventTypes.FETCH, !!paramOptions.silentFetch);
    setFlag(EventTypes.CONSOLE, !!paramOptions.silentConsole);
    setFlag(EventTypes.DOM, !!paramOptions.silentDom);
    setFlag(EventTypes.HISTORY, !!paramOptions.silentHistory);
    setFlag(EventTypes.ERROR, !!paramOptions.silentError);
    setFlag(EventTypes.UNHANDLEDREJECTION, !!paramOptions.silentUnhandledrejection);
    setFlag(EventTypes.HASHCHANGE, !!paramOptions.silentHashChange);
    setFlag(EventTypes.VUE, !!paramOptions.silentVue);
    //TODO: wxApp
    //TODO: wxPage
    //TODO: mini小程序 Route 
}