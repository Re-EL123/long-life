import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function SupportScreen() {
  return (
    <View style={styles.container}>
      {/* Solid Purple Header */}
      <View style={styles.appBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/driver-dashboard')}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Support</Text>
        <Image
          source={require("../assets/images/logo3.png")}
          style={styles.logo2}
          resizeMode="contain"
        />
      </View>

      <View style={styles.body}>
        <Image
          source={require('../assets/images/support.png')} // Replace with your support image
          style={styles.supportImage}
        />
        <Text style={styles.prompt}>Hello, how can we help you?</Text>

        <TouchableOpacity style={styles.optionButton}>
          <Ionicons name="document-text-outline" size={20} color="#5A0FC8" />
          <Text style={styles.optionText}>Log a complaint</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionButton}>
          <MaterialIcons name="email" size={20} color="#5A0FC8" />
          <Text style={styles.optionText}>Send us an email</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionButton}>
          <FontAwesome name="phone" size={20} color="#5A0FC8" />
          <Text style={styles.optionText}>Contact us</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sosButton}>
          <Text style={styles.sosText}>Emergency SOS</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3EFFF' },
  appBar: {
    height: 120,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 40, // for status bar
    backgroundColor: '#5A0FC8', // Solid purple
  },
  backBtn: { padding: 6 },
  title: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  logo2: { width: 60, height: 40 },
  body: {
    padding: 20,
    alignItems: 'center',
  },
  supportImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  prompt: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 25,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#5A0FC8',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 30,
    width: '100%',
    marginBottom: 15,
  },
  optionText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#5A0FC8',
  },
  sosButton: {
    marginTop: 10,
    backgroundColor: '#FF3B30',
    borderRadius: 30,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
  },
  sosText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
