import { MetricsCollector } from '../types/MetricsCollector';

export default class ConsoleMetricsCollector implements MetricsCollector {
  incrementCounter(metricName: string, labels?: Record<string, string>): void {
    console.log(`[Metric] Counter: ${metricName}`, labels || {});
  }
  recordHistogram(metricName: string, value: number, labels?: Record<string, string>): void {
    console.log(`[Metric] Histogram: ${metricName}, Value: ${value}`, labels || {});
  }
}
