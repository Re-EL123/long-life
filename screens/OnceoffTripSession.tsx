import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform
} from 'react-native';
import { useSocket } from '../contexts/SocketContext';
import { useRoute, useNavigation } from '@react-navigation/native';

const OnceoffTripSession: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { socket } = useSocket();
  const { driver, pickupLocation, dropoffLocation, tripId } = route.params as any;

  const [tripStatus, setTripStatus] = useState<'waiting' | 'active' | 'completed'>('waiting');
  const [driverLocation, setDriverLocation] = useState<any>(null);
  const [MapComponent, setMapComponent] = useState<any>(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      import('../components/LeafletMap').then((module) => {
        setMapComponent(() => module.default);
      });
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.emit('startTrip', tripId);

    socket.on('driverLocationUpdate', (data) => {
      setDriverLocation(data);
    });

    socket.on('tripCompleted', (data) => {
      setTripStatus('completed');
      Alert.alert(
        'Trip Completed',
        'Your trip has been completed successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('ParentHome')
          }
        ]
      );
    });

    return () => {
      socket.off('driverLocationUpdate');
      socket.off('tripCompleted');
    };
  }, [socket, tripId]);

  const handleStartTrip = () => {
    setTripStatus('active');
    Alert.alert('Trip Started', 'Driver is on the way!');
  };

  const handleCompleteTrip = () => {
    if (socket) {
      socket.emit('completeTrip', tripId);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Trip in Progress</Text>
        <Text style={styles.status}>
          Status: {tripStatus.charAt(0).toUpperCase() + tripStatus.slice(1)}
        </Text>
      </View>

      <View style={styles.driverInfo}>
        <Text style={styles.driverName}>{driver.name} {driver.surname}</Text>
        <Text style={styles.driverDetail}>
          {driver.carBrand} {driver.carModel} • {driver.registrationNumber}
        </Text>
        <Text style={styles.driverDetail}>Seats: {driver.seats}</Text>
      </View>

      {Platform.OS === 'web' && MapComponent && (
        <View style={styles.mapContainer}>
          <MapComponent
            center={[
              driverLocation?.latitude || pickupLocation.latitude,
              driverLocation?.longitude || pickupLocation.longitude
            ]}
            zoom={14}
            onMapClick={() => {}}
            selectedLocation={driverLocation || pickupLocation}
            drivers={driverLocation ? [{ ...driver, ...driverLocation }] : []}
          />
        </View>
      )}

      <View style={styles.locationInfo}>
        <View style={styles.locationItem}>
          <Text style={styles.locationLabel}>Pickup:</Text>
          <Text style={styles.locationText}>{pickupLocation.address}</Text>
        </View>
        
        {dropoffLocation && (
          <View style={styles.locationItem}>
            <Text style={styles.locationLabel}>Dropoff:</Text>
            <Text style={styles.locationText}>{dropoffLocation.address}</Text>
          </View>
        )}
      </View>

      {tripStatus === 'waiting' && (
        <TouchableOpacity style={styles.startButton} onPress={handleStartTrip}>
          <Text style={styles.buttonText}>Start Trip</Text>
        </TouchableOpacity>
      )}

      {tripStatus === 'active' && (
        <TouchableOpacity style={styles.completeButton} onPress={handleCompleteTrip}>
          <Text style={styles.buttonText}>Complete Trip</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    paddingTop: 40
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8
  },
  status: {
    fontSize: 16,
    color: 'white'
  },
  driverInfo: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  driverName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  driverDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  mapContainer: {
    height: 300,
    margin: 16,
    borderRadius: 8,
    overflow: 'hidden'
  },
  locationInfo: {
    padding: 16
  },
  locationItem: {
    marginBottom: 16
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 4
  },
  locationText: {
    fontSize: 16,
    color: '#333'
  },
  startButton: {
    backgroundColor: '#4CAF50',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  completeButton: {
    backgroundColor: '#2196F3',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  }
});

export default OnceoffTripSession;
