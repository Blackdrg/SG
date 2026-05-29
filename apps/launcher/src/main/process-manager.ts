import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
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

interface ServiceConfig {
  name: string;
  type: 'docker' | 'node';
  startCmd: string;
  cwd?: string;
  port?: number;
  healthEndpoint?: string;
}

export class ProcessManager {
  private storeManager: StoreManager;
  private dockerManager: DockerManager;
  private services: ServiceConfig[] = [
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
  private processes: Map<string, ChildProcess> = new Map();
  private logsPath: string;

  constructor(storeManager: StoreManager, dockerManager: DockerManager) {
    this.storeManager = storeManager;
    this.dockerManager = dockerManager;
    this.logsPath = path.join(process.cwd(), 'launcher-logs');
    if (!fs.existsSync(this.logsPath)) {
      fs.mkdirSync(this.logsPath, { recursive: true });
    }
  }

  async startAll(): Promise<{ success: boolean; results: Record<string, boolean | string> }> {
    const results: Record<string, boolean | string> = {};

    const dockerResult = await this.dockerManager.startInfrastructure();
    results['Infrastructure'] = dockerResult.success ? true : dockerResult.error || 'failed';

    await this.delay(5000);

    for (const service of this.services.filter(s => s.type === 'node')) {
      const result = await this.startService(service.name);
      results[service.name] = result.success ? true : result.error || 'failed';
    }

    return { success: Object.values(results).every(r => r === true), results };
  }

  async stopAll(): Promise<{ success: boolean; results: Record<string, boolean | string> }> {
    const results: Record<string, boolean | string> = {};

    for (const service of this.services.filter(s => s.type === 'node')) {
      if (this.processes.has(service.name)) {
        const proc = this.processes.get(service.name)!;
        proc.kill();
        this.processes.delete(service.name);
      }
      results[service.name] = true;
    }

    const dockerResult = await this.dockerManager.stopInfrastructure();
    results['Infrastructure'] = dockerResult.success ? true : dockerResult.error || 'failed';

    return { success: Object.values(results).every(r => r === true), results };
  }

  async restart(): Promise<{ success: boolean; results: Record<string, boolean | string> }> {
    await this.stopAll();
    await this.delay(3000);
    return await this.startAll();
  }

  async getStatus(): Promise<ServiceStatus[]> {
    const statuses: ServiceStatus[] = [];

    for (const service of this.services) {
      const status: ServiceStatus = {
        name: service.name,
        status: 'stopped',
        port: service.port
      };

      const proc = this.processes.get(service.name);
      if (proc && !proc.killed) {
        status.status = 'running';
        status.pid = proc.pid;
      } else if (service.type === 'docker') {
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

  private async startService(serviceName: string): Promise<{ success: boolean; error?: string }> {
    const service = this.services.find(s => s.name === serviceName);
    if (!service) return { success: false, error: 'Service not found' };

    try {
      const proc = spawn(service.startCmd, {
        shell: true,
        cwd: service.cwd ? path.join(process.cwd(), service.cwd) : process.cwd()
      });

      this.processes.set(serviceName, proc);

      const logFile = fs.createWriteStream(path.join(this.logsPath, `${serviceName.toLowerCase().replace(/\s+/g, '-')}.log`));
      proc.stdout?.pipe(logFile);
      proc.stderr?.pipe(logFile);

      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err.message };
    }
  }

  async getLogs(service: string): Promise<string> {
    const logFile = path.join(this.logsPath, `${service.toLowerCase().replace(/\s+/g, '-')}.log`);
    if (fs.existsSync(logFile)) {
      return fs.readFileSync(logFile, 'utf-8');
    }
    return '';
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}