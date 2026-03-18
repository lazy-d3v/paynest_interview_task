import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000/auction';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('🔌 Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('🔌 Socket disconnected');
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  const joinAuction = useCallback((auctionId: string) => {
    socketRef.current?.emit('joinAuction', auctionId);
  }, []);

  const leaveAuction = useCallback((auctionId: string) => {
    socketRef.current?.emit('leaveAuction', auctionId);
  }, []);

  const onNewBid = useCallback(
    (callback: (data: any) => void) => {
      socketRef.current?.on('newBid', callback);
      return () => {
        socketRef.current?.off('newBid', callback);
      };
    },
    [],
  );

  const onAuctionEnded = useCallback(
    (callback: (data: any) => void) => {
      socketRef.current?.on('auctionEnded', callback);
      return () => {
        socketRef.current?.off('auctionEnded', callback);
      };
    },
    [],
  );

  const onAuctionCreated = useCallback(
    (callback: (data: any) => void) => {
      socketRef.current?.on('auctionCreated', callback);
      return () => {
        socketRef.current?.off('auctionCreated', callback);
      };
    },
    [],
  );

  return {
    socket: socketRef.current,
    isConnected,
    joinAuction,
    leaveAuction,
    onNewBid,
    onAuctionEnded,
    onAuctionCreated,
  };
}
