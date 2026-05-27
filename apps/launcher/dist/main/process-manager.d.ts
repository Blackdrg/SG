import { StoreManager } from './store-manager';
import { DockerManager } from './docker-manager';
interface ServiceStatus {
    name: string;
    status: 'running' | 'stopped' | 'starting' | 'error';
    pid?: number;
    port?: number;
    uptime?: string;
    lastLog?: string;
}
export declare class ProcessManager {
    private storeManager;
    private dockerManager;
    private services;
    private processes;
    private logsPath;
    constructor(storeManager: StoreManager, dockerManager: DockerManager);
    startAll(): Promise<{
        success: boolean;
        results: Record<string, boolean | string>;
    }>;
    stopAll(): Promise<{
        success: boolean;
        results: Record<string, boolean | string>;
    }>;
    restart(): Promise<{
        success: boolean;
        results: Record<string, boolean | string>;
    }>;
    getStatus(): Promise<ServiceStatus[]>;
    private startService;
    getLogs(service: string): Promise<string>;
    private delay;
}
export {};
//# sourceMappingURL=process-manager.d.ts.map