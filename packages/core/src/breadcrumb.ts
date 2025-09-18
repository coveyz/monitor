import { _support, silentConsoleScope, getTimestamp, validateOption, logger } from '@coveyz/monitor-utils';
import { BreadCrumbTypes, BreadCrumbCategory } from '@coveyz/monitor-shared';
import type { BreadcrumbPushData, InitOptions } from '@coveyz/monitor-types';

/** 
 * 🍇 维护 一组用户/系统行为 用于错误发生时提供上下文
 */
export class Breadcrumb {
    /** 🍇 最大容量，超出即丢弃最早的（FIFO）*/
    maxBreadcrumbs = 10;
    /** 🍇 外部注入狗子 */
    beforePushBreadcrumb: unknown = null;
    /** 🍇 内部栈结构 时间排序 */
    stack: BreadcrumbPushData[] = [];
    constructor() { }
    /** 🍇 带钩子执行 与 安全安装 */
    push(data: BreadcrumbPushData): void {
        if (typeof this.beforePushBreadcrumb === 'function') {
            let result: BreadcrumbPushData = null;
            const beforePushBreadcrumb = this.beforePushBreadcrumb;
            silentConsoleScope(() => {
                result = beforePushBreadcrumb(this, data);
            });
            if (!result) return;
            this.immediatePush(result);
            return;
        };
        this.immediatePush(data);
    }
    /** 🍇 真正进入栈 - 长度控制， 排序  */
    immediatePush(data: BreadcrumbPushData): void {
        data.time || (data.time = getTimestamp());
        //🍇 到达最大存储时 删除最老的
        if (this.stack.length >= this.maxBreadcrumbs) {
            this.stack.shift();
        };

        this.stack.push(data);
        this.stack.sort((a, b) => a.time - b.time);

        logger.log(this.stack);
    };
    /** 🍇 删除最早一条； 返回是否成功 */
    shift(): boolean {
        return this.stack.shift() !== undefined;
    };
    /** 🍇 清空面包屑栈 */
    clear(): void {
        this.stack = [];
    };
    /** 🍇 获取当前面包屑的栈 */
    getStack(): BreadcrumbPushData[] {
        return this.stack;
    };
    /** 
     * 🍇 获取当前面包屑的类别 
     * 将细粒度事件类型映射为较粗的分类（UI / HTTP / EXCEPTION / DEBUG / LIFECYCLE）
    */
    getCategory(type: BreadCrumbTypes) {
        switch (type) {
            case BreadCrumbTypes.XHR:
            case BreadCrumbTypes.FETCH:
                return BreadCrumbCategory.HTTP;
            case BreadCrumbTypes.CLICK:
            case BreadCrumbTypes.ROUTE:
            case BreadCrumbTypes.TAP:
            case BreadCrumbTypes.TOUCHMOVE:
                return BreadCrumbCategory.USER;
            case BreadCrumbTypes.CUSTOMER:
            case BreadCrumbTypes.CONSOLE:
                return BreadCrumbCategory.DEBUG;
            //TODO: 小程序
            case BreadCrumbTypes.UNHANDLEDREJECTION:
            case BreadCrumbTypes.CODE_ERROR:
            case BreadCrumbTypes.RESOURCE:
            case BreadCrumbTypes.REACT:
            case BreadCrumbTypes.VUE:
            default:
                return BreadCrumbCategory.EXCEPTION
        }
    };
    /** 🍇 绑定初始化选项 */
    bindOptions(options: InitOptions = {}): void {
        const { maxBreadcrumbs, beforePushBreadcrumb } = options;
        validateOption(maxBreadcrumbs, 'maxBreadcrumbs', 'number') && (this.maxBreadcrumbs = maxBreadcrumbs);
        validateOption(beforePushBreadcrumb, 'beforePushBreadcrumb', 'function') && (this.beforePushBreadcrumb = beforePushBreadcrumb);
    }
};

export const breadcrumb = _support.breadcrumb || (_support.breadcrumb = new Breadcrumb());

