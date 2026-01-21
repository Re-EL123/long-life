import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const drivers = [
  {
    name: 'Alicia',
    vehicle: 'Toyota Quantum 14 seater',
    available: 'Available: 4 seats',
    image: require('../assets/images/alicia.jpg'),
  },
  {
    name: 'Mark',
    vehicle: 'Avanza 7 seater',
    available: 'Available: 5 seats',
    image: require('../assets/images/mark.jpg'),
  },
  {
    name: 'Sam',
    vehicle: 'Suzuki 7 seater',
    available: 'Available: 3 seats',
    image: require('../assets/images/sam.jpg'),
  },
  {
    name: 'Maria',
    vehicle: 'Toyota Quantum 14 seater',
    available: 'Available: 9 seats',
    image: require('../assets/images/maria.jpg'),
  },
];

const SelectDriverScreen = () => {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <LinearGradient colors={['#5A0FC8', '#5a0fc8']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Driver</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <View style={styles.card}>
        {drivers.map((driver, index) => (
          <View key={index} style={styles.driverContainer}>
            <Image source={driver.image} style={styles.driverImage} />
            <View style={styles.driverDetails}>
              <Text style={styles.driverName}>{driver.name}</Text>
              <Text style={styles.driverInfo}>{driver.vehicle}</Text>
              <Text style={styles.driverInfo}>{driver.available}</Text>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.confirmButton}>
        <Text style={styles.confirmButtonText}>Confirm</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default SelectDriverScreen;

const screenWidth = Dimensions.get('window').width;
const buttonWidth = screenWidth * 0.9;

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    backgroundColor: '#fff',
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  card: {
    margin: 20,
    marginBottom: 20,
  },
  driverContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  driverImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  driverInfo: {
    fontSize: 15,
    color: '#555',
    marginBottom: 2,
  },
  confirmButton: {
    backgroundColor: '#5A0FC8',
    width: buttonWidth,
    alignSelf: 'center',
    marginTop: 10,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
