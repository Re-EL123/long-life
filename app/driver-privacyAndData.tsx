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

const alerts = [
  {
    title: 'Pick-up',
    time: '10m ago',
    message: 'Your child was picked up at 06:39...',
  },
  {
    title: 'Delays',
    time: '6m ago',
    message: 'There are delays on the road because of roadworks and tra...',
  },
  {
    title: 'Arrive in...',
    time: '2m ago',
    message: 'Your child will arrive to school in 2 minutes...',
  },
  {
    title: 'Arrived',
    time: 'Just now',
    message: `Name: Mike\nSurname: Sim\nAge: 7 years\nSchool: Eden Primary School\nAssigned Bus: Peters School bus\nPick up Point: 23 tip Street Arlbeton Johannesburg\nDrop off Point: Eden Primary School\nEmergency Contact: 075 258 1155 Martha (Mother)\n\nYour child arrived at school drop off point, Have a great day!!!`,
  },
];

const AlertsScreen = () => {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.root}>
      {/* Solid Purple Header */}
      <LinearGradient colors={['#5A0FC8', '#5A0FC8']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 24 }} /> {/* Placeholder to center title */}
      </LinearGradient>

      {/* Alerts List */}
      <View style={styles.card}>
        {alerts.map((alert, index) => (
          <View key={index} style={styles.alertContainer}>
            <View style={styles.alertHeader}>
              <Text style={styles.alertTitle}>{alert.title}</Text>
              <Text style={styles.alertTime}>{alert.time}</Text>
            </View>
            <Text style={styles.alertMessage}>{alert.message}</Text>
          </View>
        ))}
      </View>

      {/* Clear All Button */}
      <TouchableOpacity style={styles.clearButton}>
        <Text style={styles.clearButtonText}>Clear all</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AlertsScreen;

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    backgroundColor: '#e6dcf0',
    paddingBottom: 40,
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
    margin: 20,
  },
  alertContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  alertTime: {
    fontSize: 12,
    color: '#888',
  },
  alertMessage: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  clearButton: {
    backgroundColor: '#5A0FC8',
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 10,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
