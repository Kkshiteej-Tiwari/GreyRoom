/**
 * ============================================================================
 * GREYROOM APP ROOT - _app.jsx
 * ============================================================================
 * 
 * PURPOSE:
 * This is the root component that wraps all pages in the GreyRoom application.
 * It provides global configuration, styling, and context providers.
 * 
 * RESPONSIBILITIES:
 * - Imports global CSS styles
 * - Wraps app with SocketProvider for WebSocket connectivity
 * - Sets up page metadata (title, description, favicon)
 * - Ensures consistent layout across all pages
 * 
 * PROVIDERS:
 * - SocketProvider: Manages the singleton Socket.io connection
 *   All child components can use `useSocket()` to access the socket
 * 
 * META TAGS:
 * - Title: "Greyroom | Controlled Anonymity"
 * - Description: Used for SEO and social sharing
 * - Viewport: Responsive design configuration
 * 
 * ============================================================================
 */

import 'styles/globals.css';                          // Global Tailwind CSS styles
import { SocketProvider } from 'context/SocketContext'; // WebSocket context provider
import Head from 'next/head';                          // Next.js head component for meta
import { appConfig } from 'config/config';             // App configuration

/**
 * Root Application Component
 * 
 * This component is rendered for every page in the app.
 * The Component prop is the active page component.
 * The pageProps are the initial props preloaded for that page.
 * 
 * @param {Object} props
 * @param {React.Component} props.Component - The active page component
 * @param {Object} props.pageProps - Props for the page component
 */
function GreyroomApp({ Component, pageProps }) {
  return (
    // SocketProvider wraps entire app - socket persists across page navigations
    <SocketProvider>
      {/* Head component injects tags into <head> element */}
      <Head>
        {/* Page title shown in browser tab */}
        <title>{`${appConfig.name} | ${appConfig.tagline}`}</title>
        
        {/* Viewport configuration for responsive design */}
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        
        {/* Meta description for SEO */}
        <meta name="description" content={appConfig.description} />
        
        {/* Favicon */}
        <link rel="icon" href="/logo.jpeg" />
      </Head>
      
      {/* Render the current page */}
      <Component {...pageProps} />
    </SocketProvider>
  );
}

export default GreyroomApp;
