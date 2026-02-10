import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  updateLocation: (latitude: number, longitude: number, address: string) => void;
  findDrivers: (town: string, latitude: number, longitude: number) => void;
  driversFound: any[];
  requestDriver: (driverId: string, pickupLocation: any, dropoffLocation: any, tripDetails: any) => void;
  joinUserRoom: (userId: string) => void;
  joinTripRoom: (tripId: string) => void;
  leaveTripRoom: (tripId: string) => void;
  sendDriverLocationUpdate: (tripId: string, latitude: number, longitude: number, speed?: number, heading?: number) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
  updateLocation: () => {},
  findDrivers: () => {},
  driversFound: [],
  requestDriver: () => {},
  joinUserRoom: () => {},
  joinTripRoom: () => {},
  leaveTripRoom: () => {},
  sendDriverLocationUpdate: () => {}
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [driversFound, setDriversFound] = useState<any[]>([]);

  useEffect(() => {
    const initSocket = async () => {
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        console.log('[SOCKET] No token found, skipping connection');
        return;
      }

      const socketInstance = io('https://safe-school-ride.duckdns.org', {
        auth: { token },
        transports: ['polling', 'websocket'], // Try polling first, then upgrade to websocket
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        forceNew: true,
      });

      // Connection events
      socketInstance.on('connect', () => {
        console.log('✅ [SOCKET] Connected to server:', socketInstance.id);
        setConnected(true);
      });

      socketInstance.on('disconnect', (reason) => {
        console.log('🔌 [SOCKET] Disconnected from server. Reason:', reason);
        setConnected(false);
      });

      socketInstance.on('connect_error', (error) => {
        console.error('❌ [SOCKET] Connection Error:', error.message);
        setConnected(false);
      });

      socketInstance.on('error', (error) => {
        console.error('❌ [SOCKET] Socket Error:', error);
      });

      socketInstance.on('reconnect', (attemptNumber) => {
        console.log(`🔄 [SOCKET] Reconnected after ${attemptNumber} attempts`);
      });

      socketInstance.on('reconnect_attempt', (attemptNumber) => {
        console.log(`🔄 [SOCKET] Reconnection attempt ${attemptNumber}`);
      });

      socketInstance.on('reconnect_error', (error) => {
        console.error('❌ [SOCKET] Reconnection Error:', error.message);
      });

      socketInstance.on('reconnect_failed', () => {
        console.error('❌ [SOCKET] Reconnection failed after all attempts');
      });

      // Room join confirmations
      socketInstance.on('room_joined', (data) => {
        console.log('🚪 [SOCKET] Room joined:', data);
      });

      socketInstance.on('trip_joined', (data) => {
        console.log('🚗 [SOCKET] Trip room joined:', data);
      });

      // Driver search events
      socketInstance.on('driversFound', (drivers) => {
        console.log('📍 [SOCKET] Drivers found:', drivers);
        setDriversFound(drivers);
      });

      // Trip lifecycle events
      socketInstance.on('tripRequest', (data) => {
        console.log('📢 [SOCKET] Trip request received:', data);
        // Handle trip request notification
      });

      socketInstance.on('trip_accepted', (data) => {
        console.log('✅ [SOCKET] Trip accepted:', data);
        // Show notification that driver accepted
        // Navigate to trip tracking screen
      });

      socketInstance.on('trip_declined', (data) => {
        console.log('❌ [SOCKET] Trip declined:', data);
        // Show notification that driver declined
        // Optionally search for another driver
      });

      socketInstance.on('trip_started', (data) => {
        console.log('🚀 [SOCKET] Trip started:', data);
        // Update UI to show trip in progress
        // Start tracking driver location
      });

      socketInstance.on('trip_completed', (data) => {
        console.log('🏁 [SOCKET] Trip completed:', data);
        // Navigate to trip summary/payment screen
      });

      socketInstance.on('trip_cancelled', (data) => {
        console.log('🚫 [SOCKET] Trip cancelled:', data);
        // Show cancellation notification
        // Navigate back to home screen
      });

      // Real-time location tracking
      socketInstance.on('location_update', (data) => {
        console.log('📍 [SOCKET] Location update:', data);
        // Update driver marker position on map
        // Update ETA and distance
      });

      socketInstance.on('driverLocationUpdate', (data) => {
        console.log('📍 [SOCKET] Driver location update:', data);
        // Update driver location on map (legacy event)
      });

      // Driver notifications (for driver users)
      socketInstance.on('new_trip_request', (data) => {
        console.log('📢 [SOCKET] New trip request:', data);
        // Show incoming trip request notification
        // Play notification sound
      });

      // Chat/messaging events
      socketInstance.on('receive_message', (data) => {
        console.log('💬 [SOCKET] Message received:', data);
        // Display message in chat
      });

      // Emergency alerts
      socketInstance.on('emergency_alert', (data) => {
        console.log('🚨 [SOCKET] EMERGENCY ALERT:', data);
        // Show emergency alert
        // Trigger emergency protocols
      });

      // Heartbeat/ping
      socketInstance.on('pong', (data) => {
        console.log('🏓 [SOCKET] Pong received:', data);
      });

      setSocket(socketInstance);

      return () => {
        console.log('🔌 [SOCKET] Cleaning up socket connection');
        socketInstance.disconnect();
      };
    };

    initSocket();
  }, []);

  const updateLocation = useCallback((latitude: number, longitude: number, address: string) => {
    if (socket && connected) {
      socket.emit('updateLocation', { latitude, longitude, address });
      console.log('📤 [SOCKET] Location updated:', { latitude, longitude, address });
    } else {
      console.warn('⚠️ [SOCKET] Cannot update location: socket not connected');
    }
  }, [socket, connected]);

  const findDrivers = useCallback((town: string, latitude: number, longitude: number) => {
    if (socket && connected) {
      socket.emit('findDrivers', { town, latitude, longitude });
      console.log('📤 [SOCKET] Finding drivers in:', town);
    } else {
      console.warn('⚠️ [SOCKET] Cannot find drivers: socket not connected');
    }
  }, [socket, connected]);

  const requestDriver = useCallback((
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
      console.log('📤 [SOCKET] Driver request sent to:', driverId);
    } else {
      console.warn('⚠️ [SOCKET] Cannot request driver: socket not connected');
    }
  }, [socket, connected]);

  const joinUserRoom = useCallback((userId: string) => {
    if (socket && connected) {
      socket.emit('join_user_room', userId);
      console.log('📤 [SOCKET] Joining user room:', userId);
    } else {
      console.warn('⚠️ [SOCKET] Cannot join user room: socket not connected');
    }
  }, [socket, connected]);

  const joinTripRoom = useCallback((tripId: string) => {
    if (socket && connected) {
      socket.emit('join_trip', tripId);
      console.log('📤 [SOCKET] Joining trip room:', tripId);
    } else {
      console.warn('⚠️ [SOCKET] Cannot join trip room: socket not connected');
    }
  }, [socket, connected]);

  const leaveTripRoom = useCallback((tripId: string) => {
    if (socket && connected) {
      socket.emit('leave_trip', tripId);
      console.log('📤 [SOCKET] Leaving trip room:', tripId);
    } else {
      console.warn('⚠️ [SOCKET] Cannot leave trip room: socket not connected');
    }
  }, [socket, connected]);

  const sendDriverLocationUpdate = useCallback((
    tripId: string,
    latitude: number,
    longitude: number,
    speed?: number,
    heading?: number
  ) => {
    if (socket && connected) {
      socket.emit('driver_location_update', {
        tripId,
        latitude,
        longitude,
        speed,
        heading
      });
      console.log('📤 [SOCKET] Driver location update sent for trip:', tripId);
    } else {
      console.warn('⚠️ [SOCKET] Cannot send location update: socket not connected');
    }
  }, [socket, connected]);

  // Send periodic ping to keep connection alive
  useEffect(() => {
    if (!socket || !connected) return;

    const pingInterval = setInterval(() => {
      socket.emit('ping');
    }, 30000); // Ping every 30 seconds

    return () => clearInterval(pingInterval);
  }, [socket, connected]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        updateLocation,
        findDrivers,
        driversFound,
        requestDriver,
        joinUserRoom,
        joinTripRoom,
        leaveTripRoom,
        sendDriverLocationUpdate
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};