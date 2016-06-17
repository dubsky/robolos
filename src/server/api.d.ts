
/** logging */
export interface Log {
    debug(message:string,object?:any):void;
    info(message:string,object?:any):void;
    error(message:string,object?:any):void;
}

export declare var log:Log;
