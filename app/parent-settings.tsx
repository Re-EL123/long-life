import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router"; 
import { Alert } from 'react-native';

const SettingsScreen = () => {
  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to Log out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log out", 
          style: "destructive", 
          onPress: () => {
            router.push("/route");
            Alert.alert("You have logged out", "You have successfully logged out.");
          }
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* App Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <Image
          source={require("../assets/images/logo3.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Settings Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Settings</Text>
          <MenuItem icon="person-circle-outline" title="Profile Management" route="/Parentprofilemanagent" />
          <MenuItem icon="lock-closed-outline" title="Reset Password" route="/resetPassord" />
          <MenuItem icon="notifications-outline" title="Notifications" route="/parent-alerts" />
          <MenuItem icon="headset-outline" title="Support" route="/driver-support" />
          <MenuItem icon="card-outline" title="Bank Details" route="/BankDetailsScreen" />
        </View>

        {/* More Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>More...</Text>
          <MenuItem icon="help-circle-outline" title="Help" route="/help" />
          <MenuItem icon="star-outline" title="Reviews & Ratings" route="/parent-reviews" />
          <MenuItem icon="information-circle-outline" title="About" route="/about_us" />
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color="#fff" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

// Reusable Menu Item
const MenuItem = ({ icon, title, route }: { icon: string; title: string; route: string }) => (
  <TouchableOpacity style={styles.menuItem} onPress={() => router.push(route as any)}>
    <Ionicons name={icon as any} size={20} color="#333" style={styles.menuIcon} />
    <Text style={styles.menuText}>{title}</Text>
    <Ionicons name="chevron-forward" size={18} color="#888" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // main background white
  },
  appBar: {
    height: 120,
    backgroundColor: '#5A0FC8', // purple
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingTop: 40,
    borderRadius: 0, // no border radius
  },
  backBtn: {
    padding: 6,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: 'Montserrat',
    textAlign: 'center',
  },
  logo: {
    width: 60,
    height: 40,
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#fff", 
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
  },
  cardTitle: {
    fontFamily: 'Montserrat',
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 12,
    textAlign: 'center',
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontFamily: 'Montserrat',
    fontSize: 14,
    color: "#000",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#5A0FC8",
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    fontFamily: 'Montserrat',
    marginLeft: 6,
    textAlign: 'center',
  },
});

export default SettingsScreen;
