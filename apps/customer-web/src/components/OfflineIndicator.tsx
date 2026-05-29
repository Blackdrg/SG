import React from 'react';
import { Button } from '@spicegarden/ui';
import { useNetworkStatusContext } from '../contexts/NetworkStatusContext';

const OfflineIndicator = () => {
  const { isOnline, lastOnline } = useNetworkStatusContext();

  if (isOnline) {
    return null;
  }

  const timeOffline = lastOnline ? 
    Math.floor((new Date().getTime() - lastOnline.getTime()) / 1000) : 0;

  const minutes = Math.floor(timeOffline / 60);
  const seconds = timeOffline % 60;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: 40,
      backgroundColor: '#ffebee',
      color: '#c62828',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ fontSize: 16 }}>📵</div>
        <div>
          <p style={{ margin: 0, fontSize: 14 }}>You're offline</p>
          <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>
            Last seen: {minutes}m {seconds}s ago
          </p>
        </div>
        <Button 
          label="Retry" 
          onClick={() => window.location.reload()} 
          variant="outline"
          style={{ marginLeft: 16 }}
        />
      </div>
    </div>
  );
};

export default OfflineIndicator;