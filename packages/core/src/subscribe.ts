import { getFlag, setFlag, nativeTryCatch, logger, getFunctionName } from "@coveyz/monitor-utils";
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

/**
 * 🍇 事件分发中心： 
 * @param type 事件类型
 */
export const triggerHandlers = (type: EventTypes, data: any): void => {
    if (!type || !handlers[type]) return;

    handlers[type].forEach((callback) => {
        nativeTryCatch(() => {
            callback(data);
        }, (error) => {
            logger.error(
                `重写事件triggerHandlers的回调函数发生错误\nType:${type}\nName: ${getFunctionName(
                    callback,
                )}\nError: ${error}`,
            )
        });
    });

};