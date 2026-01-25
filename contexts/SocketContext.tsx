import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  updateLocation: (latitude: number, longitude: number, address: string) => void;
  findDrivers: (town: string, latitude: number, longitude: number) => void;
  driversFound: any[];
  requestDriver: (driverId: string, pickupLocation: any, dropoffLocation: any, tripDetails: any) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
  updateLocation: () => {},
  findDrivers: () => {},
  driversFound: [],
  requestDriver: () => {}
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [driversFound, setDriversFound] = useState<any[]>([]);

  useEffect(() => {
    const initSocket = async () => {
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) return;

      const socketInstance = io('YOUR_SERVER_URL', {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      socketInstance.on('connect', () => {
        console.log('[SOCKET] Connected to server');
        setConnected(true);
      });

      socketInstance.on('disconnect', () => {
        console.log('[SOCKET] Disconnected from server');
        setConnected(false);
      });

      socketInstance.on('driversFound', (drivers) => {
        console.log('[SOCKET] Drivers found:', drivers);
        setDriversFound(drivers);
      });

      socketInstance.on('tripRequest', (data) => {
        console.log('[SOCKET] Trip request received:', data);
        // Handle trip request notification
      });

      socketInstance.on('driverLocationUpdate', (data) => {
        console.log('[SOCKET] Driver location update:', data);
        // Update driver location on map
      });

      socketInstance.on('tripCompleted', (data) => {
        console.log('[SOCKET] Trip completed:', data);
        // Navigate to trip summary
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    };

    initSocket();
  }, []);

  const updateLocation = (latitude: number, longitude: number, address: string) => {
    if (socket && connected) {
      socket.emit('updateLocation', { latitude, longitude, address });
    }
  };

  const findDrivers = (town: string, latitude: number, longitude: number) => {
    if (socket && connected) {
      socket.emit('findDrivers', { town, latitude, longitude });
    }
  };

  const requestDriver = (
    driverId: string,
    pickupLocation: any,
    dropoffLocation: any,
    tripDetails: any
  ) => {
    if (socket && connected) {
      socket.emit('requestDriver', {
        driverId,
        pickupLocation,
        dropoffLocation,
        tripDetails
      });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        updateLocation,
        findDrivers,
        driversFound,
        requestDriver
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
