/**
 * ============================================================================
 * SOCKET CONTEXT - SocketContext.js
 * ============================================================================
 * 
 * PURPOSE:
 * This module provides a React Context for managing WebSocket connections
 * throughout the application. It implements a singleton pattern to ensure
 * only one socket connection exists, even across page navigations.
 * 
 * KEY FEATURES:
 * - Singleton socket instance (persists across page navigations)
 * - Automatic reconnection with exponential backoff
 * - React Context for easy access from any component
 * - Connection state management (isConnected)
 * 
 * ARCHITECTURE:
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  App                                                           │
 * │  └── SocketProvider (wraps entire app)                         │
 * │       └── Creates/manages singleton socket                     │
 * │            └── Any component can useSocket()                   │
 * └─────────────────────────────────────────────────────────────────┘
 * 
 * USAGE:
 * import { useSocket } from 'context/SocketContext';
 * const { socket, isConnected } = useSocket();
 * 
 * ============================================================================
 */

import { useContext, createContext, useState, useEffect, useRef } from 'react';
import { io } from "socket.io-client";

// Create the React Context with null as default
// The actual value is provided by SocketProvider
const SocketContext = createContext(null);

/**
 * Custom hook to access the socket context.
 * 
 * This hook provides easy access to:
 * - socket: The Socket.io client instance
 * - isConnected: Boolean indicating connection status
 * 
 * @returns {Object} { socket, isConnected }
 * @throws {Error} If used outside of SocketProvider
 */
export const useSocket = () => {
  const context = useContext(SocketContext);
  
  // Ensure hook is used within provider
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  
  return context;
};

// ============================================================================
// SINGLETON SOCKET MANAGEMENT
// ============================================================================
// These module-level variables maintain the socket across component lifecycles
// and page navigations in Next.js

let globalSocket = null;        // The single socket instance
let socketInitializing = false;  // Prevents multiple simultaneous init attempts

/**
 * Gets the existing connected socket if available.
 * 
 * @returns {Socket|null} The connected socket or null
 */
const getSocket = () => {
  if (globalSocket && globalSocket.connected) {
    return globalSocket;
  }
  return null;
};

/**
 * Initializes the Socket.io connection.
 * 
 * This function implements several important patterns:
 * 
 * 1. SINGLETON: Returns existing socket if already connected
 * 2. DEBOUNCE: Prevents multiple simultaneous initialization attempts
 * 3. AUTO-RECONNECT: Configures socket for automatic reconnection
 * 
 * SOCKET.IO CONFIGURATION:
 * - reconnection: true (automatically reconnect on disconnect)
 * - reconnectionAttempts: Infinity (never give up)
 * - reconnectionDelay: 1000ms initial, 5000ms max (exponential backoff)
 * - timeout: 20000ms (connection timeout)
 * - transports: ['websocket', 'polling'] (try WebSocket first, fallback to polling)
 * 
 * @param {Function} onConnect - Callback when socket connects
 * @param {Function} onDisconnect - Callback when socket disconnects
 * @returns {Promise<Socket>} The socket instance
 */
const initializeSocket = async (onConnect, onDisconnect) => {
  // Return existing socket if already connected (singleton pattern)
  if (globalSocket && globalSocket.connected) {
    onConnect(globalSocket);
    return globalSocket;
  }

  // Prevent multiple simultaneous initialization attempts
  // This can happen when multiple components mount at once
  if (socketInitializing) {
    // Wait for existing initialization to complete
    return new Promise((resolve) => {
      const checkSocket = setInterval(() => {
        if (globalSocket && globalSocket.connected) {
          clearInterval(checkSocket);
          onConnect(globalSocket);
          resolve(globalSocket);
        }
      }, 100); // Check every 100ms
    });
  }

  // Mark as initializing to prevent duplicate attempts
  socketInitializing = true;

  try {
    // Initialize the Socket.io API endpoint
    // This ensures the server-side socket handler is ready
    await fetch("/api/socket");
  } catch (e) {
    // Non-fatal error - socket may still work
    console.log('Socket API init error:', e);
  }

  // Create new Socket.io client connection
  globalSocket = io({
    // RECONNECTION SETTINGS
    reconnection: true,              // Enable auto-reconnection
    reconnectionAttempts: Infinity,  // Never stop trying
    reconnectionDelay: 1000,         // Start with 1 second delay
    reconnectionDelayMax: 5000,      // Max 5 seconds between attempts
    
    // CONNECTION SETTINGS
    timeout: 20000,                  // 20 second connection timeout
    
    // TRANSPORT SETTINGS
    // Try WebSocket first (faster, bidirectional)
    // Fall back to polling if WebSocket unavailable
    transports: ['websocket', 'polling'],
  });

  // Handle successful connection
  globalSocket.on('connect', () => {
    console.log('Socket connected:', globalSocket.id);
    socketInitializing = false;
    onConnect(globalSocket);
  });

  // Handle disconnection
  globalSocket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
    onDisconnect();
  });

  // Handle connection errors
  globalSocket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
    socketInitializing = false;
  });

  return globalSocket;
};

// ============================================================================
// SOCKET PROVIDER COMPONENT
// ============================================================================

/**
 * SocketProvider Component
 * 
 * Wraps the application to provide socket context to all child components.
 * Should be placed near the root of the component tree (typically in _app.jsx).
 * 
 * IMPORTANT: The socket is NOT disconnected when this provider unmounts.
 * This is intentional - it keeps the socket alive across page navigations
 * in Next.js, preventing unnecessary reconnections.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
export const SocketProvider = ({ children }) => {
  // Connection state - initialized from existing socket if available
  const [isConnected, setIsConnected] = useState(() => !!getSocket());
  const [socket, setSocket] = useState(() => getSocket());
  
  // Track if component is mounted to prevent state updates after unmount
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    // Callback for when socket connects
    const onConnect = (sock) => {
      if (mounted.current) {
        setSocket(sock);
        setIsConnected(true);
      }
    };

    // Callback for when socket disconnects
    const onDisconnect = () => {
      if (mounted.current) {
        setIsConnected(false);
      }
    };

    // Check if we already have a connected socket
    const existingSocket = getSocket();
    if (existingSocket) {
      // Reuse existing connection
      setSocket(existingSocket);
      setIsConnected(true);
    } else {
      // Initialize new connection
      initializeSocket(onConnect, onDisconnect);
    }

    // Cleanup on unmount
    return () => {
      mounted.current = false;
      // IMPORTANT: Don't disconnect on unmount!
      // Keep socket alive across Next.js page navigations
    };
  }, []);

  // Context value provided to all consumers
  const contextValue = {
    socket,         // The Socket.io client instance
    isConnected,    // Boolean connection status
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
