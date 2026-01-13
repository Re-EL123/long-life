import React, { useState } from "react";
import {
  Alert,
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

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
          "Accept": "application/json",
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

      // Store token with consistent key name for app-wide use
      await AsyncStorage.setItem("userToken", data.token);
      // Also store as "token" for backward compatibility
      await AsyncStorage.setItem("token", data.token);

      // Store user info
      await AsyncStorage.setItem("role", data.user.role);
      await AsyncStorage.setItem("userId", data.user.id);
      await AsyncStorage.setItem("userName", data.user.name);
      await AsyncStorage.setItem("userEmail", data.user.email);
      
      // Store full user data as JSON
      await AsyncStorage.setItem("userData", JSON.stringify(data.user));

      console.log("Login successful, role:", data.user.role);
      console.log("Token stored:", !!data.token);

      // Redirect based on role
      if (data.user.role === "driver") {
        router.replace("/LoginPage");
      } else if (data.user.role === "parent") {
        router.replace("/ParentDashboard");
      } else if (data.user.role === "admin") {
        router.replace("/adminDashboard");
      } else {
        // Default fallback
        router.replace("/driver-dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Unable to connect to server. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        style={styles.logo}
        source={require("../assets/images/LANDING PAGE.png")}
        resizeMode="contain"
      />

      <Text style={styles.pageLabel}>Parent Login Page</Text>


      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.inputBox}
          placeholder="Enter email"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={(text) => {
            setEmail(text.trim());
            setError("");
          }}
          editable={!loading}
        />

        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.inputFlex}
            placeholder="Enter password"
            placeholderTextColor="#999"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError("");
            }}
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

      <TouchableOpacity
        style={styles.signupLink}
        onPress={() => router.push("/createAccount")}
        disabled={loading}
      >
        <Text style={styles.signupText}>
          Don't have an account?{" "}
          <Text style={styles.signupTextBold}>Sign Up</Text>
        </Text>
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
  },
  button: {
    width: 230,
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
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
    color: "yellow",
    marginTop: -10,
    marginBottom: 10,
    fontSize: 14,
    textAlign: "center",
  },
  signupLink: {
    marginTop: 20,
  },
  signupText: {
    color: "#fff",
    fontSize: 14,
  },
  signupTextBold: {
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  pageLabel: {
  fontFamily: "Montserrat",
  color: "#fff",
  fontSize: 18,
  marginBottom: 20,
  fontWeight: "bold",
},

});
