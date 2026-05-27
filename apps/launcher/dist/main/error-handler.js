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
exports.ErrorHandler = void 0;
const electron_1 = require("electron");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class ErrorHandler {
    errors = [];
    logsDir;
    constructor() {
        this.logsDir = path.join(electron_1.app.getPath('userData'), 'launcher-logs');
        if (!fs.existsSync(this.logsDir)) {
            fs.mkdirSync(this.logsDir, { recursive: true });
        }
    }
    detectPortConflict(port) {
        return {
            code: 'PORT_CONFLICT',
            message: `Port ${port} is already in use`,
            severity: 'error',
            resolution: `Close the application using port ${port} or change the port configuration`
        };
    }
    detectDockerMissing() {
        return {
            code: 'DOCKER_MISSING',
            message: 'Docker Desktop is not installed',
            severity: 'fatal',
            resolution: 'Download and install Docker Desktop from https://desktop.docker.com/windows/main/amd64/Docker%20Desktop%20Installer.exe'
        };
    }
    detectDockerNotRunning() {
        return {
            code: 'DOCKER_NOT_RUNNING',
            message: 'Docker Desktop is not running',
            severity: 'error',
            resolution: 'Start Docker Desktop and wait for it to be ready before launching SpiceGarden'
        };
    }
    detectMissingDependency(name) {
        return {
            code: 'MISSING_DEPENDENCY',
            message: `Missing required dependency: ${name}`,
            severity: 'error',
            resolution: `Run 'npm install' in the root directory or '${name}' directory`
        };
    }
    detectDBConnectionError(db) {
        return {
            code: 'DB_CONNECTION_ERROR',
            message: `Cannot connect to ${db}`,
            severity: 'error',
            resolution: 'Ensure Docker infrastructure is running with docker-compose up -d'
        };
    }
    detectAPIStartupFailure(service) {
        return {
            code: 'API_STARTUP_FAILURE',
            message: `${service} failed to start`,
            severity: 'error',
            resolution: `Check ${service} logs in launcher-logs/ directory for details`
        };
    }
    logError(error) {
        this.errors.push(error);
        this.writeLog(error);
    }
    writeLog(error) {
        const logPath = path.join(this.logsDir, 'errors.log');
        const logEntry = `[${new Date().toISOString()}] [${error.severity.toUpperCase()}] ${error.code}: ${error.message}\n`;
        fs.appendFileSync(logPath, logEntry);
    }
    showError(error) {
        this.logError(error);
        electron_1.dialog.showMessageBox({
            type: error.severity === 'fatal' ? 'error' : 'warning',
            title: 'SpiceGarden Launcher Error',
            message: error.message,
            detail: error.resolution,
            buttons: ['OK']
        });
    }
    getErrors() {
        return this.errors;
    }
    clearErrors() {
        this.errors = [];
    }
}
exports.ErrorHandler = ErrorHandler;
//# sourceMappingURL=error-handler.js.map