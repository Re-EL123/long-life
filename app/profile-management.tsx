import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const options = [
  { label: 'User Profile Page' },
  { label: 'Account Settings' },
  { label: 'Edit Profile' },
  { label: 'Requested trips' },
  { label: 'Privacy settings' },
  { label: 'Activity Log' },
  { label: 'Delete Profile' },
];

const ProfileManagementScreen = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* App Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => console.log('Back pressed')}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Profile Management</Text>
        <Image
          source={require("../assets/images/logo3.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Body content */}
      <View style={styles.body}>
        {options.map((item, index) => {
          const isLastOdd = options.length % 2 === 1 && index === options.length - 1;

          return (
            <TouchableOpacity
              key={index}
              style={[styles.optionBox, isLastOdd && styles.centeredBox]}
              onPress={() => console.log('Pressed', item.label)}
            >
              <Text style={styles.optionLabel}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default ProfileManagementScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // white background
  },
  appBar: {
    height: 120,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingTop: 40,
    backgroundColor: "#5A0FC8", // solid purple app bar
    borderRadius: 0,
  },
  backBtn: {
    padding: 6,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: 'Montserrat',
  },
  logo: {
    width: 60,
    height: 40,
  },
  body: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  optionBox: {
    width: '48%',
    backgroundColor: '#5A0FC8', // solid purple buttons
    borderRadius: 10,
    paddingVertical: 30,
    paddingHorizontal: 10,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    fontSize: 14,
    fontFamily: 'Montserrat',
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  centeredBox: {
    width: '100%',
    alignSelf: 'center',
  },
});
