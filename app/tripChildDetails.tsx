// ChildDetailsScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://temp-weld-rho.vercel.app";

const ChildDetailsScreen = () => {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [schoolAddress, setSchoolAddress] = useState("");
  const [parentContact, setParentContact] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name || !surname || !schoolName || !homeAddress || !parentContact) {
      const msg = "Please fill in all required fields";
      if (Platform.OS === "web") alert(msg);
      else Alert.alert("Missing info", msg);
      return;
    }

    try {
      setLoading(true);
      const token =
        (await AsyncStorage.getItem("userToken")) ||
        (await AsyncStorage.getItem("token"));

      if (!token) {
        const msg = "Please log in first";
        if (Platform.OS === "web") alert(msg);
        else Alert.alert("Error", msg);
        router.replace("/LoginPage");
        return;
      }

      const payload = {
        name,
        surname,
        age: age ? Number(age) : undefined,
        gender,
        schoolName,
        homeAddress,
        schoolAddress,
        parentContact,
      };

      const res = await fetch(`${API_BASE_URL}/api/user/children`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("[ChildDetails] create child response:", data);

      if (!res.ok) {
        const msg = data.message || "Failed to save child details";
        if (Platform.OS === "web") alert(msg);
        else Alert.alert("Error", msg);
        return;
      }

      const msg = data.message || "Child added successfully";
      if (Platform.OS === "web") {
        alert(msg);
      } else {
        Alert.alert("Success", msg);
      }

      router.back(); // RequestDriverScreen will re-fetch children
    } catch (err) {
      console.error("[ChildDetails] Network error:", err);
      const msg = "Network error. Please try again.";
      if (Platform.OS === "web") alert(msg);
      else Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Child</Text>
        <View style={styles.logo}>
          <Text style={styles.logoText}>SAFE</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Basic info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Child Details</Text>

          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color="#7E2EFF" />
            <TextInput
              placeholder="First name"
              placeholderTextColor="#999"
              style={styles.input}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={[styles.inputWrapper, { marginTop: 12 }]}>
            <Ionicons name="person-circle-outline" size={20} color="#7E2EFF" />
            <TextInput
              placeholder="Surname"
              placeholderTextColor="#999"
              style={styles.input}
              value={surname}
              onChangeText={setSurname}
            />
          </View>

          <View style={[styles.inputWrapper, { marginTop: 12 }]}>
            <Ionicons name="calendar-outline" size={20} color="#7E2EFF" />
            <TextInput
              placeholder="Age"
              placeholderTextColor="#999"
              style={styles.input}
              keyboardType="numeric"
              value={age}
              onChangeText={setAge}
            />
          </View>

          <View style={[styles.inputWrapper, { marginTop: 12 }]}>
            <Ionicons name="male-female-outline" size={20} color="#7E2EFF" />
            <TextInput
              placeholder="Gender (e.g. Male / Female)"
              placeholderTextColor="#999"
              style={styles.input}
              value={gender}
              onChangeText={setGender}
            />
          </View>
        </View>

        {/* School / address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>School & Address</Text>

          <View style={styles.inputWrapper}>
            <Ionicons name="school-outline" size={20} color="#7E2EFF" />
            <TextInput
              placeholder="School name"
              placeholderTextColor="#999"
              style={styles.input}
              value={schoolName}
              onChangeText={setSchoolName}
            />
          </View>

          <View style={[styles.inputWrapper, { marginTop: 12 }]}>
            <Ionicons name="home-outline" size={20} color="#7E2EFF" />
            <TextInput
              placeholder="Home address"
              placeholderTextColor="#999"
              style={styles.input}
              value={homeAddress}
              onChangeText={setHomeAddress}
            />
          </View>

          <View style={[styles.inputWrapper, { marginTop: 12 }]}>
            <Ionicons name="location-outline" size={20} color="#7E2EFF" />
            <TextInput
              placeholder="School address (optional)"
              placeholderTextColor="#999"
              style={styles.input}
              value={schoolAddress}
              onChangeText={setSchoolAddress}
            />
          </View>
        </View>

        {/* Emergency contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contact</Text>

          <View style={styles.inputWrapper}>
            <Ionicons name="call-outline" size={20} color="#7E2EFF" />
            <TextInput
              placeholder="Parent / guardian contact number"
              placeholderTextColor="#999"
              style={styles.input}
              keyboardType="phone-pad"
              value={parentContact}
              onChangeText={setParentContact}
            />
          </View>
        </View>

        {/* Save button */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.buttonText}>Save Child</Text>
              <Ionicons
                name="save-outline"
                size={20}
                color="#fff"
                style={{ marginLeft: 8 }}
              />
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ChildDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: "#7E2EFF",
    paddingTop: Platform.OS === "web" ? 20 : 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...Platform.select({
      web: {
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  logo: {
    backgroundColor: "#5B13CC",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logoText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
    letterSpacing: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#1A1A1A",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...Platform.select({
      web: {
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
      },
    }),
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: "#1A1A1A",
    ...Platform.select({
      web: {
        outline: "none",
      } as any,
    }),
  },
  button: {
    backgroundColor: "#7E2EFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "center",
    ...Platform.select({
      web: {
        cursor: "pointer",
        boxShadow: "0 4px 16px rgba(126, 46, 255, 0.3)",
        transition: "all 0.2s",
      },
      default: {
        shadowColor: "#7E2EFF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
      },
    }),
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
