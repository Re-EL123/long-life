import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

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
            router.push("/LoginPage");
            Alert.alert("You have logged out", "You have successfully logged out.");
          },
        },
      ]
    );
  };

  return (
    <View style={styles.background}>
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

          <MenuItem icon="person-circle-outline" title="Profile Management" route="/profile-management" />
          <MenuItem icon="lock-closed-outline" title="Reset Password" route="/resetPassord" />
          <MenuItem icon="notifications-outline" title="Notifications" route="/driver-notifactions" />
          <MenuItem icon="headset-outline" title="Support" route="/driver-support" />
          <MenuItem icon="card-outline" title="Bank Details" route="/BankDetailsScreen" />
        </View>

        {/* More Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>More...</Text>

          <MenuItem icon="help-circle-outline" title="Help" route="/help" />
          <MenuItem icon="star-outline" title="Reviews & Ratings" route="/reviewpage" />
          <MenuItem icon="information-circle-outline" title="About" route="/about_us" />
          <MenuItem icon="document-text-outline" title="Privacy & Policy" route="/privacy" />
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color="#000" />
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
  background: {
    flex: 1,
    backgroundColor: "#5A0FC8", // Solid purple background
  },
  appBar: {
    height: 120,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingTop: 40, // for status bar
    backgroundColor: "#5A0FC8", // Solid purple AppBar
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
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    elevation: 3,
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 8,
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
    fontSize: 15,
    color: "#333",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    elevation: 3,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "bold",
    marginLeft: 6,
  },
});

export default SettingsScreen;
