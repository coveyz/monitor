import type { EventTypes } from '@coveyz/monitor-shared';

export namespace Replace {
    export interface TriggerConsole {
        args: any[];
        level: string;
    }
    export interface IRoute {
        from: string;
        to: string;
    }
}

export type ReplaceCallback = (data: any) => void;

export interface ReplaceHandler {
    type: EventTypes;
    callback: ReplaceCallback;  
};