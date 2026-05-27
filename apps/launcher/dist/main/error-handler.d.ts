export interface LauncherError {
    code: string;
    message: string;
    severity: 'warning' | 'error' | 'fatal';
    resolution?: string;
}
export declare class ErrorHandler {
    private errors;
    private logsDir;
    constructor();
    detectPortConflict(port: number): LauncherError | null;
    detectDockerMissing(): LauncherError;
    detectDockerNotRunning(): LauncherError;
    detectMissingDependency(name: string): LauncherError;
    detectDBConnectionError(db: string): LauncherError;
    detectAPIStartupFailure(service: string): LauncherError;
    logError(error: LauncherError): void;
    private writeLog;
    showError(error: LauncherError): void;
    getErrors(): LauncherError[];
    clearErrors(): void;
}
//# sourceMappingURL=error-handler.d.ts.map