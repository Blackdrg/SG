import { dialog, app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

export interface LauncherError {
  code: string;
  message: string;
  severity: 'warning' | 'error' | 'fatal';
  resolution?: string;
}

export class ErrorHandler {
  private errors: LauncherError[] = [];
  private logsDir: string;

  constructor() {
    this.logsDir = path.join(app.getPath('userData'), 'launcher-logs');
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  detectPortConflict(port: number): LauncherError | null {
    return {
      code: 'PORT_CONFLICT',
      message: `Port ${port} is already in use`,
      severity: 'error',
      resolution: `Close the application using port ${port} or change the port configuration`
    };
  }

  detectDockerMissing(): LauncherError {
    return {
      code: 'DOCKER_MISSING',
      message: 'Docker Desktop is not installed',
      severity: 'fatal',
      resolution: 'Download and install Docker Desktop from https://desktop.docker.com/windows/main/amd64/Docker%20Desktop%20Installer.exe'
    };
  }

  detectDockerNotRunning(): LauncherError {
    return {
      code: 'DOCKER_NOT_RUNNING',
      message: 'Docker Desktop is not running',
      severity: 'error',
      resolution: 'Start Docker Desktop and wait for it to be ready before launching SpiceGarden'
    };
  }

  detectMissingDependency(name: string): LauncherError {
    return {
      code: 'MISSING_DEPENDENCY',
      message: `Missing required dependency: ${name}`,
      severity: 'error',
      resolution: `Run 'npm install' in the root directory or '${name}' directory`
    };
  }

  detectDBConnectionError(db: string): LauncherError {
    return {
      code: 'DB_CONNECTION_ERROR',
      message: `Cannot connect to ${db}`,
      severity: 'error',
      resolution: 'Ensure Docker infrastructure is running with docker-compose up -d'
    };
  }

  detectAPIStartupFailure(service: string): LauncherError {
    return {
      code: 'API_STARTUP_FAILURE',
      message: `${service} failed to start`,
      severity: 'error',
      resolution: `Check ${service} logs in launcher-logs/ directory for details`
    };
  }

  logError(error: LauncherError): void {
    this.errors.push(error);
    this.writeLog(error);
  }

  private writeLog(error: LauncherError): void {
    const logPath = path.join(this.logsDir, 'errors.log');
    const logEntry = `[${new Date().toISOString()}] [${error.severity.toUpperCase()}] ${error.code}: ${error.message}\n`;
    fs.appendFileSync(logPath, logEntry);
  }

  showError(error: LauncherError): void {
    this.logError(error);
    
    dialog.showMessageBox({
      type: error.severity === 'fatal' ? 'error' : 'warning',
      title: 'SpiceGarden Launcher Error',
      message: error.message,
      detail: error.resolution,
      buttons: ['OK']
    });
  }

  getErrors(): LauncherError[] {
    return this.errors;
  }

  clearErrors(): void {
    this.errors = [];
  }
}