import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

export default function ActivityLogScreen() {
  const router = useRouter(); // use router instead of navigation

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#5A0FC8", "#5A0FC8"]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Activity Log</Text>
          <Image
            source={require('@/assets/images/logo2.png')} // update path if needed
            style={styles.logo}
          />
        </View>
      </LinearGradient>

      {/* Body */}
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.sectionTitle}>Yesterday</Text>

        <View style={styles.card}>
          <Text style={styles.cardText}><Text style={styles.bold}>Alicias Child</Text></Text>
          <Text style={styles.cardText}>Picked Up by: Mr. Mokoena</Text>
          <Text style={styles.cardText}>From: 11913 Khanya Street, Katlehong</Text>
          <Text style={styles.cardText}>To: Curro School, Centurion</Text>
          <Text style={styles.cardText}>Time: 07:15 AM</Text>
          <Text style={styles.cardText}>Status: Picked Up</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardText}><Text style={styles.bold}>Mikes Child</Text></Text>
          <Text style={styles.cardText}>Dropped Off by: Mr. Mokoena</Text>
          <Text style={styles.cardText}>From: 909 Thokoza Street, Palmride</Text>
          <Text style={styles.cardText}>To: Tomhill High School</Text>
          <Text style={styles.cardText}>Time: 14:30 PM</Text>
          <Text style={styles.cardText}>Status: Picked Up</Text>
        </View>

        <Text style={styles.sectionTitle}>Today</Text>

        <View style={styles.card}>
          <Text style={styles.cardText}><Text style={styles.bold}>Gilys Child</Text></Text>
          <Text style={styles.cardText}>Pickup Missed by: Mr. Mokoena</Text>
          <Text style={styles.cardText}>Location: 909 Avenue, Parktown</Text>
          <Text style={styles.cardText}>Time: 07:00 AM</Text>
          <Text style={styles.cardText}>Status: Missed Pickup</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3EFFF' },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  logo: {
    width: 70,
    height: 50,
    resizeMode: 'contain',
  },
  body: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#333',
  },
  card: {
    backgroundColor: '#E0DBED',
    borderRadius: 20,
    padding: 16,
    marginBottom: 15,
  },
  cardText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 4,
  },
  bold: {
    fontWeight: 'bold',
  },
});
