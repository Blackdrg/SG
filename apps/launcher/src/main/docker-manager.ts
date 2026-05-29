import { spawn } from 'child_process';

import * as path from 'path';
import { StoreManager } from './store-manager';

export interface DockerService {
  name: string;
  status: 'running' | 'stopped' | 'starting' | 'error';
  containerId?: string;
  port?: number;
  health?: 'healthy' | 'unhealthy' | 'unknown';
}

export class DockerManager {
  private storeManager: StoreManager;
  private composeFile: string;

  constructor(storeManager: StoreManager) {
    this.storeManager = storeManager;
    this.composeFile = path.join(process.cwd(), 'compose.dev.yaml');
  }

  async isDockerInstalled(): Promise<boolean> {
    return new Promise((resolve) => {
      const proc = spawn('docker', ['--version'], { shell: true });
      proc.on('close', (code) => resolve(code === 0));
      proc.on('error', () => resolve(false));
    });
  }

  async isDockerRunning(): Promise<boolean> {
    return new Promise((resolve) => {
      const proc = spawn('docker', ['info'], { shell: true });
      proc.on('close', (code) => resolve(code === 0));
      proc.on('error', () => resolve(false));
    });
  }

  async getStatus(): Promise<DockerService[]> {
    const services: DockerService[] = [
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

  private async getContainerStatus(serviceName: string): Promise<{
    status: DockerService['status'];
    containerId?: string;
    health?: DockerService['health'];
  }> {
    return new Promise((resolve) => {
      const proc = spawn('docker', ['ps', '-a', '--filter', `name=${serviceName}`, '--format', '{{.ID}}|{{.Status}}'], {
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
        } else if (status.includes('Exited')) {
          resolve({ status: 'stopped', containerId, health: 'unhealthy' });
        } else {
          resolve({ status: 'error', containerId, health: 'unknown' });
        }
      });
      proc.on('error', () => resolve({ status: 'error', health: 'unknown' }));
    });
  }

  async startInfrastructure(): Promise<{ success: boolean; error?: string }> {
    try {
      const isInstalled = await this.isDockerInstalled();
      if (!isInstalled) {
        return { success: false, error: 'Docker is not installed. Please install Docker Desktop.' };
      }

      const isRunning = await this.isDockerRunning();
      if (!isRunning) {
        return { success: false, error: 'Docker Desktop is not running. Please start Docker Desktop.' };
      }

      const proc = spawn('docker-compose', ['-f', this.composeFile, 'up', '-d'], {
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  }

  async stopInfrastructure(): Promise<{ success: boolean; error?: string }> {
    try {
      const proc = spawn('docker-compose', ['-f', this.composeFile, 'down'], {
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }

  }

  async resetDatabases(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.stopInfrastructure();
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await this.startInfrastructure();
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  }
}