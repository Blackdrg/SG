import { StoreManager } from './store-manager';
interface Prerequisites {
    dockerInstalled: boolean;
    dockerRunning: boolean;
    nodeVersion: string;
    nodeSatisfies: boolean;
    portsAvailable: {
        port: number;
        available: boolean;
    }[];
    envExists: boolean;
    missingDependencies: string[];
}
export declare class EnvironmentManager {
    private storeManager;
    private ports;
    constructor(storeManager: StoreManager);
    checkPrerequisites(): Promise<Prerequisites>;
    private checkDockerInstalled;
    private checkDockerRunning;
    private checkNodeVersion;
    checkPorts(): Promise<{
        port: number;
        available: boolean;
    }[]>;
    private isPortAvailable;
    checkAndGenerateEnv(): void;
    generateEnv(): Promise<{
        success: boolean;
        path: string;
    }>;
    private generateSecrets;
    private buildEnvContent;
}
export {};
//# sourceMappingURL=environment-manager.d.ts.map