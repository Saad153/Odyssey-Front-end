import React,{ useEffect, useState } from 'react';
import '../styles/main.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'antd/dist/antd.css';
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
import MainLayout from 'Components/Shared/MainLayout';
import Loader from 'Components/Shared/Loader';
import Router, { useRouter  } from 'next/router';
import { store } from 'redux/store';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '../styles/globals.css';
import '../styles/ageingReport.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { 
    staleTime: 9_900_600_000,
    refetchOnWindowFocus: false,
   }}
})

function MyApp({ Component, pageProps:{ session, ...pageProps }, }) {

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleRouteChangeStart = () => setLoading(true);
    const handleRouteChangeEnd = () => setLoading(false);

    Router.events.on('routeChangeStart', handleRouteChangeStart);
    Router.events.on('routeChangeComplete', handleRouteChangeEnd);
    Router.events.on('routeChangeError', handleRouteChangeEnd);

    return () => {
      Router.events.off('routeChangeStart', handleRouteChangeStart);
      Router.events.off('routeChangeComplete', handleRouteChangeEnd);
      Router.events.off('routeChangeError', handleRouteChangeEnd);
    };
  }, []);

  return (
    <>
      {
      router.pathname!='/login' &&
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <MainLayout>
              { loading && <Loader/> }
              { !loading && <Component {...pageProps} /> }
            </MainLayout>
          </QueryClientProvider>
        </Provider>
      }
      {router.pathname =='/login' && <Component {...pageProps} /> }
    </>
  )
}

export default MyApp;
