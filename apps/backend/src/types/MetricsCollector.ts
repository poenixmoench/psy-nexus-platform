export interface MetricsCollector {
  incrementCounter(metricName: string, labels?: Record<string, string>): void;
  recordHistogram(metricName: string, value: number, labels?: Record<string, string>): void;
}
