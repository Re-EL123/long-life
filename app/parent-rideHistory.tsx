import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const rideHistory = [
  { date: '12-06-2025', name: 'Mike', pickup: '07:30', dropoff: '15:30' },
  { date: '13-06-2025', name: 'Mike', pickup: '07:30', dropoff: '15:30' },
  { date: '14-06-2025', name: 'Mike', pickup: '07:30', dropoff: '15:30' },
  { date: '15-06-2025', name: 'Mike', pickup: '07:30', dropoff: '15:30' },
  { date: '16-06-2025', name: 'Mike', pickup: '07:30', dropoff: '15:30' },
  { date: '19-06-2025', name: 'Mike', pickup: '07:30', dropoff: '15:30' },
];

const DropOffTripScreen = () => {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <LinearGradient colors={['#5A0FC8', '#5a0fc8']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ride History</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <View style={styles.card}>
        {rideHistory.map((ride, index) => (
          <View key={index} style={styles.rideContainer}>
            <Text style={styles.rideText}>📅 Date: {ride.date}</Text>
            <Text style={styles.rideText}>👤 Name: {ride.name}</Text>
            <Text style={styles.rideText}>🕒 Pickup Time: {ride.pickup}</Text>
            <Text style={styles.rideText}>🛑 Drop-off Time: {ride.dropoff}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default DropOffTripScreen;

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    backgroundColor: '#e6dcf0',
    paddingBottom: 20,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    justifyContent: 'space-between',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  card: {
    margin: 20,
    paddingBottom: 10,
  },
  rideContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  rideText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 6,
  },
});
