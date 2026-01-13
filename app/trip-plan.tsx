import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const DropOffTripScreen = () => {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.root}>
      {/* Header with zero border radius */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trip plan</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.card}>
        {/* Buttons stacked vertically */}
        <View style={styles.buttonsColumn}>
          <TouchableOpacity style={styles.button} onPress={() => router.push("/collectionTripRoute")}>
            <Ionicons name="navigate-outline" size={20} color="#000" />
            <Text style={styles.buttonText}>Collection Trip</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => {}}>
            <Ionicons name="navigate-outline" size={20} color="#000" />
            <Text style={styles.buttonText}>Drop-off Trip</Text>
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
    backgroundColor: '#e6dcf0',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    justifyContent: 'space-between',
    backgroundColor: '#5A0FC8',
    borderBottomLeftRadius: 0, // zero radius
    borderBottomRightRadius: 0, // zero radius
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
  },
  buttonsColumn: {
    flexDirection: 'column',
  },
  button: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 0, // remove shadows
    shadowOpacity: 0, // remove shadow
  },
  buttonText: {
    color: '#000',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
  },
});
