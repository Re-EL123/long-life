import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([
    { id: "1", title: "Pick-up", message: "Parent has requested a trip for 16:30 today", time: "10 minutes ago" },
    { id: "2", title: "Delay", message: "Unexpected traffic on route", time: "15 minutes ago" },
    { id: "3", title: "Arrive In...", message: "Estimated ETA is 14:30", time: "20 minutes ago" },
    { id: "4", title: "Arrive", message: "Student has been dropped off", time: "10 minutes ago" },
  ]);

  const handleClearAll = () => setNotifications([]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Notifications</Text>
      </View>

      {/* Notification List */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No notifications available</Text>}
      />

      {/* Clear All Button */}
      {notifications.length > 0 && (
        <TouchableOpacity style={styles.clearButton} onPress={handleClearAll}>
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3EFFF", paddingHorizontal: 16, paddingTop: 60 },
  headerContainer: { paddingVertical: 20, borderRadius: 12, marginBottom: 16, alignItems: "center", backgroundColor: '#5A0FC8' },
  headerText: { fontSize: 24, fontWeight: "bold", color: "white" },
  card: { backgroundColor: "white", borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1.5, borderColor: "#d1d5db", elevation: 2 },
  title: { fontSize: 18, fontWeight: "bold", color: "#5A0FC8", marginBottom: 4 },
  message: { fontSize: 14, color: "#555", marginBottom: 6 },
  time: { fontSize: 12, color: "#999", textAlign: "right" },
  clearButton: { position: "absolute", bottom: 20, alignSelf: "center", backgroundColor: "#5A0FC8", paddingVertical: 12, paddingHorizontal: 30, borderRadius: 30, elevation: 3 },
  clearText: { color: "white", fontWeight: "600", fontSize: 16 },
  emptyText: { color: "#999", fontSize: 16, textAlign: "center", marginTop: 50 },
});
