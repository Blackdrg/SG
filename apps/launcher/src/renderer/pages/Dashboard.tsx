import React from 'react';
import { ServiceStatusCard } from '../components/ServiceStatusCard';
import { useQuery } from '@tanstack/react-query';

export const Dashboard: React.FC = () => {
  const { data: serviceStatus, refetch } = useQuery({
    queryKey: ['service-status'],
    queryFn: () => (window as any).electronAPI.getServiceStatus()
  });

  const { data: systemInfo } = useQuery({
    queryKey: ['system-info'],
    queryFn: () => (window as any).electronAPI.getSystemInfo()
  });

  const { data: dockerStatus } = useQuery({
    queryKey: ['docker-status'],
    queryFn: () => (window as any).electronAPI.getDockerStatus()
  });

  React.useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000);
    return () => clearInterval(interval);
  }, [refetch]);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>SpiceGarden Launcher</h1>
        <p>Enterprise Launcher for Food Delivery Platform</p>
      </header>

      <section className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button onClick={() => (window as any).electronAPI.startAll()}>Start All</button>
          <button onClick={() => (window as any).electronAPI.stopAll()}>Stop All</button>
          <button onClick={() => (window as any).electronAPI.restartServices()}>Restart</button>
          <button onClick={() => (window as any).electronAPI.openUrl('http://localhost:3001')}>
            Open Customer App
          </button>
          <button onClick={() => (window as any).electronAPI.openUrl('http://localhost:3002')}>
            Open Restaurant Dashboard
          </button>
          <button onClick={() => (window as any).electronAPI.openUrl('http://localhost:3003')}>
            Open Admin Dashboard
          </button>
          <button onClick={() => (window as any).electronAPI.resetDatabase()}>Reset Database</button>
          <button onClick={() => (window as any).electronAPI.openUrl('file://' + process.cwd() + '/launcher-logs')}>
            Open Logs
          </button>
        </div>
      </section>

      <section className="services-section">
        <h2>Services Status</h2>
        <div className="services-grid">
          {serviceStatus?.map((service: any) => (
            <ServiceStatusCard key={service.name} {...service} />
          ))}
        </div>
      </section>

      <section className="system-monitor">
        <h2>System Monitor</h2>
        <div className="monitor-grid">
          <div className="monitor-card">
            <h3>CPU Usage</h3>
            <p>{systemInfo?.cpu?.usage ? `${systemInfo.cpu.usage.toFixed(1)}%` : 'N/A'}</p>
          </div>
          <div className="monitor-card">
            <h3>RAM Usage</h3>
            <p>{systemInfo?.memory?.usagePercent ? `${systemInfo.memory.usagePercent}%` : 'N/A'}</p>
          </div>
          <div className="monitor-card">
            <h3>Platform</h3>
            <p>{systemInfo?.os?.platform || 'N/A'}</p>
          </div>
        </div>
      </section>
    </div>
  );
};