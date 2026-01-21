import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const DropOffTripScreen = () => {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.root}>
      {/* Header */}
      <LinearGradient colors={['#5A0FC8', '#5A0FC8']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Drop off trip</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      {/* Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Create route</Text>

        <TextInput style={styles.input} placeholder="Starting point" />

        <View style={styles.inputRow}>
          <TextInput style={styles.inputHalf} placeholder="Start time" />
          <Ionicons name="time-outline" size={20} color="#5A0FC8" />
        </View>

        <TextInput style={styles.input} placeholder="End point" />

        <View style={styles.inputRow}>
          <TextInput style={styles.inputHalf} placeholder="End time" />
          <Ionicons name="time-outline" size={20} color="#5A0FC8" />
        </View>

        <TouchableOpacity style={styles.stopLink}>
          <Ionicons name="location-outline" size={18} color="#5A0FC8" />
          <Text style={styles.stopText}>1st Stop</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.addStopRow}>
          <Ionicons name="add-circle-outline" size={18} color="#5A0FC8" />
          <Text style={styles.addStopText}>Add Stop</Text>
        </TouchableOpacity>

        {/* Bottom Buttons */}
        <View style={styles.bottomButtons}>
          <TouchableOpacity style={styles.mapButton}>
            <Ionicons name="map-outline" size={16} color="#fff" />
            <Text style={styles.mapButtonText}>Map</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.addStopButton}>
            <Ionicons name="add-circle-outline" size={16} color="#fff" />
            <Text style={styles.mapButtonText}>Add Stops</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default DropOffTripScreen;

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    backgroundColor: '#f3f3f3',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    justifyContent: 'space-between',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#f1f1f1',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  inputHalf: {
    flex: 1,
    paddingVertical: 10,
  },
  stopLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  stopText: {
    marginLeft: 6,
    color: '#5A0FC8',
    fontWeight: '600',
  },
  addStopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 10,
  },
  addStopText: {
    marginLeft: 6,
    color: '#5A0FC8',
    fontWeight: '600',
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5A0FC8',
    padding: 10,
    borderRadius: 8,
    flex: 0.45,
    justifyContent: 'center',
  },
  addStopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5A0FC8',
    padding: 10,
    borderRadius: 8,
    flex: 0.45,
    justifyContent: 'center',
  },
  mapButtonText: {
    marginLeft: 6,
    color: '#fff',
    fontWeight: '600',
  },
});


