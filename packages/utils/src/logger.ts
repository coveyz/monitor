import { _global, _support } from './global';

const PREFIX = 'Monitor Logger📓';

export class Logger {
    private enabled = false;
    private _console: Console = {} as Console;

    constructor() {
        //🍇 优先考虑 window
        _global.console = console || _global.console;
        //🍇 存在， 缓存常见方法
        if (console || _global.console) {
            const consoleType = ['log', 'debug', 'info', 'warn', 'error', 'assert'];
            consoleType.forEach((level) => {
                if (!(level in _global.console)) return;
                this._console[level] = _global.console[level];
            });
        };
    };
    /** 🍇 禁用 */
    disable(): void {
        this.enabled = false;
    };
    /** 🍇 由外层 option 绑定 */
    bindOptions(debug: boolean) {
        this.enabled = !!debug;
    };
    /** 🍇 读取当前开关状态（给像 silentConsoleScope 这种工具使用）*/
    getEnableStatus() {
        return this.enabled;
    };
    /** 🍇 需要 enabled=true 统一加前缀 */
    log(...args: any[]) {
        if (!this.enabled) return;
        this._console.log(`${PREFIX}[LOG]`, ...args);
    };
    /** 🍇 warn */
    warn(...args: any[]) {
        if (!this.enabled) return;
        this._console.warn(`${PREFIX}[WARN]`, ...args);
    };
    /** 🍇 error */
    error(...args: any[]) {
        if (!this.enabled) return;
        this._console.error(`${PREFIX}[ERROR]`, ...args);
    };
};


export const logger = _support.logger || (_support.logger = new Logger());