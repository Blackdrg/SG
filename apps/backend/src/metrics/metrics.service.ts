import { Injectable } from '@nestjs/common';

interface Counter {
  inc(labels?: { [key: string]: string }): void;
}

interface Histogram {
  startTimer(): { stop: () => number };
  observe(value: number, labels?: { [key: string]: string }): void;
}

@Injectable()
export class MetricsService {
  private readonly httpRequestDuration: Map<string, { sum: number; count: number }> = new Map();
  private readonly queueFailures: Map<string, number> = new Map();
  private readonly socketFailures: Map<string, number> = new Map();
  private readonly paymentFailures: Map<string, number> = new Map();

  // Simulate a histogram for HTTP request duration
  startTimer() {
    const start = Date.now();
    return {
      stop: () => {
        const end = Date.now();
        return end - start;
      },
    };
  }

  // Record HTTP request duration
  observeHttpRequestDuration(
    method: string,
    route: string,
    statusCode: number,
    durationMs: number
  ) {
    const key = `${method}:${route}:${statusCode}`;
    const current = this.httpRequestDuration.get(key) || { sum: 0, count: 0 };
    current.sum += durationMs;
    current.count += 1;
    this.httpRequestDuration.set(key, current);
  }

  // Increment queue failures
  incrementQueueFailure(queueName: string) {
    const current = this.queueFailures.get(queueName) || 0;
    this.queueFailures.set(queueName, current + 1);
  }

  // Increment socket failures
  incrementSocketFailure(namespace: string, event: string) {
    const key = `${namespace}:${event}`;
    const current = this.socketFailures.get(key) || 0;
    this.socketFailures.set(key, current + 1);
  }

  // Increment payment failures
  incrementPaymentFailure(provider: string, errorType: string) {
    const key = `${provider}:${errorType}`;
    const current = this.paymentFailures.get(key) || 0;
    this.paymentFailures.set(key, current + 1);
  }

  // Expose metrics in Prometheus format
  async getMetrics(): Promise<string> {
    const lines: string[] = [];

    // HTTP request duration
    lines.push('# HELP http_request_duration_seconds Duration of HTTP requests in seconds');
    lines.push('# TYPE http_request_duration_seconds histogram');
    for (const [key, value] of this.httpRequestDuration.entries()) {
      const [method, route, statusCode] = key.split(':');
      const avg = value.count > 0 ? value.sum / value.count / 1000 : 0; // Convert ms to seconds
      lines.push(
        `http_request_duration_seconds{method="${method}",route="${route}",status_code="${statusCode}"} ${avg}`
      );
    }

    // Queue failures
    lines.push('# HELP queue_failures_total Total number of queue processing failures');
    lines.push('# TYPE queue_failures_total counter');
    for (const [queueName, count] of this.queueFailures.entries()) {
      lines.push(`queue_failures_total{queue_name="${queueName}"} ${count}`);
    }

    // Socket failures
    lines.push('# HELP socket_failures_total Total number of socket connection failures');
    lines.push('# TYPE socket_failures_total counter');
    for (const [key, count] of this.socketFailures.entries()) {
      const [namespace, event] = key.split(':');
      lines.push(`socket_failures_total{namespace="${namespace}",event="${event}"} ${count}`);
    }

    // Payment failures
    lines.push('# HELP payment_failures_total Total number of payment processing failures');
    lines.push('# TYPE payment_failures_total counter');
    for (const [key, count] of this.paymentFailures.entries()) {
      const [provider, errorType] = key.split(':');
      lines.push(`payment_failures_total{provider="${provider}",error_type="${errorType}"} ${count}`);
    }

    return lines.join('\n');
  }
}