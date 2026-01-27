import { MetricsCollector } from '../types/MetricsCollector';

export class DummyMetricsCollector implements MetricsCollector {
  private counters: Map<string, number> = new Map();
  private histograms: Map<string, number[]> = new Map();

  // Konstante für maximale Werte pro Histogramm, um Speicher zu begrenzen
  private readonly MAX_HISTOGRAM_VALUES = 10000;

  incrementCounter(metricName: string, labels?: Record<string, string>): void {
    const key = this.serializeKey(metricName, labels);
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + 1);
  }

  recordHistogram(metricName: string, value: number, labels?: Record<string, string>): void {
    const key = this.serializeKey(metricName, labels);
    if (!this.histograms.has(key)) {
      this.histograms.set(key, []);
    }
    const values = this.histograms.get(key)!;
    values.push(value);

    // Begrenze die Anzahl der gespeicherten Werte
    if (values.length > this.MAX_HISTOGRAM_VALUES) {
      values.shift(); // Entferne das älteste Element
    }
  }

  startTimer(labels?: Record<string, string>): () => number {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      this.recordHistogram('operation_duration_ms', duration, labels);
      return duration;
    };
  }

  private calculatePercentile(sortedValues: number[], percentile: number): number {
    if (sortedValues.length === 0) return 0;
    const index = Math.floor(percentile / 100 * (sortedValues.length - 1));
    return sortedValues[index];
  }

  getHistogramStats(metricName: string, labels?: Record<string, string>): {
    count: number;
    sum: number;
    min: number;
    max: number;
    p50: number;
    p95: number;
    p99: number;
  } {
    const key = this.serializeKey(metricName, labels);
    const values = [...(this.histograms.get(key) || [])].sort((a, b) => a - b); // Kopie und sortieren

    if (values.length === 0) {
      return { count: 0, sum: 0, min: 0, max: 0, p50: 0, p95: 0, p99: 0 };
    }

    const count = values.length;
    const sum = values.reduce((acc, val) => acc + val, 0);
    const min = values[0];
    const max = values[count - 1];
    const p50 = this.calculatePercentile(values, 50);
    const p95 = this.calculatePercentile(values, 95);
    const p99 = this.calculatePercentile(values, 99);

    return { count, sum, min, max, p50, p95, p99 };
  }

  getCounterValue(metricName: string, labels?: Record<string, string>): number {
    const key = this.serializeKey(metricName, labels);
    return this.counters.get(key) || 0;
  }

  getAllCounters(): Map<string, number> {
    return new Map(this.counters);
  }

  getAllHistograms(): Map<string, number[]> {
    const snapshot = new Map();
    for (const [key, values] of this.histograms.entries()) {
      snapshot.set(key, [...values]); // Kopie der Arrays
    }
    return snapshot;
  }

  private serializeKey(name: string, labels?: Record<string, string>): string {
    if (!labels) return name;
    // Beispiel für Prometheus-artiges Format: metric_name{label1="value1",label2="value2"}
    const labelString = Object.entries(labels)
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
    return `${name}{${labelString}}`;
  }
}

export default DummyMetricsCollector;
