import { getFlag, setFlag } from "@coveyz/monitor-utils";
import type { EventTypes } from "@coveyz/monitor-shared";
import type { ReplaceCallback, ReplaceHandler } from "@coveyz/monitor-types";

const handlers: { [key in EventTypes]?: ReplaceCallback[] } = {};

/** 🍇 handler 注册到全局事件定约列表，确保每种类型都注册一次
 ** true表示注册成功，
 ** false表示已经注册过或者参数无效
 */
export const subscribeEvent = (handler: ReplaceHandler): boolean => {
    if (!handler || getFlag(handler.type)) return false;

    setFlag(handler.type, true);
    handlers[handler.type] = handlers[handler.type] || [];
    handlers[handler.type].push(handler.callback);

    return true;
};