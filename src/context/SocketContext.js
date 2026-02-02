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

let globalSocket = null;

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  const initialized = useRef(false);

  useEffect(() => {
    // Use global socket to prevent multiple connections
    if (globalSocket && globalSocket.connected) {
      setSocket(globalSocket);
      setIsConnected(true);
      return;
    }

    if (initialized.current) return;
    initialized.current = true;

    const initSocket = async () => {
      try {
        await fetch("/api/socket");
      } catch (e) {
        console.log('Socket API init error:', e);
      }

      globalSocket = io({
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });

      globalSocket.on('connect', () => {
        console.log('Socket connected:', globalSocket.id);
        setSocket(globalSocket);
        setIsConnected(true);
      });

      globalSocket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setIsConnected(false);
      });

      globalSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
      });
    };

    initSocket();
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
