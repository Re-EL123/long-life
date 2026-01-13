import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const SettingsScreen: React.FC = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  return (
    <ScrollView style={styles.container}>
      {/* Header with solid purple background */}
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => router.back()}>
                  <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
        <Text style={styles.title}>Profile Settings</Text>
        <Image
          source={require("../assets/images/logo3.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Settings List */}
      <View style={styles.section}>
        <SettingItem label="Change password" />
        <SettingItem label="Edit profile" />
        <SettingItem label="Add new account" />
        <ToggleItem
          label="Allow notifications"
          value={notificationsEnabled}
          onToggle={() => setNotificationsEnabled(!notificationsEnabled)}
        />
        <ToggleItem
          label="Dark mode"
          value={darkModeEnabled}
          onToggle={() => setDarkModeEnabled(!darkModeEnabled)}
        />
        <SettingItem label="Privacy" />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerItem}>About</Text>
        <Text style={styles.footerItem}>Privacy Policy</Text>
        <Text style={styles.footerItem}>More</Text>
      </View>
    </ScrollView>
  );
};

// Regular setting item
const SettingItem = ({ label }: { label: string }) => (
  <TouchableOpacity style={styles.item}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.arrow}>›</Text>
  </TouchableOpacity>
);

// Toggle setting item
const ToggleItem = ({
  label,
  value,
  onToggle,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
}) => (
  <View style={styles.item}>
    <Text style={styles.label}>{label}</Text>
    <Switch value={value} onValueChange={onToggle} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
  arrow: {
    fontSize: 20,
    color: '#aaa',
  },
  footer: {
    backgroundColor: '#f2f2f2',
    padding: 20,
    marginTop: 30,
    borderRadius: 10,
  },
  footerItem: {
    fontSize: 16,
    paddingVertical: 8,
    color: '#555',
  },
  appBar: {
    height: 120,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingTop: 40, // for status bar
    backgroundColor: "#5A0FC8", // ✅ Solid purple background
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
});

export default SettingsScreen;
