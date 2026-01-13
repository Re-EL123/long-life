import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function UserRemovedScreen() {
  return (
    <View style={styles.container}>
      {/* Close button */}
      <View style={styles.iconCircle}>
        <Ionicons name="close" size={28} color="white" />
      </View>

      {/* Success message */}
      <Text style={styles.title}>User Successfully Removed</Text>
      <Text style={styles.subtitle}>
        The user account has been removed from the system.
      </Text>

      {/* Trash icon */}
      <TouchableOpacity style={styles.trashButton}>
        <Ionicons name="trash" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  iconCircle: {
    backgroundColor: "black",
    borderRadius: 50,
    padding: 15,
    marginBottom: 40,
    elevation: 3,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  trashButton: {
    backgroundColor: "#ef4444",
    padding: 16,
    borderRadius: 50,
    elevation: 3,
  },
});
