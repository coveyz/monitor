import type { Breadcrumb } from '@coveyz/monitor-core';

import type { BreadcrumbPushData } from './breadcrumb';
import type { TransportDataType } from './transportData';

type CANCEL = null | undefined | boolean;

type SetRequestHeader = (key: string, value: string) => {};
interface IRequestHeaderConfig {
    url: string;
    method: HttpMethod;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';

export interface BeforeAppAjaxSendConfig {
    setRequestHeader: SetRequestHeader;
}

export interface SilentEventType {
    /** 🍇 静默监控 Xhr事件 */
    silentXhr?: boolean;
    /** 🍇 静默监控 Fetch事件 */
    silentFetch?: boolean;
    /** 🍇 静默监控 Console事件 */
    silentConsole?: boolean;
    /** 🍇 静默监控 DOM事件 */
    silentDom?: boolean;
    /** 🍇 静默监控 History事件 */
    silentHistory?: boolean;
    /** 🍇 静默监控 Error事件 */
    silentError?: boolean;
    /** 🍇 静默监控 未处理事件 */
    silentUnhandledrejection?: boolean;
    /** 🍇 静默监控 HashChange事件 */
    silentHashChange?: boolean;
    /** 🍇 静默监控 Vue.warn 函数 */
    silentVue?: boolean;
};

export interface HooksTypes {
    /**
     * 🍇 breadcrumb 钩子函数 - 在每次添加用户行为事件前都会调用
     * @param breadcrumb 由SDK生成的 breadcrumb 事件栈
     * @param hint 当次的生成的 breadcrumb数据
     * @returns 如果返回了 null | undefined | boolean 将忽略本次的push
     */
    beforePushBreadcrumb?(breadcrumb: Breadcrumb, hint: BreadcrumbPushData): BreadcrumbPushData | CANCEL;
    /**
     * 🍇 上报前 自定义处理钩子， 每次发送事件前会调用
     * @param event 由SDK生成的 上报数据（有SDK生成的错误事件）
     * @returns 如果返回了 null | undefined | boolean 将忽略本次的上报
     */
    beforeDataReport?(
        event: TransportDataType
    ): Promise<TransportDataType | null | CANCEL> | TransportDataType | CANCEL | any | null;
    /**
     * 🍇 钩子函数，配置发送到服务端的xhr
     * 可以对当前xhr实例做一些配置：xhr.setRequestHeader(), xhr.withCredentials
     * 会在xhr.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8')、
     * xhr.withCredentials = true,后面调用该函数
     * @param xhr XMLHttpRequest 实例
     * @param reportData 上报的数据
     */
    configReportXhr?(xhr: XMLHttpRequest, reportData: TransportDataType | any): void;
    /**
     * 🍇 钩子函数 每次发送前都会调用
     * @param event 上报的数据格式
     * @param url 上报的服务端地址
     * @memberof HooksTypes
     */
    configReportUrl?(event: TransportDataType, url: string): string;
    /**
     * 🍇 钩子函数 在 beforeDataReport 后面调用
     * 在整合上报数据 和 本身SDK信息数据前调用， 当前函数执行完后立即将数据错误信息上报至服务端
     * trackId 表示用户唯一键（可以是userId）需要 trackerId 的意义可以区分每个错误影响的用户数量
     */
    backTrackerId?(): string | number;
    /**
     * 🍇 钩子函数 拦截用户页面的 ajax 请求， 并在ajax请求发送前执行该hook， 可以对用户发送的ajax请求做xhr.setRequestHeader
     * @param config 当前请求
     * @param setRequestHeader 
     */
    beforeAppAjaxSend?(config: IRequestHeaderConfig, setRequestHeader: BeforeAppAjaxSendConfig): void;
}

export interface InitOptions extends SilentEventType, HooksTypes {
    /** 🍇 错误监控的 dsn 服务器地址 */
    dsn?: string;
    /** 🍇 true时 整个sdk将禁用 */
    disabled?: boolean;
    /** 🍇 每个项目有唯一的Key，给监控的dsn用的 */
    apiKey?: string;
    /** 🍇 使用img上报的方式， 默认false，默认是xhr上报形式 */
    useImgUpload?: boolean;
    /** 🍇 每个项目有一个唯一trackKey，给埋点的dsn用的 */
    trackKey?: string;
    /** 🍇 默认关闭，true的时候会打印一些信息：breadcrumb */
    debug?: boolean;
    /** 🍇 默认是关闭traceId，开启时，页面的所有请求都会生成一个uuid，放入请求头中 */
    enableTraceId?: boolean;
    /** 
     * 🍇 如果开启了 enableTraceId,也需要配置该配置项 includeHttpUrlTraceIdRegExp.test(xhr.url)为true时，才会在该请求头中添加traceId
     ** 由于考虑部分接口如果随便加上多余的请求头会造成跨域，所以这边用的是包含关系的正则
     */
    includeHttpUrlTraceIdRegExp?: RegExp;
    /** 🍇 traceId放入请求头中的key 默认是Trace-Id */
    traceIdFieldName?: string;
    /** 🍇 默认为空，所有ajax都会被监听，不为空的时候 filterXhrUrlRegExp.test(xhr.url)为true时过滤 */
    filterXhrUrlRegExp?: RegExp;
    /** 🍇 默认20，最大100，超过100还是设置成100 */
    maxBreadcrumbs?: number;
    /** 🍇 按钮点击和微信触摸事件节流时间，默认是0 */
    throttleDelayTime?: number;
    /** 🍇 在引入wx-mini的情况下，使用该参数用来开启 */
    enableTrack?: boolean;
    /** 🍇 在开启 enableBury 后，将所有埋点信息上报到该服务端地址，如果该属性有值时才会启动无痕埋点 */
    trackDsn?: string;
    /** 🍇 最多可重复上报同一个错误的次数 */
    maxDuplicateCount?: number;
}