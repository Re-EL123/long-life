import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert
} from 'react-native';
import MapPicker from '../../components/MapPicker';
import { useSocket } from '../../contexts/SocketContext';
import { useNavigation } from '@react-navigation/native';

const FindDriver: React.FC = () => {
  const navigation = useNavigation();
  const { findDrivers, driversFound, requestDriver } = useSocket();
  
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [pickupLocation, setPickupLocation] = useState<any>(null);
  const [dropoffLocation, setDropoffLocation] = useState<any>(null);
  const [showPickupMap, setShowPickupMap] = useState(false);
  const [showDropoffMap, setShowDropoffMap] = useState(false);
  const [searchingDrivers, setSearchingDrivers] = useState(false);

  const handleFindDrivers = () => {
    if (!pickupLocation) {
      Alert.alert('Error', 'Please select a pickup location');
      return;
    }

    setSearchingDrivers(true);
    findDrivers(pickupLocation.town, pickupLocation.latitude, pickupLocation.longitude);
  };

  const handleSelectDriver = (driver: any) => {
    Alert.alert(
      'Confirm Driver',
      `Request ride from ${driver.name} ${driver.surname}?\n\nVehicle: ${driver.carBrand} ${driver.carModel}\nReg: ${driver.registrationNumber}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            requestDriver(
              driver.driverId,
              pickupLocation,
              dropoffLocation,
              {
                pickupAddress: pickupLocation.address,
                dropoffAddress: dropoffLocation?.address || 'To be confirmed'
              }
            );
            
            // Navigate to trip session screen
            navigation.navigate('OnceoffTripSession', {
              driverId: driver.driverId,
              driver,
              pickupLocation,
              dropoffLocation
            });
          }
        }
      ]
    );
  };

  const renderDriverItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.driverCard}
      onPress={() => handleSelectDriver(item)}
    >
      <View style={styles.driverInfo}>
        <Text style={styles.driverName}>{item.name} {item.surname}</Text>
        <Text style={styles.driverDetail}>
          <Text style={styles.label}>Registration:</Text> {item.registrationNumber}
        </Text>
        <Text style={styles.driverDetail}>
          <Text style={styles.label}>Vehicle:</Text> {item.carBrand} {item.carModel}
        </Text>
        <Text style={styles.driverDetail}>
          <Text style={styles.label}>Seats Available:</Text> {item.seats}
        </Text>
        <Text style={styles.driverDetail}>
          <Text style={styles.label}>Location:</Text> {item.address}
        </Text>
      </View>
      <TouchableOpacity style={styles.selectButton}>
        <Text style={styles.selectButtonText}>Select Driver</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Find a Driver</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Pickup Location</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Enter address or click map"
            value={pickupAddress}
            onChangeText={setPickupAddress}
          />
          <TouchableOpacity
            style={styles.mapButton}
            onPress={() => setShowPickupMap(!showPickupMap)}
          >
            <Text style={styles.mapButtonText}>📍</Text>
          </TouchableOpacity>
        </View>
        
        {showPickupMap && (
          <View style={styles.mapContainer}>
            <MapPicker
              searchAddress={pickupAddress}
              onLocationSelected={(location) => {
                setPickupLocation(location);
                setPickupAddress(location.address);
                setShowPickupMap(false);
              }}
            />
          </View>
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Dropoff Location (Optional)</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Enter address or click map"
            value={dropoffAddress}
            onChangeText={setDropoffAddress}
          />
          <TouchableOpacity
            style={styles.mapButton}
            onPress={() => setShowDropoffMap(!showDropoffMap)}
          >
            <Text style={styles.mapButtonText}>📍</Text>
          </TouchableOpacity>
        </View>
        
        {showDropoffMap && (
          <View style={styles.mapContainer}>
            <MapPicker
              searchAddress={dropoffAddress}
              onLocationSelected={(location) => {
                setDropoffLocation(location);
                setDropoffAddress(location.address);
                setShowDropoffMap(false);
              }}
            />
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.findButton}
        onPress={handleFindDrivers}
      >
        <Text style={styles.findButtonText}>Find Drivers</Text>
      </TouchableOpacity>

      {searchingDrivers && driversFound.length > 0 && (
        <View style={styles.driversContainer}>
          <Text style={styles.driversTitle}>
            Available Drivers ({driversFound.length})
          </Text>
          <FlatList
            data={driversFound}
            keyExtractor={(item) => item.driverId.toString()}
            renderItem={renderDriverItem}
            contentContainerStyle={styles.driversList}
          />
        </View>
      )}

      {searchingDrivers && driversFound.length === 0 && (
        <View style={styles.noDrivers}>
          <Text style={styles.noDriversText}>
            No active drivers found in your area
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333'
  },
  inputContainer: {
    marginBottom: 16
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#555'
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  mapButton: {
    marginLeft: 8,
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8
  },
  mapButtonText: {
    fontSize: 20
  },
  mapContainer: {
    height: 300,
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden'
  },
  findButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8
  },
  findButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  driversContainer: {
    flex: 1,
    marginTop: 20
  },
  driversTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333'
  },
  driversList: {
    paddingBottom: 20
  },
  driverCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  driverInfo: {
    marginBottom: 12
  },
  driverName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  driverDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  selectButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center'
  },
  selectButtonText: {
    color: 'white',
    fontWeight: '600'
  },
  noDrivers: {
    marginTop: 40,
    alignItems: 'center'
  },
  noDriversText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center'
  }
});

export default FindDriver;
