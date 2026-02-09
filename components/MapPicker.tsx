import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, ActivityIndicator, TouchableOpacity } from 'react-native';
import { geocodeAddress, reverseGeocode } from '../services/geocodingService';

interface MapPickerProps {
  onLocationSelected: (location: {
    latitude: number;
    longitude: number;
    address: string;
    town: string;
  }) => void;
  initialLocation?: { latitude: number; longitude: number };
  searchAddress?: string;
}

const MapPicker: React.FC<MapPickerProps> = ({
  onLocationSelected,
  initialLocation,
  searchAddress
}) => {
  const [MapComponent, setMapComponent] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(initialLocation || {
    latitude: -26.1883,
    longitude: 28.3108
  });
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      import('./LeafletMap').then((module) => {
        setMapComponent(() => module.default);
      });
    }
  }, []);

  useEffect(() => {
    if (searchAddress) {
      handleGeocodeAddress(searchAddress);
    }
  }, [searchAddress]);

  const handleGeocodeAddress = async (addressQuery: string) => {
    setLoading(true);
    try {
      const result = await geocodeAddress(addressQuery);
      if (result) {
        const location = {
          latitude: result.latitude,
          longitude: result.longitude
        };
        setSelectedLocation(location);
        setAddress(result.displayName);
        
        const town = result.address.address.city || 
                     result.address.address.town || 
                     result.address.address.village;
        
        onLocationSelected({
          ...location,
          address: result.displayName,
          town
        });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = async (latitude: number, longitude: number) => {
    setSelectedLocation({ latitude, longitude });
    setLoading(true);
    
    try {
      const result = await reverseGeocode(latitude, longitude);
      if (result) {
        setAddress(result.displayName);
        onLocationSelected({
          latitude,
          longitude,
          address: result.displayName,
          town: result.city || ''
        });
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (Platform.OS !== 'web' || !MapComponent) {
    return (
      <View style={styles.container}>
        <Text>Map only available on web</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      )}
      
      {address && (
        <View style={styles.addressBox}>
          <Text style={styles.addressText}>{address}</Text>
        </View>
      )}

      <MapComponent
        center={[selectedLocation.latitude, selectedLocation.longitude]}
        zoom={13}
        onMapClick={handleMapClick}
        selectedLocation={selectedLocation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative'
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  addressBox: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  addressText: {
    fontSize: 14,
    color: '#333'
  }
});

export default MapPicker;
