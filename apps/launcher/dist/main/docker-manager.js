"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DockerManager = void 0;
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
class DockerManager {
    storeManager;
    composeFile;
    constructor(storeManager) {
        this.storeManager = storeManager;
        this.composeFile = path.join(process.cwd(), 'compose.dev.yaml');
    }
    async isDockerInstalled() {
        return new Promise((resolve) => {
            const proc = (0, child_process_1.spawn)('docker', ['--version'], { shell: true });
            proc.on('close', (code) => resolve(code === 0));
            proc.on('error', () => resolve(false));
        });
    }
    async isDockerRunning() {
        return new Promise((resolve) => {
            const proc = (0, child_process_1.spawn)('docker', ['info'], { shell: true });
            proc.on('close', (code) => resolve(code === 0));
            proc.on('error', () => resolve(false));
        });
    }
    async getStatus() {
        const services = [
            { name: 'postgres', status: 'stopped', port: 5432 },
            { name: 'redis', status: 'stopped', port: 6379 },
            { name: 'mongo', status: 'stopped', port: 27017 },
            { name: 'opensearch', status: 'stopped', port: 9200 },
            { name: 'prometheus', status: 'stopped', port: 9090 },
            { name: 'grafana', status: 'stopped', port: 3000 },
            { name: 'alertmanager', status: 'stopped', port: 9093 }
        ];
        for (const service of services) {
            const actualStatus = await this.getContainerStatus(service.name);
            service.status = actualStatus.status;
            service.containerId = actualStatus.containerId;
            service.health = actualStatus.health;
        }
        return services;
    }
    async getContainerStatus(serviceName) {
        return new Promise((resolve) => {
            const proc = (0, child_process_1.spawn)('docker', ['ps', '-a', '--filter', `name=${serviceName}`, '--format', '{{.ID}}|{{.Status}}'], {
                shell: true
            });
            let output = '';
            proc.stdout.on('data', (data) => (output += data.toString()));
            proc.on('close', () => {
                if (!output) {
                    resolve({ status: 'stopped', health: 'unknown' });
                    return;
                }
                const [containerId, status] = output.trim().split('|');
                if (status.includes('Up')) {
                    resolve({ status: 'running', containerId, health: 'healthy' });
                }
                else if (status.includes('Exited')) {
                    resolve({ status: 'stopped', containerId, health: 'unhealthy' });
                }
                else {
                    resolve({ status: 'error', containerId, health: 'unknown' });
                }
            });
            proc.on('error', () => resolve({ status: 'error', health: 'unknown' }));
        });
    }
    async startInfrastructure() {
        try {
            const isInstalled = await this.isDockerInstalled();
            if (!isInstalled) {
                return { success: false, error: 'Docker is not installed. Please install Docker Desktop.' };
            }
            const isRunning = await this.isDockerRunning();
            if (!isRunning) {
                return { success: false, error: 'Docker Desktop is not running. Please start Docker Desktop.' };
            }
            const proc = (0, child_process_1.spawn)('docker-compose', ['-f', this.composeFile, 'up', '-d'], {
                shell: true,
                cwd: path.dirname(this.composeFile)
            });
            return new Promise((resolve) => {
                let error = '';
                proc.stderr.on('data', (data) => (error += data.toString()));
                proc.on('close', (code) => {
                    resolve({ success: code === 0, error: code !== 0 ? error : undefined });
                });
            });
        }
        catch (err) {
            return { success: false, error: err.message };
        }
    }
    async stopInfrastructure() {
        try {
            const proc = (0, child_process_1.spawn)('docker-compose', ['-f', this.composeFile, 'down'], {
                shell: true,
                cwd: path.dirname(this.composeFile)
            });
            return new Promise((resolve) => {
                let error = '';
                proc.stderr.on('data', (data) => (error += data.toString()));
                proc.on('close', (code) => {
                    resolve({ success: code === 0, error: code !== 0 ? error : undefined });
                });
            });
        }
        catch (err) {
            return { success: false, error: err.message };
        }
    }
    async resetDatabases() {
        try {
            await this.stopInfrastructure();
            await new Promise((resolve) => setTimeout(resolve, 3000));
            await this.startInfrastructure();
            return { success: true };
        }
        catch (err) {
            return { success: false, error: err.message };
        }
    }
}
exports.DockerManager = DockerManager;
//# sourceMappingURL=docker-manager.js.map