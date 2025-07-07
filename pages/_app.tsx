import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Layout from '../components/Layout';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

const noAuthRequired = ['/login', '/register'];

export default function MyApp({ Component, pageProps, router }: AppProps) {
  return (
    <AuthProvider>
      <Layout>
        {noAuthRequired.includes(router.pathname) ? (
          <Component {...pageProps} />
        ) : (
          <ProtectedRoute>
            <Component {...pageProps} />
          </ProtectedRoute>
        )}
      </Layout>
    </AuthProvider>
  );
}