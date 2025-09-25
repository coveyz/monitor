import { _support, Queue, validateOption, isReportDataType, isEmpty, logger, variableTypeDetection, isBrowserEnv } from '@coveyz/monitor-utils';
import { SDK_VERSION, SDK_NAME, EMethods } from '@coveyz/monitor-shared';
import type { InitOptions, FinalReportData, TransportDataType, AuthInfo, DeviceInfo } from '@coveyz/monitor-types';

import { createErrorId } from './errorId';
import { breadcrumb } from './breadcrumb';

/**
 * TransportData 传输层职责说明：
 * 
 * 1. 统一队列机制：enqueue => flush，避免高频事件丢失。
 * 2. 发送策略选择：
 *    - 优先：navigator.sendBeacon（仅支持且适用于 unload 前）。
 *    - 次选：XMLHttpRequest POST。
 *    - 降级：新建 Image 对象打点。
 * 3. 附加公共字段：
 *    - sdkName, sdkVersion, timestamp
 *    - userId / sessionId（如有）
 *    - token / apikey（如需鉴权）
 * 4. 错误重传（可选）：失败后重试或本地缓存（localStorage），下次初始化时补发。
 * 5. 循环防止：监控自身 /errors/upload 请求需标记 avoidHook=true，避免再次记录为 httpError。
 */


/**
 * 🍇 传输层
 * 负责将监控SDK收集到的各种事件 （错误， 行为，性能等）标准化 封装 发送到后端
 * 支持多端 （浏览器，小程序）多种发送形式 （XHR，img， wx.request)
 * 队列机制 避免高频事件丢失
 * 支持自定义钩子 方便拓展
 */
export class TransportData {
    /** 🍇 发送队列 */
    queue: Queue;
    /** 🍇 上报前 自定义处理钩子 */
    beforeDataReport: unknown = null;
    /** 🍇 用户/会话 ID */
    backTrackerId: unknown = null;
    /** 🍇 XHR 发送前 自定义配置钩子 */
    configReportXhr: unknown = null
    /** 🍇 动态修改 上报地址钩子 */
    configReportUrl: unknown = null
    /** 🍇 微信请求自定义配置钩子 //todo: wx */
    // configReportWxRequest: unknown = null
    /** 🍇 是否使用 img 方式上报 */
    useImgUpload = false;
    /** 🍇 API Key 项目/用户 鉴权 */
    apiKey = '';
    /** 🍇 埋点追踪 key */
    trackKey = '';
    /** 🍇 错误上报地址 */
    errorDsn = '';
    /** 🍇 埋点追踪上报地址 */
    trackDsn = '';

    /** 🍇 获取埋点追踪 ID */
    getTrackerId() {
        if (typeof this.backTrackerId === 'function') {
            const trackerId = this.backTrackerId();
            if (typeof trackerId === 'string' || typeof trackerId === 'number') {
                return trackerId;
            } else {
                logger.error(`trackerId 期望类型为string或number，但收到${typeof trackerId}类型。`);
            }
        };
        return '';
    };
    /** 🍇 构造 鉴权信息 */
    getAuthInfo(): AuthInfo {
        const trackerId = this.getTrackerId();

        const result: AuthInfo = {
            trackerId: String(trackerId),
            sdkVersion: SDK_VERSION,
            sdkName: SDK_NAME,
        };
        !isEmpty(this.apiKey) && (result.apiKey = this.apiKey);
        !isEmpty(this.trackKey) && (result.trackKey = this.trackKey);

        return result;
    };
    getRecord() {
        const recordData = _support.record;

        if (recordData && variableTypeDetection.isArray(recordData) && recordData.length > 2) {
            return recordData;
        };

        return [];
    };
    getDeviceInfo(): DeviceInfo | any {
        return _support.deviceInfo || {};
    };
    /** 🍇 构造 最终上报数据结构， 包含：鉴权，面包屑，设备 等 */
    getTransportData(data: FinalReportData): TransportDataType {
        return {
            authInfo: this.getAuthInfo(),
            breadcrumb: breadcrumb.getStack(),
            data: data,
            record: this.getRecord(),
            deviceInfo: this.getDeviceInfo()
        }
    };
    /** 🍇 上报前的预处理 生成错误errorId 执行自定义钩子 */
    async beforePost(data: FinalReportData) {
        if (isReportDataType(data)) {
            const errorId = createErrorId(data, this.apiKey);
            if (!errorId) return false;
            data.errorId = errorId;
        };

        let transportData = this.getTransportData(data);
        if (typeof this.beforeDataReport === 'function') {
            transportData = await this.beforeDataReport(transportData);
            if (!transportData) return false;
        };

        return transportData;
    };
    /** 🍇 用 无跨域限制的 img 上报 */
    imgRequest(data: TransportDataType, url: string) {
        const requestFun = () => {
            let img = new Image();
            const spliceStr = url.indexOf('?') === -1 ? '?' : '&';
            img.src = `${url}${spliceStr}data=${encodeURIComponent(JSON.stringify(data))}`;
            img = null;
        };
        this.queue.addFn(requestFun);
    }
    /** 🍇 标准 xhr post 上报 */
    xhrPost(data: TransportDataType, url: string) {
        const requestFun = () => {
            const xhr = new XMLHttpRequest();
            xhr.open(EMethods.POST, url, true);
            xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            // 🍇 允许携带 cookie 等凭证
            xhr.withCredentials = true;

            if (typeof this.configReportXhr === 'function') {
                this.configReportXhr(xhr, data);
            };

            xhr.onerror = function onerror() {
                logger.error('xhr send error');
            };
            xhr.ontimeout = function ontimeout() {
                logger.error('xhr send timeout');
            };
            xhr.onload = function onload() {
                if (this.status >= 200 && this.status < 300) {
                    logger.log('xhr send success');
                } else {
                    logger.error('xhr send fail');
                }
            };

            xhr.send(JSON.stringify(data));
        };

        this.queue.addFn(requestFun);
    }
    /** 🍇 监控错误上报的请求 */
    async send(data: FinalReportData) {
        let dsn = '';
        // 🍇 选择 dsn
        if (isReportDataType(data)) {
            dsn = this.errorDsn;
            if (isEmpty(dsn)) {
                logger.error('当前没有配置错误上报dsn地址 ，请在 init 中配置正确的 dsn 地址');
                return;
            }
        } else {
            dsn = this.trackDsn;
            if (isEmpty(dsn)) {
                logger.error('当前没有配置埋点上报trackDsn地址 ，请在 init 中配置正确的 trackDsn 地址');
                return;
            }
        };

        const result = await this.beforePost(data);
        if (!result) return;

        if (typeof this.configReportUrl === 'function') {
            dsn = this.configReportUrl(result, dsn);
            if (!dsn) return;
        };

        if (isBrowserEnv) {
            return this.useImgUpload
                ? this.imgRequest(result, dsn)
                : this.xhrPost(result, dsn)
        };

        // TODO: wxMiniEnv

    };
    /** 🍇 是否为 SDK 自身的上报请求 */
    isSdkTransportUrl(targetUrl: string) {
        if (!targetUrl) return false;
        return [this.errorDsn, this.trackDsn].some(dsn => dsn && targetUrl.includes(dsn));
    };
    /** 🍇 绑定 初始化 选项 */
    bindOptions(options: InitOptions = {}) {
        const {
            dsn, apiKey, trackDsn, trackKey, useImgUpload,
            beforeDataReport, configReportUrl, backTrackerId, configReportXhr
        } = options;

        validateOption(apiKey, 'apiKey', 'string') && (this.apiKey = apiKey);
        validateOption(trackKey, 'trackKey', 'string') && (this.trackKey = trackKey);
        validateOption(dsn, 'dsn', 'string') && (this.errorDsn = dsn);
        validateOption(trackDsn, 'trackDsn', 'string') && (this.trackDsn = trackDsn);
        validateOption(useImgUpload, 'useImgUpload', 'boolean') && (this.useImgUpload = useImgUpload);

        validateOption(beforeDataReport, 'beforeDataReport', 'function') && (this.beforeDataReport = beforeDataReport);
        validateOption(configReportUrl, 'configReportUrl', 'function') && (this.configReportUrl = configReportUrl);
        validateOption(backTrackerId, 'backTrackerId', 'function') && (this.backTrackerId = backTrackerId);
        validateOption(configReportXhr, 'configReportXhr', 'function') && (this.configReportXhr = configReportXhr);
    };
};

export const transportData = _support.transportData || (_support.transportData = new TransportData());