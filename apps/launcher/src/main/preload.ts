import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  checkPrerequisites: () => ipcRenderer.invoke('check-prerequisites'),
  startAll: () => ipcRenderer.invoke('start-all'),
  stopAll: () => ipcRenderer.invoke('stop-all'),
  restartServices: () => ipcRenderer.invoke('restart-services'),
  getServiceStatus: () => ipcRenderer.invoke('get-service-status'),
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  getDockerStatus: () => ipcRenderer.invoke('get-docker-status'),
  openUrl: (url: string) => ipcRenderer.invoke('open-url', url),
  generateEnv: () => ipcRenderer.invoke('generate-env'),
  resetDatabase: () => ipcRenderer.invoke('reset-database'),
  checkPorts: () => ipcRenderer.invoke('check-ports'),
  getLogs: (service: string) => ipcRenderer.invoke('get-logs', service),
  onServiceStatusUpdate: (callback: (status: any) => void) => {
    ipcRenderer.on('service-status-update', (_, status) => callback(status));
  }
});