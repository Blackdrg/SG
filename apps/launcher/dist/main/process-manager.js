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
exports.ProcessManager = void 0;
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
class ProcessManager {
    storeManager;
    dockerManager;
    services = [
        { name: 'PostgreSQL', type: 'docker', startCmd: 'compose.dev.yaml', port: 5432 },
        { name: 'Redis', type: 'docker', startCmd: 'compose.dev.yaml', port: 6379 },
        { name: 'MongoDB', type: 'docker', startCmd: 'compose.dev.yaml', port: 27017 },
        { name: 'OpenSearch', type: 'docker', startCmd: 'compose.dev.yaml', port: 9200 },
        { name: 'Prometheus', type: 'docker', startCmd: 'compose.dev.yaml', port: 9090 },
        { name: 'Grafana', type: 'docker', startCmd: 'compose.dev.yaml', port: 3000 },
        { name: 'AlertManager', type: 'docker', startCmd: 'compose.dev.yaml', port: 9093 },
        { name: 'Backend', type: 'node', startCmd: 'npm run dev', cwd: 'apps/backend', port: 3001 },
        { name: 'Customer Web', type: 'node', startCmd: 'npm run dev -- -p 3001', cwd: 'apps/customer-web', port: 3001 },
        { name: 'Restaurant Dashboard', type: 'node', startCmd: 'npm run dev -- -p 3002', cwd: 'apps/restaurant-dashboard', port: 3002 },
        { name: 'Admin Dashboard', type: 'node', startCmd: 'npm run dev -- -p 3003', cwd: 'apps/super-admin', port: 3003 }
    ];
    processes = new Map();
    logsPath;
    constructor(storeManager, dockerManager) {
        this.storeManager = storeManager;
        this.dockerManager = dockerManager;
        this.logsPath = path.join(process.cwd(), 'launcher-logs');
        if (!fs.existsSync(this.logsPath)) {
            fs.mkdirSync(this.logsPath, { recursive: true });
        }
    }
    async startAll() {
        const results = {};
        const dockerResult = await this.dockerManager.startInfrastructure();
        results['Infrastructure'] = dockerResult.success ? true : dockerResult.error || 'failed';
        await this.delay(5000);
        for (const service of this.services.filter(s => s.type === 'node')) {
            const result = await this.startService(service.name);
            results[service.name] = result.success ? true : result.error || 'failed';
        }
        return { success: Object.values(results).every(r => r === true), results };
    }
    async stopAll() {
        const results = {};
        for (const service of this.services.filter(s => s.type === 'node')) {
            if (this.processes.has(service.name)) {
                const proc = this.processes.get(service.name);
                proc.kill();
                this.processes.delete(service.name);
            }
            results[service.name] = true;
        }
        const dockerResult = await this.dockerManager.stopInfrastructure();
        results['Infrastructure'] = dockerResult.success ? true : dockerResult.error || 'failed';
        return { success: Object.values(results).every(r => r === true), results };
    }
    async restart() {
        await this.stopAll();
        await this.delay(3000);
        return await this.startAll();
    }
    async getStatus() {
        const statuses = [];
        for (const service of this.services) {
            const status = {
                name: service.name,
                status: 'stopped',
                port: service.port
            };
            const proc = this.processes.get(service.name);
            if (proc && !proc.killed) {
                status.status = 'running';
                status.pid = proc.pid;
            }
            else if (service.type === 'docker') {
                const dockerStatuses = await this.dockerManager.getStatus();
                const dockerStatus = dockerStatuses.find(s => s.name === service.name.toLowerCase());
                if (dockerStatus) {
                    status.status = dockerStatus.status;
                }
            }
            statuses.push(status);
        }
        return statuses;
    }
    async startService(serviceName) {
        const service = this.services.find(s => s.name === serviceName);
        if (!service)
            return { success: false, error: 'Service not found' };
        try {
            const proc = (0, child_process_1.spawn)(service.startCmd, {
                shell: true,
                cwd: service.cwd ? path.join(process.cwd(), service.cwd) : process.cwd()
            });
            this.processes.set(serviceName, proc);
            const logFile = fs.createWriteStream(path.join(this.logsPath, `${serviceName.toLowerCase().replace(/\s+/g, '-')}.log`));
            proc.stdout?.pipe(logFile);
            proc.stderr?.pipe(logFile);
            return { success: true };
        }
        catch (err) {
            return { success: false, error: err.message };
        }
    }
    async getLogs(service) {
        const logFile = path.join(this.logsPath, `${service.toLowerCase().replace(/\s+/g, '-')}.log`);
        if (fs.existsSync(logFile)) {
            return fs.readFileSync(logFile, 'utf-8');
        }
        return '';
    }
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
exports.ProcessManager = ProcessManager;
//# sourceMappingURL=process-manager.js.map