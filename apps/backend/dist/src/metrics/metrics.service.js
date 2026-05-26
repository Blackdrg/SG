"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsService = void 0;
const common_1 = require("@nestjs/common");
let MetricsService = class MetricsService {
    constructor() {
        this.httpRequestDuration = new Map();
        this.queueFailures = new Map();
        this.socketFailures = new Map();
        this.paymentFailures = new Map();
    }
    startTimer() {
        const start = Date.now();
        return {
            stop: () => {
                const end = Date.now();
                return end - start;
            },
        };
    }
    observeHttpRequestDuration(method, route, statusCode, durationMs) {
        const key = `${method}:${route}:${statusCode}`;
        const current = this.httpRequestDuration.get(key) || { sum: 0, count: 0 };
        current.sum += durationMs;
        current.count += 1;
        this.httpRequestDuration.set(key, current);
    }
    incrementQueueFailure(queueName) {
        const current = this.queueFailures.get(queueName) || 0;
        this.queueFailures.set(queueName, current + 1);
    }
    incrementSocketFailure(namespace, event) {
        const key = `${namespace}:${event}`;
        const current = this.socketFailures.get(key) || 0;
        this.socketFailures.set(key, current + 1);
    }
    incrementPaymentFailure(provider, errorType) {
        const key = `${provider}:${errorType}`;
        const current = this.paymentFailures.get(key) || 0;
        this.paymentFailures.set(key, current + 1);
    }
    async getMetrics() {
        const lines = [];
        lines.push('# HELP http_request_duration_seconds Duration of HTTP requests in seconds');
        lines.push('# TYPE http_request_duration_seconds histogram');
        for (const [key, value] of this.httpRequestDuration.entries()) {
            const [method, route, statusCode] = key.split(':');
            const avg = value.count > 0 ? value.sum / value.count / 1000 : 0;
            lines.push(`http_request_duration_seconds{method="${method}",route="${route}",status_code="${statusCode}"} ${avg}`);
        }
        lines.push('# HELP queue_failures_total Total number of queue processing failures');
        lines.push('# TYPE queue_failures_total counter');
        for (const [queueName, count] of this.queueFailures.entries()) {
            lines.push(`queue_failures_total{queue_name="${queueName}"} ${count}`);
        }
        lines.push('# HELP socket_failures_total Total number of socket connection failures');
        lines.push('# TYPE socket_failures_total counter');
        for (const [key, count] of this.socketFailures.entries()) {
            const [namespace, event] = key.split(':');
            lines.push(`socket_failures_total{namespace="${namespace}",event="${event}"} ${count}`);
        }
        lines.push('# HELP payment_failures_total Total number of payment processing failures');
        lines.push('# TYPE payment_failures_total counter');
        for (const [key, count] of this.paymentFailures.entries()) {
            const [provider, errorType] = key.split(':');
            lines.push(`payment_failures_total{provider="${provider}",error_type="${errorType}"} ${count}`);
        }
        return lines.join('\n');
    }
};
exports.MetricsService = MetricsService;
exports.MetricsService = MetricsService = __decorate([
    (0, common_1.Injectable)()
], MetricsService);
//# sourceMappingURL=metrics.service.js.map