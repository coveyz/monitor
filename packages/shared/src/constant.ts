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
};

/**
 * 🍇 一次具体的操作/调用的时间片  具体状态
 */
export enum SpanStatus {
    /** 🍇 操作成功完成。 */
    Ok = 'ok',
    /** 🍇 操作未完成，截止时间已过。 */
    DeadlineExceeded = 'deadline_exceeded',
    /** 🍇 401 未认证（根据 RFC 7235 实际表示未认证）。 */
    Unauthenticated = 'unauthenticated',
    /** 🍇 403 禁止访问。 */
    PermissionDenied = 'permission_denied',
    /** 🍇 404 未找到。某些请求的实体（文件或目录）未找到。 */
    NotFound = 'not_found',
    /** 🍇 429 请求过多。 */
    ResourceExhausted = 'resource_exhausted',
    /** 🍇 客户端指定了无效参数。4xx。 */
    InvalidArgument = 'invalid_argument',
    /** 🍇 501 未实现。 */
    Unimplemented = 'unimplemented',
    /** 🍇 503 服务不可用。 */
    Unavailable = 'unavailable',
    /** 🍇 其他/通用 5xx 错误。 */
    InternalError = 'internal_error',
    /** 🍇 未知。任何非标准 HTTP 状态码。 */
    UnknownError = 'unknown_error',
    /** 🍇 操作被取消（通常由用户取消）。 */
    Cancelled = 'cancelled',
    /** 🍇 已存在（409）。 */
    AlreadyExists = 'already_exists',
    /** 🍇 操作被拒绝，因为系统未处于操作所需的状态。 */
    FailedPrecondition = 'failed_precondition',
    /** 🍇 操作被中止，通常由于并发问题。 */
    Aborted = 'aborted',
    /** 🍇 操作尝试超出有效范围。 */
    OutOfRange = 'out_of_range',
    /** 🍇 不可恢复的数据丢失或损坏。 */
    DataLoss = 'data_loss'
}

/** 🍇 错误类型正则 */
export const ERROR_TYPE_RE = /^(?:[Uu]ncaught (?:exception: )?)?(?:((?:Eval|Internal|Range|Reference|Syntax|Type|URI|)Error): )?(.*)$/;

/** 🍇 全局变量 */
export const GlobalVar = {
    isLogAddBreadcrumb: true,
    crossOriginThreshold: 1000
}

