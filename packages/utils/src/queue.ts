import type { voidFun  } from '@coveyz/monitor-types';

import { _global } from './global';

/**
 * 🍇 微任务队列 主要用于异步 顺序的执行（eg： 数据上报，打点。。。）
 * 防止高频事件 导致阻塞和丢失
 */
export class Queue {
    /** 🍇 微任务 */
    private micro: Promise<void>;
    /** 🍇 存储等待执行的 */
    private stack: any[] = [];
    /** 🍇 是否正在执行队列 */
    private isFlushing = false;

    constructor() {
        // 🍇 环境如果不支持的话。降级为同步
        if (!('Promise' in _global)) return;
        this.micro = Promise.resolve();
    };
    /** 🍇 添加 */
    addFn(fn: voidFun): void {
        if (typeof fn !== 'function') return;
        // 🍇 环境如果不支持的话。降级为同步
        if (!('Promise' in _global)) {
            fn();
            return;
        };

        this.stack.push(fn);
        // 🍇 如果当前没有执行队列，则触发微任务执行 flushStack
        if (!this.isFlushing) {
            this.isFlushing = true;
            this.micro.then(() => this.flushStack());
        };
    };
    /** 🍇 清空栈 */
    clear() {
        this.stack = [];
    };
    getStack() {
        return this.stack;
    };
    /** 🍇 执行队列 */
    flushStack():void {
        /** 🍇 拷贝 */
        const snapshot = this.stack.slice(0);

        this.stack.length = 0;
        this.isFlushing = false;
        
        /** 🍇 依次执行 */
        for (let i = 0; i < snapshot.length; i++) {
            snapshot[i]();
        }
    }
};