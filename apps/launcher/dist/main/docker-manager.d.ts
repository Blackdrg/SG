import { StoreManager } from './store-manager';
interface DockerService {
    name: string;
    status: 'running' | 'stopped' | 'starting' | 'error';
    containerId?: string;
    port?: number;
    health?: 'healthy' | 'unhealthy' | 'unknown';
}
export declare class DockerManager {
    private storeManager;
    private composeFile;
    constructor(storeManager: StoreManager);
    isDockerInstalled(): Promise<boolean>;
    isDockerRunning(): Promise<boolean>;
    getStatus(): Promise<DockerService[]>;
    private getContainerStatus;
    startInfrastructure(): Promise<{
        success: boolean;
        error?: string;
    }>;
    stopInfrastructure(): Promise<{
        success: boolean;
        error?: string;
    }>;
    resetDatabases(): Promise<{
        success: boolean;
        error?: string;
    }>;
}
export {};
//# sourceMappingURL=docker-manager.d.ts.map