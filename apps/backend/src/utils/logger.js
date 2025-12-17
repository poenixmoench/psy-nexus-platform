"use strict";
/**
 * Production-Ready Logger Utility
 * Strukturiertes Logging für PSY-NEXUS Backend
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLogger = exports.Logger = void 0;
var Logger = /** @class */ (function () {
    function Logger(context) {
        this.context = context;
    }
    Logger.prototype.log = function (message, data) {
        console.log("[".concat(this.context, "] ").concat(message), data || '');
    };
    Logger.prototype.error = function (message, error) {
        console.error("[\u274C ".concat(this.context, "] ").concat(message), error || '');
    };
    Logger.prototype.warn = function (message, data) {
        console.warn("[\u26A0\uFE0F  ".concat(this.context, "] ").concat(message), data || '');
    };
    Logger.prototype.debug = function (message, data) {
        if (process.env.DEBUG) {
            console.debug("[\uD83D\uDD0D ".concat(this.context, "] ").concat(message), data || '');
        }
    };
    Logger.prototype.info = function (message, data) {
        console.info("[\u2139\uFE0F  ".concat(this.context, "] ").concat(message), data || '');
    };
    return Logger;
}());
exports.Logger = Logger;
var createLogger = function (context) { return new Logger(context); };
exports.createLogger = createLogger;
