import { EventTypes, ErrorTypes } from '@coveyz/monitor-shared';
import type { Severity } from '@coveyz/monitor-shared';
import type { InitOptions, ReportDataType } from '@coveyz/monitor-types';

import { setFlag } from './global';
import { getLocationHref, getTimestamp } from './helper';


/** 🍇 设置 静默 */
export const setSilentFlag = (paramOptions: InitOptions = {}) => {
    setFlag(EventTypes.XHR, !!paramOptions.silentXhr);
    setFlag(EventTypes.FETCH, !!paramOptions.silentFetch);
    setFlag(EventTypes.CONSOLE, !!paramOptions.silentConsole);
    setFlag(EventTypes.DOM, !!paramOptions.silentDom);
    setFlag(EventTypes.HISTORY, !!paramOptions.silentHistory);
    setFlag(EventTypes.ERROR, !!paramOptions.silentError);
    setFlag(EventTypes.UNHANDLEDREJECTION, !!paramOptions.silentUnhandledrejection);
    setFlag(EventTypes.HASHCHANGE, !!paramOptions.silentHashChange);
    setFlag(EventTypes.VUE, !!paramOptions.silentVue);
    //TODO: wxApp
    //TODO: wxPage
    //TODO: mini小程序 Route 
};

/** 
 * 🍇 解析 error 栈信息， 并返回args, columns, line, func, url 
*/
export const extractErrorStack = (ex: any, level: Severity): ReportDataType => {
    // console.log('extractErrorStack called with:', ex);
    // 🍇 基础信息 收集
    const normal = {
        time: getTimestamp(),
        url: getLocationHref(),
        name: ex.name,
        level,
        message: ex.message,
    };

    // 🍇 stack  存在性校验
    // 1. 某些错误对象可能没有stack属性
    // 2. 一些老版本浏览器不支持stack
    // 3. 手动抛出的简单错误可能没有调用栈
    if (typeof ex.stack === 'undefined' || !ex.stack) {
        return normal;
    };

    // 🍇 Chrome/V8 引擎的stack解析正则
    const chrome = /^\s*at (.*?) ?\(((?:file|https?|blob|chrome-extension|native|eval|webpack|<anonymous>|[a-z]:|\/).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i;
    // 🍇 Firefox/Gecko 引擎的stack解析正则
    const gecko = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)((?:file|https?|blob|chrome|webpack|resource|\[native).*?|[^@]*bundle)(?::(\d+))?(?::(\d+))?\s*$/i;
    // 🍇 IE/Edge 引擎的stack解析正则
    const winjs = /^\s*at (?:((?:\[object object\])?.+) )?\(?((?:file|ms-appx|https?|webpack|blob):.*?):(\d+)(?::(\d+))?\)?\s*$/i;
    // 🍇 用于从eval框架中额外解析URL/行/列
    const geckoEval = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i;
    const chromeEval = /\((\S*)(?::(\d+))(?::(\d+))\)/;
    // 🍇 逐行解析stack
    const lines = ex.stack.split('\n');
    const stack = [];

    // console.log('lines:', lines);
    let submatch, parts, element;
    for (let i = 0, j = lines.length; i < j; ++i) {
        // 🍇 尝试用 chrome 格式解析
        if ((parts = chrome.exec(lines[i]))) {
            // 原生帧
            const isNative = parts[2] && parts[2].indexOf('native') === 0; // start of line
            const isEval = parts[2] && parts[2].indexOf('eval') === 0; // start of line
            if (isEval && (submatch = chromeEval.exec(parts[2]))) {
                // 🍇 扔掉 eval 行/列， 使用最上面的行/列 编号
                parts[2] = submatch[1]; // url
                parts[3] = submatch[2]; // line
                parts[4] = submatch[3]; // column
            };
            element = {
                url: !isNative ? parts[2] : null,
                func: parts[1] || ErrorTypes.UNKNOWN_FUNCTION,
                args: isNative ? [parts[2]] : [],
                line: parts[3] ? +parts[3] : null,
                column: parts[4] ? +parts[4] : null
            }
            // console.log('chrome stack line matched:', {element,parts, isNative, isEval,  item:lines[i]});
        }
        // 🍇 尝试用 IE 格式解析
        else if ((parts = winjs.exec(lines[i]))) {
            element = {
                url: parts[2],
                func: parts[1] || ErrorTypes.UNKNOWN_FUNCTION,
                args: [],
                line: parts[3] ? +parts[3] : null,
                column: parts[4] ? +parts[4] : null,
            }
        }
        // 🍇 尝试用 Firefox 格式解析
        else if ((parts = gecko.exec(lines[i]))) {
            const isEval = parts[3] && parts[3].indexOf(' > eval') > -1;
            if (isEval && (submatch = geckoEval.exec(parts[3]))) {
                parts[3] = submatch[1];
                parts[4] = submatch[2];
                parts[5] = null; // no column when eval
            } else if (i === 0 && !parts[5] && typeof ex.columnNumber !== 'undefined') {
                // FireFox uses this awesome columnNumber property for its top frame
                // Also note, Firefox's column number is 0-based and everything else expects 1-based,
                // so adding 1
                // NOTE: this hack doesn't work if top-most frame is eval
                stack[0].column = ex.columnNumber + 1;
            }

            element = {
                url: parts[3],
                func: parts[1] || ErrorTypes.UNKNOWN_FUNCTION,
                args: parts[2] ? parts[2].split(',') : [],
                line: parts[4] ? +parts[4] : null,
                column: parts[5] ? +parts[5] : null
            };
        } 
        else {
            // console.log('stack line did not match any known format:', lines[i]);
            continue;
        };
        // 🍇 标准化输出
        if (!element.func && element.line) {
            element.func = ErrorTypes.UNKNOWN_FUNCTION;
        };
        stack.push(element);
    };

    if (!stack.length) {
        return null;
    };

    return {
        ...normal,
        stack
    }
};



/**
 * 🍇 调试用：本地快速触发错误并打印 extractErrorStack 的解析结果
 * 使用方式：在浏览器控制台或业务代码里设置 window.__MONITOR_DEBUG_EXTRACT__ = true
 * 然后加载（或热更新）页面即可自动运行示例；或主动调用 __debugextractErrorStackDemo()
 */
// export function __debugextractErrorStackDemo(): void {
//     // 构造多层调用，便于看到更完整的栈
//     function a() { b(); }
//     function b() { c(); }
//     function c() {
//         // 场景1：普通语法错误（JSON 解析失败）
//         try {
//             JSON.parse('{ bad json');
//         } catch (e1) {
//             const data1 = extractErrorStack(e1, 'Error' as unknown as Severity);
//             console.log('data1=>', data1);
//             // 分组展示，避免污染控制台
//             // eslint-disable-next-line no-console
//             console.groupCollapsed('[monitor][demo] extractErrorStack -> JSON.parse error');
//             // eslint-disable-next-line no-console
//             console.dir({ rawError: e1, parsed: data1 });
//             // eslint-disable-next-line no-console
//             console.groupEnd();
//         }

//         // 场景2：eval 触发的错误（用于验证 eval 栈解析分支）
//         try {
//             // eslint-disable-next-line no-eval
//             eval('JSON.parse("{bad")');
//         } catch (e2) {
//             const data2 = extractErrorStack(e2, 'Error' as unknown as Severity);
//             // eslint-disable-next-line no-console
//             console.groupCollapsed('[monitor][demo] extractErrorStack -> eval(JSON.parse) error');
//             // eslint-disable-next-line no-console
//             console.dir({ rawError: e2, parsed: data2 });
//             // eslint-disable-next-line no-console
//             console.groupEnd();
//         }
//     }

//     a();
// }

// __debugextractErrorStackDemo()