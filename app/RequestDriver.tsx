import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

const RequestDriverScreen = () => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [activity, setActivity] = useState("");
  const [driver, setDriver] = useState("");
  const [instructions, setInstructions] = useState("");

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={22} color="#fff" />
        <Text style={styles.headerTitle}>Request Driver</Text>
        <Image
          source={require("../assets/images/logo2.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile */}
        <View style={styles.profile}>
          <Ionicons name="person-circle" size={60} color="#5A0FC8" />
          <View>
            <Text style={styles.profileName}>Micheal Williams</Text>
            <Text style={styles.profileSub}>Midrand Primary School</Text>
          </View>
        </View>

        {/* Input Fields */}
        <View style={styles.inputWrapper}>
          <MaterialIcons name="date-range" size={20} color="#555" />
          <TextInput
            placeholder="Date"
            placeholderTextColor="#555"
            style={styles.input}
            value={date}
            onChangeText={setDate}
          />
        </View>

        <View style={styles.inputWrapper}>
          <MaterialIcons name="access-time" size={20} color="#555" />
          <TextInput
            placeholder="Pick up time"
            placeholderTextColor="#555"
            style={styles.input}
            value={time}
            onChangeText={setTime}
          />
        </View>

        <View style={styles.inputWrapper}>
          <MaterialIcons name="location-on" size={20} color="#555" />
          <TextInput
            placeholder="Pick up location"
            placeholderTextColor="#555"
            style={styles.input}
            value={pickup}
            onChangeText={setPickup}
          />
        </View>

        <View style={styles.inputWrapper}>
          <MaterialIcons name="location-searching" size={20} color="#555" />
          <TextInput
            placeholder="Drop off location"
            placeholderTextColor="#555"
            style={styles.input}
            value={dropoff}
            onChangeText={setDropoff}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="list-circle" size={20} color="#555" />
          <TextInput
            placeholder="Activity"
            placeholderTextColor="#555"
            style={styles.input}
            value={activity}
            onChangeText={setActivity}
          />
        </View>

        <View style={styles.inputWrapper}>
          <FontAwesome5 name="user-tie" size={18} color="#555" />
          <TextInput
            placeholder="Driver"
            placeholderTextColor="#555"
            style={styles.input}
            value={driver}
            onChangeText={setDriver}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="document-text-outline" size={20} color="#555" />
          <TextInput
            placeholder="Instructions"
            placeholderTextColor="#555"
            style={[styles.input, { height: 80 }]}
            value={instructions}
            onChangeText={setInstructions}
            multiline
          />
        </View>

        {/* Send Button */}
        <TouchableOpacity style={styles.sendBtn}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default RequestDriverScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#5A0FC8",
    paddingVertical: 15,
    paddingHorizontal: 15,
    justifyContent: "space-between",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  logo: {
    width: 70,
    height: 30,
  },
  scrollContent: {
    padding: 20,
  },
  profile: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
    gap: 15,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  profileSub: {
    fontSize: 13,
    color: "#555",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingLeft: 8,
    fontSize: 14,
    color: "#000", // ensures input text is visible
  },
  sendBtn: {
    backgroundColor: "#5A0FC8",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  sendText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
