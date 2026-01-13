import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const DriverScheduleScreen: React.FC = () => {
  const schedule = [
    { day: "Monday", pickup: "07:25", dropoff: "14:25", address: "25 Monet Drive, Sandton", school: "Curro Collage Midrand" },
    { day: "Tuesday", pickup: "07:25", dropoff: "14:25", address: "25 Monet Drive, Sandton", school: "Curro Collage Midrand" },
    { day: "Wednesday", pickup: "07:25", dropoff: "14:25", address: "25 Monet Drive, Sandton", school: "Curro Collage Midrand" },
    { day: "Thursday", pickup: "07:25", dropoff: "14:25", address: "25 Monet Drive, Sandton", school: "Curro Collage Midrand" },
    { day: "Friday", pickup: "07:25", dropoff: "14:25", address: "25 Monet Drive, Sandton", school: "Curro Collage Midrand" },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedule</Text>
        <Image source={require("../assets/images/logo2.png")} style={styles.logo} resizeMode="contain" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Child Info */}
        <View style={styles.childInfo}>
          <MaterialIcons name="account-circle" size={60} color="black" />
          <View>
            <Text style={styles.childName}>Mike Sim</Text>
            <Text style={styles.childDetails}>Age: 12</Text>
            <Text style={styles.childDetails}>Midrand Primary</Text>
          </View>
        </View>

        {/* Weekly Schedule */}
        {schedule.map((item, idx) => (
          <View key={idx} style={styles.dayBlock}>
            <Text style={styles.dayTitle}>{item.day}</Text>
            <Text style={styles.detail}>Pick up time: {item.pickup}</Text>
            <Text style={styles.detail}>Drop off time: {item.dropoff}</Text>
            <Text style={styles.detail}>Home address: {item.address}</Text>
            <Text style={styles.detail}>School: {item.school}</Text>
          </View>
        ))}

        {/* Edit Button */}
        <TouchableOpacity style={styles.editBtn}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default DriverScheduleScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0ebf8" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#5A0FC8", // solid purple
    paddingVertical: 15,
    paddingHorizontal: 15,
    justifyContent: "space-between",
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  logo: { width: 70, height: 30 },
  scrollContent: { padding: 20 },
  childInfo: { flexDirection: "row", alignItems: "center", marginBottom: 25, gap: 15 },
  childName: { fontSize: 16, fontWeight: "bold", color: "#000" },
  childDetails: { fontSize: 13, color: "#555" },
  dayBlock: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: "#eee", paddingBottom: 10 },
  dayTitle: { fontSize: 15, fontWeight: "bold", marginBottom: 5, color: "#5A0FC8" },
  detail: { fontSize: 13, color: "#444", marginBottom: 2 },
  editBtn: { backgroundColor: "#5A0FC8", paddingVertical: 12, borderRadius: 8, alignItems: "center", marginTop: 20, marginBottom: 30 },
  editText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
});
