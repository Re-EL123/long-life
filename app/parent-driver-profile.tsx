import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";

const UserProfileScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* App Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>User Profile</Text>
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
      </ScrollView>
    </View>
  );
};

export default UserProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  appBar: {
    height: 120,
    backgroundColor: '#5A0FC8', // updated solid purple
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingTop: 40,
  },
  backBtn: {
    padding: 6,
  },
  appBarTitle: {
    fontFamily: 'Montserrat',
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  logo: {
    width: 60,
    height: 40,
  },
  content: {
    padding: 20,
  },
  profileIcon: {
    alignItems: "center",
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Montserrat',
    fontSize: 16,
    marginVertical: 8,
    fontWeight: "500",
  },
  value: {
    fontFamily: 'Montserrat',
    fontWeight: "400",
  },
  button: {
    marginTop: 30,
    backgroundColor: '#5A0FC8', // updated solid purple
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Montserrat',
    fontWeight: 'bold',
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
});
