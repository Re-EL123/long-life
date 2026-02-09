import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type Vehicle = {
  id: string;
  name: string;
  type: 'car' | 'bus';
};

const vehicleData: Vehicle[] = [
  { id: '1', name: 'Toyota', type: 'car' },
  { id: '2', name: 'VW', type: 'car' },
  { id: '3', name: 'Siyaya', type: 'bus' },
];

const VehicleScreen: React.FC = () => {
  const renderVehicle = ({ item }: { item: Vehicle }) => (
    <View style={styles.vehicleContainer}>
      <View style={{ flex: 1 }}>
        <Text style={styles.vehicleName}>{item.name}</Text>
      </View>
      <View style={styles.vehicleIcon}>
        {item.type === 'car' ? (
          <Ionicons name="car-sport" size={28} color="#703e98" />
        ) : (
          <Ionicons name="bus" size={28} color="#703e98" />
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      {/* Header */}
      <LinearGradient
        colors={['#5A0FC8', '#5A0FC8']}
        style={styles.headerBackground}
      >
        <View style={styles.header}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.headerTitle}>Vehicle List</Text>
          {/* Empty view to balance flex and keep title centered */}
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      {/* Vehicle List */}
      <FlatList
        data={vehicleData}
        keyExtractor={(item) => item.id}
        renderItem={renderVehicle}
        contentContainerStyle={styles.list}
      />

      {/* Only Add Vehicle button */}
      <View style={styles.buttonContainer}>
        <LinearGradient colors={['#5A0FC8', '#5A0FC8']} style={styles.button}>
          <TouchableOpacity>
            <Text style={styles.buttonText}>Add Vehicle</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </View>
  );
};

export default VehicleScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerBackground: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // keeps arrow left, title center
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  vehicleContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  vehicleName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  vehicleIcon: {
    alignItems: 'center',
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
});
