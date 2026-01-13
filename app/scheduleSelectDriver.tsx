import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { 
  Alert, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View 
} from 'react-native';

export default function ScheduleRideScreen() {
  const router = useRouter();
  const [date, setDate] = useState('');
  const [pickUpTime, setPickUpTime] = useState('');
  const [dropOffTime, setDropOffTime] = useState('');
  const [pickUpLocation, setPickUpLocation] = useState('');
  const [dropOffLocation, setDropOffLocation] = useState('');

  const handleSelectDriver = () => {
    Alert.alert(
      'Ride Scheduled',
      `Date: ${date}\nPick-up: ${pickUpTime}\nDrop-off: ${dropOffTime}\nFrom: ${pickUpLocation}\nTo: ${dropOffLocation}`
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedule</Text>
        <View style={{ width: 24 }} /> {/* placeholder for alignment */}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Enter Ride Schedule</Text>

        {/* Driver Info Boxes */}
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Driver Name:</Text>
          <Text style={styles.infoText}>John Doe</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Pick-up Location:</Text>
          <Text style={styles.infoText}>{pickUpLocation || 'Select location'}</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Drop-off Location:</Text>
          <Text style={styles.infoText}>{dropOffLocation || 'Select location'}</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Date:</Text>
          <Text style={styles.infoText}>{date || 'Select date'}</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Pick-up Time:</Text>
          <Text style={styles.infoText}>{pickUpTime || 'Select time'}</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Drop-off Time:</Text>
          <Text style={styles.infoText}>{dropOffTime || 'Select time'}</Text>
        </View>

        {/* Confirm Button */}
        <TouchableOpacity style={styles.button} onPress={handleSelectDriver}>
          <Text style={styles.buttonText}>Select Driver</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#5A0FC8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    color: '#5A0FC8',
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 16,
    color: '#000',
  },
  button: {
    backgroundColor: '#5A0FC8',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
