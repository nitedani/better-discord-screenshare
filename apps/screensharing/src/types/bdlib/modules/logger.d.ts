/**
 * Simple logger for the lib and plugins.
 *
 * @module Logger
 */
/**
 * List of logging types.
 */
export declare const LogTypes: {
    /** Alias for error */
    err: string;
    error: string;
    /** Alias for debug */
    dbg: string;
    debug: string;
    log: string;
    warn: string;
    info: string;
};
export default class Logger {
    /**
     * Logs an error using a collapsed error group with stacktrace.
     *
     * @param {string} module - Name of the calling module.
     * @param {string} message - Message or error to have logged.
     * @param {Error} error - Error object to log with the message.
     */
    static stacktrace(module: any, message: any, error: any): void;
    /**
     * Logs using error formatting. For logging an actual error object consider {@link module:Logger.stacktrace}
     *
     * @param {string} module - Name of the calling module.
     * @param {string} message - Messages to have logged.
     */
    static err(module: any, ...message: any[]): void;
    /**
     * Logs a warning message.
     *
     * @param {string} module - Name of the calling module.
     * @param {...any} message - Messages to have logged.
     */
    static warn(module: any, ...message: any[]): void;
    /**
     * Logs an informational message.
     *
     * @param {string} module - Name of the calling module.
     * @param {...any} message - Messages to have logged.
     */
    static info(module: any, ...message: any[]): void;
    /**
     * Logs used for debugging purposes.
     *
     * @param {string} module - Name of the calling module.
     * @param {...any} message - Messages to have logged.
     */
    static debug(module: any, ...message: any[]): void;
    /**
     * Logs used for basic loggin.
     *
     * @param {string} module - Name of the calling module.
     * @param {...any} message - Messages to have logged.
     */
    static log(module: any, ...message: any[]): void;
    /**
     * Logs strings using different console levels and a module label.
     *
     * @param {string} module - Name of the calling module.
     * @param {any|Array<any>} message - Messages to have logged.
     * @param {module:Logger.LogTypes} type - Type of log to use in console.
     */
    static _log(module: any, message: any, type?: string): void;
    static parseType(type: any): any;
}
