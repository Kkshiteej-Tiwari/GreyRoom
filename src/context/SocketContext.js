import { useContext, createContext, useState, useEffect, useRef } from 'react';
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

// Singleton socket instance - persists across page navigations
let globalSocket = null;
let socketInitializing = false;

const getSocket = () => {
  if (globalSocket && globalSocket.connected) {
    return globalSocket;
  }
  return null;
};

const initializeSocket = async (onConnect, onDisconnect) => {
  // Return existing socket if connected
  if (globalSocket && globalSocket.connected) {
    onConnect(globalSocket);
    return globalSocket;
  }

  // Prevent multiple simultaneous initialization attempts
  if (socketInitializing) {
    // Wait for existing initialization
    return new Promise((resolve) => {
      const checkSocket = setInterval(() => {
        if (globalSocket && globalSocket.connected) {
          clearInterval(checkSocket);
          onConnect(globalSocket);
          resolve(globalSocket);
        }
      }, 100);
    });
  }

  socketInitializing = true;

  try {
    // Initialize the socket API endpoint
    await fetch("/api/socket");
  } catch (e) {
    console.log('Socket API init error:', e);
  }

  // Create new socket connection
  globalSocket = io({
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    transports: ['websocket', 'polling'],
  });

  globalSocket.on('connect', () => {
    console.log('Socket connected:', globalSocket.id);
    socketInitializing = false;
    onConnect(globalSocket);
  });

  globalSocket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
    onDisconnect();
  });

  globalSocket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
    socketInitializing = false;
  });

  return globalSocket;
};

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(() => !!getSocket());
  const [socket, setSocket] = useState(() => getSocket());
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    const onConnect = (sock) => {
      if (mounted.current) {
        setSocket(sock);
        setIsConnected(true);
      }
    };

    const onDisconnect = () => {
      if (mounted.current) {
        setIsConnected(false);
      }
    };

    // Check if already connected
    const existingSocket = getSocket();
    if (existingSocket) {
      setSocket(existingSocket);
      setIsConnected(true);
    } else {
      initializeSocket(onConnect, onDisconnect);
    }

    return () => {
      mounted.current = false;
      // Don't disconnect on unmount - keep socket alive across navigations
    };
  }, []);

  const contextValue = {
    socket,
    isConnected,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
