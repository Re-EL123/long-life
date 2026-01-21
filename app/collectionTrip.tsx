import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const stops = [
  { time: '15:30', address: '12 Sam Street, Sandton', label: 'S1' },
  { time: '15:35', address: '854 Kim Street, Sandton', label: 'S2' },
  { time: '15:40', address: '65 Lik Street, Sandton', label: 'S3' },
  { time: '15:45', address: '951 Yim Street, Sandton', label: 'S4' },
  { time: '15:55', address: '45 Joul Street, Sandton', label: 'S5' },
];

const CollectionTripScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* ✅ Solid Purple Header */}
      <View style={styles.appBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Collection trip</Text>
        <Image
          source={require('../assets/images/logo3.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Route setup</Text>
        <Text style={styles.stopCount}>Tap to add more stops</Text>
        <Text style={styles.totalStops}>{stops.length} stops</Text>
      </View>

      {/* Route Details */}
      <View style={styles.routeDetails}>
        <View style={styles.routeRow}>
          <Text style={styles.routeTime}>15:30</Text>
          <Text style={styles.routeDesc}>Start from current location</Text>
        </View>
        <View style={styles.routeRow}>
          <Text style={styles.routeTime}>17:30</Text>
          <Text style={styles.routeDesc}>Finish at 25 Mark Street, Sandton</Text>
        </View>
      </View>

      {/* Stop Cards */}
      <Text style={styles.stopsTitle}>Stops</Text>
      {stops.map((stop, index) => (
        <View key={index} style={styles.stopCard}>
          <View style={styles.stopLeft}>
            <Text style={styles.stopNumber}>
              {String(index + 1).padStart(2, '0')}
            </Text>
            <Text style={styles.stopTime}>{stop.time}</Text>
          </View>
          <View style={styles.stopMiddle}>
            <Text style={styles.stopAddress}>{stop.address}</Text>
          </View>
          <View style={styles.stopRight}>
            <Text style={styles.stopLabel}>{stop.label}</Text>
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.addStopBtn}>
        <Ionicons name="add-circle-outline" size={20} color="#5A0FC8" />
        <Text style={styles.addStopText}>Add more stops</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CollectionTripScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f3f3f3',
    paddingBottom: 30,
  },
  appBar: {
    height: 120,
    backgroundColor: '#5A0FC8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 40,
  },
  backBtn: {
    padding: 6,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logo: {
    width: 60,
    height: 40,
  },
  summaryCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  stopCount: {
    color: '#777',
    marginTop: 4,
  },
  totalStops: {
    marginTop: 8,
    fontWeight: '600',
  },
  routeDetails: {
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    elevation: 2,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  routeTime: {
    fontWeight: 'bold',
    width: 60,
  },
  routeDesc: {
    flex: 1,
    color: '#555',
  },
  stopsTitle: {
    marginLeft: 16,
    marginTop: 20,
    fontWeight: 'bold',
    fontSize: 16,
  },
  stopCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    elevation: 2,
    alignItems: 'center',
  },
  stopLeft: {
    width: 60,
    alignItems: 'center',
  },
  stopNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  stopTime: {
    fontSize: 12,
    color: '#666',
  },
  stopMiddle: {
    flex: 1,
    paddingHorizontal: 8,
  },
  stopAddress: {
    fontSize: 14,
  },
  stopRight: {
    width: 30,
    alignItems: 'center',
  },
  stopLabel: {
    backgroundColor: '#5A0FC8',
    color: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: '600',
  },
  addStopBtn: {
    marginTop: 20,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addStopText: {
    marginLeft: 8,
    color: '#5A0FC8',
    fontWeight: '600',
  },
});
