import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View, ImageBackground } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ParentDashboard = () => {
  const router = useRouter();
  const [location, setLocation] = useState<any>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

  return (
    <View style={styles.container}>
      {/* App Bar */}
      <View style={styles.appBar}>
        <Text style={styles.title}>Dashboard</Text>
        <TouchableOpacity style={styles.buttonwallet} onPress={() => router.push("/Parent-wallet")}>
          <Text style={styles.WalletText}>Wallet</Text>
          <Ionicons name="wallet" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Profile Image */}
      <Image
        source={require('../assets/images/LANDING PAGE.png')}
        style={styles.profileImage}
      />

      {/* Navigation Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={() => router.push("/parent-children")}>
          <Text style={styles.buttonText}>Children</Text>
          <Ionicons name="people" size={28} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => router.push("/parent-driver-profile")}>
          <Text style={styles.buttonText}>Driver</Text>
          <Ionicons name="person" size={28} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => router.push("/Parent-RequestDriver")}>
          <Text style={styles.buttonText}>Schedule Trip</Text>
          <Ionicons name="calendar" size={28} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => router.push("/parent-rideHistory")}>
          <Text style={styles.buttonText}>History</Text>
          <Ionicons name="time" size={28} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => router.push("/parent-settings")}>
          <Text style={styles.buttonText}>Settings</Text>
          <Ionicons name="cog" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ParentDashboard;

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    paddingTop: 40,
  },
  appBar: {
    height: 120,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    backgroundColor: "#5A0FC8",
    borderRadius: 0,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontFamily: "Montserrat",
    fontWeight: "bold",
    textAlign: "center",
  },
  buttonwallet: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#5A0FC8",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  WalletText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Montserrat",
    marginRight: 8,
  },
  profileImage: {
    width: 180,
    height: 180,
    borderRadius: 10,
    marginTop: 15,
  },
  buttonsContainer: {
    marginTop: 20,
    width: "90%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  button: {
    backgroundColor: "#5A0FC8",
    padding: 15,
    borderRadius: 10,
    margin: 10,
    width: "40%",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    fontFamily: "Montserrat",
    marginBottom: 5,
    textAlign: "center",
  },
});
