export declare class MetricsService {
    private readonly httpRequestDuration;
    private readonly queueFailures;
    private readonly socketFailures;
    private readonly paymentFailures;
    startTimer(): {
        stop: () => number;
    };
    observeHttpRequestDuration(method: string, route: string, statusCode: number, durationMs: number): void;
    incrementQueueFailure(queueName: string): void;
    incrementSocketFailure(namespace: string, event: string): void;
    incrementPaymentFailure(provider: string, errorType: string): void;
    getMetrics(): Promise<string>;
}
