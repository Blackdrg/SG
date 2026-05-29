import React, { createContext, useContext } from 'react';
import { useNetworkStatus } from '../hooks/useOfflineQueue';

const NetworkStatusContext = createContext({
   isOnline: true,
   lastOnline: null as Date | null,
});

export const NetworkStatusProvider = ({ children }: { children: React.ReactNode }) => {
  const { isOnline, lastOnline } = useNetworkStatus();

  return (
    <NetworkStatusContext.Provider value={{ isOnline, lastOnline }}>
      {children}
    </NetworkStatusContext.Provider>
  );
};

export const useNetworkStatusContext = () => {
  const context = useContext(NetworkStatusContext);
  if (!context) {
    throw new Error('useNetworkStatusContext must be used within NetworkStatusProvider');
  }
  return context;
};