import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { SOCKET_URL } from '../config/api';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const socketRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    
    // Small delay to ensure window.location is fully initialized on mobile
    const initTimer = setTimeout(() => {
      const token = localStorage.getItem('token');
      
      const newSocket = io(SOCKET_URL, {
        auth: { token },
        reconnection: true,
        reconnectionDelay: 5000,
        reconnectionAttempts: 5,
        timeout: 10000,
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        setConnected(true);
        setConnectionError(null);
      });

      newSocket.on('disconnect', (reason) => {
        setConnected(false);
        if (reason === 'io server disconnect') {
          // Server disconnected, try to reconnect
          newSocket.connect();
        }
      });

      newSocket.on('connect_error', (error) => {
        setConnected(false);
        setConnectionError('Connection issue. Retrying...');
      });

      newSocket.on('reconnect_failed', () => {
        setConnectionError('Unable to connect. Please refresh the page.');
      });

      newSocket.on('reconnect', () => {
        setConnected(true);
        setConnectionError(null);
      });

      socketRef.current = newSocket;
      setSocket(newSocket);
    }, 100);

    return () => {
      clearTimeout(initTimer);
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [user]);

  const value = {
    socket,
    connected,
    connectionError
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};