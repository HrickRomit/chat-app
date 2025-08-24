import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

export function useSocket() {
  const { user } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (user) {
      // Connect to Socket.io server
      socketRef.current = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000', {
        withCredentials: true,
        transports: ['websocket', 'polling']
      });

      const socket = socketRef.current;

      // Join user's personal room
      socket.emit('join_user_room', user.id);

      // Connection event listeners
      socket.on('connect', () => {
        console.log('Connected to server:', socket.id);
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from server');
      });

      // Cleanup on unmount
      return () => {
        if (socket) {
          socket.disconnect();
        }
      };
    }
  }, [user]);

  const joinChat = useCallback((chatId) => {
    if (socketRef.current) {
      socketRef.current.emit('join_chat', chatId);
    }
  }, []);

  const leaveChat = useCallback((chatId) => {
    if (socketRef.current) {
      socketRef.current.emit('leave_chat', chatId);
    }
  }, []);

  const onNewMessage = useCallback((callback) => {
    if (socketRef.current) {
      socketRef.current.on('new_message', callback);
    }
  }, []);

  const offNewMessage = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.off('new_message');
    }
  }, []);

  return {
    socket: socketRef.current,
    joinChat,
    leaveChat,
    onNewMessage,
    offNewMessage
  };
}
