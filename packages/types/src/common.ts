
export type AnyObj = Record<string, any>

export type TNumStrObj = number | string | object;

export type voidFun = () => void;


/** 🍇 全局变量类型 */
export type TotalEventName = 
    | keyof GlobalEventHandlersEventMap
    | keyof XMLHttpRequestEventTargetEventMap
    | keyof WindowEventMap


export interface ResourceErrorTarget {
    src?: string;
    href?: string;
    localName?: string;
}