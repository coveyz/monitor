import { Severity } from '@coveyz/monitor-shared';

export function severityFromString(level: string): Severity {
    switch (level) {
        case 'debug':
            return Severity.Debug;
        case 'info':
        case 'log':
        case 'assert':
            return Severity.Info;
        case 'warn':
        case 'warning':
            return Severity.Warning;
        case Severity.Low:
        case Severity.Normal:
        case Severity.High:
        case Severity.Critical:
        case 'error':
            return Severity.Error;
        default:
            return Severity.Else;
    }
}
