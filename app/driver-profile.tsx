import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { router } from "expo-router";

const UserProfileScreen = () => {
  return (
    <View style={styles.container}>
      {/* Header with solid purple */}
      <View style={styles.appBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>User Profile</Text>
        <Image
          source={require("../assets/images/logo3.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Icon */}
        <View style={styles.profileIcon}>
          <Ionicons name="person-circle-outline" size={80} color="#777" />
        </View>

        {/* User Information */}
        <Text style={styles.label}>Full Name: <Text style={styles.value}>Dannis Mokoena</Text></Text>
        <Text style={styles.label}>User Role: <Text style={styles.value}>Driver</Text></Text>
        <Text style={styles.label}>Email: <Text style={styles.value}>dannis@gmail.com</Text></Text>
        <Text style={styles.label}>Phone Number: <Text style={styles.value}>072345678</Text></Text>
        <Text style={styles.label}>Location: <Text style={styles.value}>24 Rainbow Str</Text></Text>

        <TouchableOpacity style={styles.row}>
          <Text style={styles.label}>Number of vehicles: <Text style={styles.value}>2</Text></Text>
          <Ionicons name="chevron-forward" size={20} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => router.push('/driver-EditProfile')}>
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 20,
  },
  profileIcon: {
    alignItems: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginVertical: 8,
    fontWeight: "500",
  },
  value: {
    fontWeight: "400",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 12,
  },
  appBar: {
    height: 120,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingTop: 40,
    backgroundColor: "#5A0FC8", // Solid purple header
  },
  backBtn: {
    padding: 6,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  logo: {
    width: 60,
    height: 40,
  },
  button: {
    marginTop: 30,
    backgroundColor: '#5A0FC8',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#fff',
  },
});

export default UserProfileScreen;
