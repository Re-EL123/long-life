import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import SERVER_URL from "../config/config";
import { checkDriverOnboarding, clearOnboardingCache } from "../utils/checkOnboarding";

const API_BASE_URL = "https://temp-weld-rho.vercel.app";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    console.log("LOGIN BUTTON PRESSED");

    // Clear previous errors
    setError("");

    // Validate inputs
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);

    try {
      console.log("Attempting login for:", email);

      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("Server response:", data);

      if (!res.ok) {
        setError(data.message || `Login failed: ${res.status}`);
        return;
      }

      // Verify we have required data
      if (!data.token || !data.user || !data.user.role) {
        setError("Invalid response from server");
        return;
      }

      // ✅ FIXED: Store token with consistent key name for app-wide use
      await AsyncStorage.setItem("userToken", data.token);
      // Also store as "token" for backward compatibility
      await AsyncStorage.setItem("token", data.token);

      // ✅ FIXED: Store all user info correctly
      await AsyncStorage.setItem("role", data.user.role);
      await AsyncStorage.setItem("userId", data.user.id);
      await AsyncStorage.setItem("userName", data.user.name);
      await AsyncStorage.setItem("userEmail", data.user.email);
      
      // ✅ FIXED: Store onboarding status with correct key and value
      const onboardingStatus = data.user.onboardingCompleted || false;
      await AsyncStorage.setItem(
        "onboardingCompleted",
        JSON.stringify(onboardingStatus)
      );

      // Store full user data as JSON for reference
      await AsyncStorage.setItem("userData", JSON.stringify(data.user));

      console.log("Login successful, role:", data.user.role);
      console.log("Onboarding completed:", onboardingStatus);
      console.log("Token stored:", !!data.token);

      // ✅ UPDATED FOR OPTION 2: Use checkDriverOnboarding utility with forceRefresh=true
      if (data.user.role === "driver") {
        console.log("[LOGIN] Driver detected, verifying onboarding status with fresh API call");

        // ✅ NEW: Force fresh API call on login (forceRefresh=true) to get latest data from MongoDB
        const onboardingCheck = await checkDriverOnboarding(true);
        console.log("[LOGIN] Onboarding utility response (forced refresh):", onboardingCheck);

        if (!onboardingCheck.completed) {
          // Driver hasn't completed onboarding, redirect to onboarding flow
          console.log("[LOGIN] Driver has NOT completed onboarding - routing to /driver-onboarding");
          router.replace("/driver-onboarding");
        } else {
          // Driver completed onboarding, go to driver dashboard
          console.log("[LOGIN] Driver HAS completed onboarding - routing to /driver-dashboard");
          router.replace("/driver-dashboard");
        }
      } else if (data.user.role === "parent") {
        console.log("[LOGIN] Parent detected - routing to /login-parent");
        router.replace("/login-parent");
      } else if (data.user.role === "admin") {
        console.log("[LOGIN] Admin detected - routing to /adminDashboard");
        router.replace("/adminDashboard");
      } else {
        // Default fallback for unknown roles
        console.log("[LOGIN] Unknown role detected - routing to /Dashboard");
        router.replace("/Dashboard");
      }
    } catch (err) {
      console.error("[LOGIN] Login error:", err);
      setError(
        "Unable to connect to server. Please check your internet connection."
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ PRESERVED: Handle logout with cache clearing
  const handleLogout = async () => {
    try {
      console.log("[LOGIN] Logging out - clearing cache");
      await clearOnboardingCache();
      // Clear all stored data
      await AsyncStorage.removeItem("userData");
      await AsyncStorage.removeItem("role");
      await AsyncStorage.removeItem("userId");
      await AsyncStorage.removeItem("userName");
      await AsyncStorage.removeItem("userEmail");
      console.log("[LOGIN] Logout complete");
      // Router will redirect to login based on auth state
      router.replace("/");
    } catch (error) {
      console.error("[LOGIN] Logout error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        style={styles.logo}
        source={require("../assets/images/LANDING PAGE.png")}
        resizeMode="contain"
      />
      <Text style={styles.pageLabel}>Driver Login Page</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.inputBox}
          placeholder="Enter email"
          placeholderTextColor="#999"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          editable={!loading}
        />

        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.inputFlex}
            placeholder="Enter password"
            placeholderTextColor="#999"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            disabled={loading}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={22}
              color="#333"
              style={{ marginLeft: 10 }}
            />
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#5A0FC8" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#5A0FC8",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 40,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 30,
  },
  label: {
    fontFamily: "Montserrat",
    color: "#fff",
    fontSize: 16,
    marginBottom: 5,
    fontWeight: "600",
  },
  inputBox: {
    width: "100%",
    height: 45,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    fontFamily: "Montserrat",
    fontSize: 14,
    color: "#000",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 45,
    marginBottom: 15,
  },
  inputFlex: {
    flex: 1,
    height: "100%",
    color: "#000",
    fontFamily: "Montserrat",
    fontSize: 14,
  },
  button: {
    width: 230,
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontFamily: "Montserrat",
    color: "#5A0FC8",
    fontSize: 16,
    fontWeight: "bold",
  },
  error: {
    color: "#FFD700",
    marginTop: 5,
    fontSize: 14,
    fontFamily: "Montserrat",
  },
  pageLabel: {
    fontFamily: "Montserrat",
    color: "#fff",
    fontSize: 18,
    marginBottom: 20,
    fontWeight: "bold",
  },
});
