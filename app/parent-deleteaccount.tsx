import React, { useState } from 'react';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';

const reasons = [
  "i’m no longer using service",
  "The app is too complicated to use",
  "I'm switching to a different transport service",
  "No longer needed",
  "Other",
];

const DeleteAccount = () => {
  const router = useRouter();
  const [selectedReason, setSelectedReason] = useState<number | null>(null);

  const handleDelete = () => {
    if (selectedReason === null) {
      Alert.alert("Please select a reason before continuing.");
      return;
    }

    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to permanently delete your account?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Yes, Delete", style: "destructive", onPress: () => {
            router.push("/login-parent");
            Alert.alert("Account Deleted", "Your account has been deleted.");
        }},
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* App Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>Delete Account</Text>
        <Image
          source={require("../assets/images/logo3.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Delete account</Text>
        <Text style={styles.subtitle}>
          Your data will be permanently deleted and cannot be recovered.
        </Text>

        {reasons.map((reason, index) => (
          <Pressable
            key={index}
            style={styles.option}
            onPress={() => setSelectedReason(index)}
          >
            <MaterialCommunityIcons
              name={selectedReason === index ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"}
              size={20}
              color="gray"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.optionText}>{reason}</Text>
          </Pressable>
        ))}

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Delete account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DeleteAccount;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // white background
  },
  appBar: {
    height: 120,
    backgroundColor: '#5A0FC8', // solid purple
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 40,
  },
  backBtn: {
    padding: 6,
  },
  appBarTitle: {
    fontFamily: 'Montserrat',
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  logo: {
    width: 60,
    height: 40,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontFamily: 'Montserrat',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000',
  },
  subtitle: {
    fontFamily: 'Montserrat',
    fontSize: 14,
    color: '#555',
    marginBottom: 24,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  optionText: {
    fontFamily: 'Montserrat',
    fontSize: 16,
    color: '#333',
  },
  deleteButton: {
    marginTop: 30,
    backgroundColor: '#5A0FC8', // solid purple
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontFamily: 'Montserrat',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
