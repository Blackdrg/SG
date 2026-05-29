import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from '../redux/store';
import { NetworkStatusProvider } from '../contexts/NetworkStatusContext';
import OfflineIndicator from '../components/OfflineIndicator';

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <NetworkStatusProvider>
          <Component {...pageProps} />
          <OfflineIndicator />
        </NetworkStatusProvider>
      </QueryClientProvider>
    </Provider>
  );
}
