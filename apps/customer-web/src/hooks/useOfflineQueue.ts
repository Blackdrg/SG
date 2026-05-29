/// <reference lib="dom" />
import { useState, useCallback, useEffect } from 'react';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [lastOnline, setLastOnline] = useState<Date | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastOnline(new Date());
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, lastOnline };
};

interface QueuedRequest<T> {
  id: string;
  endpoint: string;
  options: any;
  resolve: (_value: T | PromiseLike<T>) => void;
  reject: (_reason?: any) => void;
}

export const useOfflineQueue = () => {
  const { isOnline } = useNetworkStatus();
  const [queue, setQueue] = useState<QueuedRequest<any>[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

   // Add a request to the queue
   const enqueueRequest = useCallback(<T>(
     endpoint: string,
     options: any = {}
   ): Promise<T> => {
     return new Promise<T>((resolve, reject) => {
       const id = Math.random().toString(36).substr(2, 9);
       const queuedRequest: QueuedRequest<T> = {
         id,
         endpoint,
         options,
         resolve,
         reject
       };
       
       setQueue(prev => [...prev, queuedRequest]);
       
       // Try to process the queue immediately if we're online
       if (isOnline && !isProcessing) {
         processQueue();
       }
     });
   }, [isOnline, isProcessing]);

  // Process the queue
  const processQueue = useCallback(async () => {
    if (isProcessing || !isOnline || queue.length === 0) {
      return;
    }

    setIsProcessing(true);
    
    try {
      // Process all queued requests
      const requestsToProcess = [...queue];
      setQueue([]);
      
      for (const request of requestsToProcess) {
        try {
          // In a real implementation, we would make the actual API call here
          // For now, we'll simulate it with a resolved promise
          // This would be replaced with actual API calls using the shared API
          const result = await simulateApiCall(request.endpoint, request.options);
          request.resolve(result);
        } catch (error) {
          // If a request fails, we could retry it or give up
          // For simplicity, we'll reject it
          request.reject(error);
        }
      }
    } finally {
      setIsProcessing(false);
      
      // If there are still items in the queue (added during processing), process them
      if (!isOnline && queue.length > 0) {
        // We're still offline, so we'll keep them queued
      } else if (isOnline && queue.length > 0) {
        // We're online and there are new items, process them
        processQueue();
      }
    }
  }, [isOnline, queue.length]);

    // Simulate API call - replace with actual API calls in real implementation
    const simulateApiCall = useCallback(async (
      endpoint: string,
      options: any = {}
    ) => {
      // In a real implementation, options would contain method, headers, body, etc.
      // For simulation, we'll just acknowledge we received it
      const optionsReceived = typeof options === 'object' && options !== null;
      
      // Simulate network delay - slightly longer if options were provided (more complex request)
      const baseDelay = optionsReceived ? 600 : 400;
      await new Promise(resolve => setTimeout(resolve, baseDelay));
      
      // Simulate occasional network errors for demonstration
      if (Math.random() < 0.1) {
        throw new Error('Network error');
      }
      
      // Return mock data based on endpoint
      if (endpoint.includes('/restaurants')) {
        return [
          { id: 'rest1', name: 'Demo Restaurant', rating: 4.5 },
          { id: 'rest2', name: 'Another Restaurant', rating: 4.0 }
        ];
      }
      
      if (endpoint.includes('/orders')) {
        return [
          { id: 'order1', amount: 250, status: 'delivered' },
          { id: 'order2', amount: 120, status: 'preparing' }
        ];
      }
      
      return { message: 'Success' };
    }, []);

  // Retry failed requests
  const retryFailedRequests = useCallback(() => {
    // In a more sophisticated implementation, we would track failed requests
    // and retry them with exponential backoff
    processQueue();
  }, [processQueue]);

  return {
    enqueueRequest,
    isOnline,
    queueLength: queue.length,
    retryFailedRequests
  };
};