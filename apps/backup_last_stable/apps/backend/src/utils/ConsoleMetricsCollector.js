"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ConsoleMetricsCollector {
    incrementCounter(metricName, labels) {
        console.log(`[Metric] Counter: ${metricName}`, labels || {});
    }
    recordHistogram(metricName, value, labels) {
        console.log(`[Metric] Histogram: ${metricName}, Value: ${value}`, labels || {});
    }
}
exports.default = ConsoleMetricsCollector;
