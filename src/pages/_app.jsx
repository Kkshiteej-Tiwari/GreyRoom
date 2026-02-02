import 'styles/globals.css';
import { SocketProvider } from 'context/SocketContext';
import Head from 'next/head';
import { appConfig } from 'config/config';

function GreyroomApp({ Component, pageProps }) {
  return (
    <SocketProvider>
      <Head>
        <title>{`${appConfig.name} | ${appConfig.tagline}`}</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta name="description" content={appConfig.description} />
        <link rel="icon" href="/logo.jpeg" />
      </Head>
      <Component {...pageProps} />
    </SocketProvider>
  );
}

export default GreyroomApp;
