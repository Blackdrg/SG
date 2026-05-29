import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '@spicegarden/shared/constants';

export const useTracking = (driverId: string | null) => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!driverId) return;

    const newSocket = io(SOCKET_URL, {
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
    });

    setError(null);

    const onConnect = () => { setConnected(true); setError(null); };
    const onDisconnect = () => setConnected(false);
    const onConnectError = () => {
      setConnected(false);
      setError('Socket disconnected — tracking may be unavailable');
    };

    newSocket.on('connect', onConnect);
    newSocket.on('disconnect', onDisconnect);
    newSocket.on('connect_error', onConnectError);

    // Listen on the tracking namespace
    newSocket.on(`tracking:${driverId}`, (data: { lat: number; lng: number }) => {
      setLocation(data);
    });

    return () => {
      newSocket.off('connect', onConnect);
      newSocket.off('disconnect', onDisconnect);
      newSocket.off('connect_error', onConnectError);
      newSocket.off(`tracking:${driverId}`);
      newSocket.disconnect();
    };
  }, [driverId]);

  return { location, connected, error };
};
