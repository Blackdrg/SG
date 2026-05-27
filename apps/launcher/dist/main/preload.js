"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    checkPrerequisites: () => electron_1.ipcRenderer.invoke('check-prerequisites'),
    startAll: () => electron_1.ipcRenderer.invoke('start-all'),
    stopAll: () => electron_1.ipcRenderer.invoke('stop-all'),
    restartServices: () => electron_1.ipcRenderer.invoke('restart-services'),
    getServiceStatus: () => electron_1.ipcRenderer.invoke('get-service-status'),
    getSystemInfo: () => electron_1.ipcRenderer.invoke('get-system-info'),
    getDockerStatus: () => electron_1.ipcRenderer.invoke('get-docker-status'),
    openUrl: (url) => electron_1.ipcRenderer.invoke('open-url', url),
    generateEnv: () => electron_1.ipcRenderer.invoke('generate-env'),
    resetDatabase: () => electron_1.ipcRenderer.invoke('reset-database'),
    checkPorts: () => electron_1.ipcRenderer.invoke('check-ports'),
    getLogs: (service) => electron_1.ipcRenderer.invoke('get-logs', service),
    onServiceStatusUpdate: (callback) => {
        electron_1.ipcRenderer.on('service-status-update', (_, status) => callback(status));
    }
});
//# sourceMappingURL=preload.js.map