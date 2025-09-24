export enum EMethods {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
};

/** 🍇 上报错误类型 */
export enum ErrorTypes {
    UNKNOWN = 'UNKNOWN',
    UNKNOWN_FUNCTION = 'UNKNOWN_FUNCTION',
    JAVASCRIPT_ERROR = 'JAVASCRIPT_ERROR',
    LOG_ERROR = 'LOG_ERROR',
    FETCH_ERROR = 'FETCH_ERROR',
    VUE_ERROR = 'VUE_ERROR',
    REACT_ERROR = 'REACT_ERROR',
    RESOURCE_ERROR = 'RESOURCE_ERROR',
    PROMISE_ERROR = 'PROMISE_ERROR',
    ROUTE_ERROR = 'ROUTE_ERROR',
};


/** 🍇 事件类型 */
export enum EventTypes {
    XHR = 'xhr',
    FETCH = 'fetch',
    CONSOLE = 'console',
    DOM = 'dom',
    HISTORY = 'history',
    ERROR = 'error',
    HASHCHANGE = 'hashchange',
    UNHANDLEDREJECTION = 'unhandledrejection',
    MONITOR = 'monitor',
    VUE = 'vue',
    MINI_ROUTE = 'miniRoute',
    MINI_PERFORMANCE = 'miniPerformance',
    MINI_MEMORY_WARNING = 'miniMemoryWarning',
    MINI_NETWORK_STATUS_CHANGE = 'miniNetworkStatusChange',
    MINI_BATTERY_INFO = 'miniBatteryInfo',
    WS = 'ws'
};

/** 🍇 用户行为 栈事件类型 */
export enum BreadCrumbTypes {
    ROUTE = 'Route',
    CLICK = 'Click',
    CONSOLE = 'Console',
    XHR = 'Xhr',
    FETCH = 'Fetch',
    UNHANDLEDREJECTION = 'UnhandledRejection',
    VUE = 'Vue',
    REACT = 'React',
    RESOURCE = 'Resource',
    CODE_ERROR = 'Code Error',
    CUSTOMER = 'Customer',
    TAP = 'Tap',
    TOUCHMOVE = 'TouchMove',
    //TODO: 小程序
};

/** 🍇 用户行为 整合类型 */
export enum BreadCrumbCategory {
    HTTP = 'http',
    USER = 'user',
    DEBUG = 'debug',
    EXCEPTION = 'exception',
    LIFECYCLE = 'lifecycle'
};

/** 🍇 HTTP 请求类型 */
export enum HttpTypes {
    XHR = 'xhr',
    FETCH = 'fetch'
};

/** 🍇 HTTP 响应状态码 */
export enum HttpCodes {
    OK = 200,
    CREATED = 201,
    ACCEPTED = 202,
    NO_CONTENT = 204,
    MOVED_PERMANENTLY = 301,
    FOUND = 302,
    NOT_MODIFIED = 304,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    INTERNAL_EXCEPTION = 500,
    SERVICE_UNAVAILABLE = 503
};

/** 🍇 等级程度 枚举 */
export enum Severity {
    Else = 'else',
    Error = 'error',
    Warning = 'warning',
    Info = 'info',
    Debug = 'debug',
    /** 上报等级错误 */
    Low = 'low',
    Normal = 'normal',
    High = 'high',
    Critical = 'critical'
};

export enum EActionType {
    /** 🍇 页面曝光 */
    PAGE = 'PAGE',
    /** 🍇 事件埋点 */
    EVENT = 'EVENT',
    /** 🍇 区域曝光 */
    VIEW = 'VIEW',
    /** 🍇 时长埋点 */
    DURATION = 'DURATION',
    /** 🍇 区域曝光的时长埋点 */
    DURATION_VIEW = 'DURATION_VIEW',
    /** 🍇 其他买点类型 */
    OTHER = 'OTHER'
}

/** 🍇 错误类型正则 */
export const ERROR_TYPE_RE = /^(?:[Uu]ncaught (?:exception: )?)?(?:((?:Eval|Internal|Range|Reference|Syntax|Type|URI|)Error): )?(.*)$/;

/** 🍇 全局变量 */
export const GlobalVar = {
    isLogAddBreadcrumb: true,
    crossOriginThreshold: 1000
}

