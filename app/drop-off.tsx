import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  StatusBar,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

export default function EndTripPage({ navigation }: any) {
  const [rating, setRating] = useState(0);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#5A0FC8" barStyle="light-content" />

      {/* Top App Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>End Trip</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Trip Summary Card */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="time-outline" size={20} color="white" />
            <Text style={styles.bodyText}>30 min</Text>
          </View>
          <View style={styles.row}>
            <MaterialIcons name="alt-route" size={20} color="white" />
            <Text style={styles.bodyText}>12 km</Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="cash-outline" size={20} color="white" />
            <Text style={styles.bodyText}>R150</Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="location-outline" size={20} color="white" />
            <Text style={styles.bodyText}>Start: 12 Malinga Street</Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="school-outline" size={20} color="white" />
            <Text style={styles.bodyText}>End: Primrose Primary</Text>
          </View>
        </View>

        {/* Rating Section */}
        <Text style={styles.headingText}>Rate your trip</Text>
        <View style={styles.starsRow}>
          {Array.from({ length: 5 }, (_, index) => (
            <TouchableOpacity key={index} onPress={() => setRating(index + 1)}>
              <Ionicons
                name={index < rating ? "star" : "star-outline"}
                size={32}
                color="gold"
              />
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={styles.input}
          placeholder="Leave feedback (optional)"
          placeholderTextColor="#aaa"
          multiline
        />
        <Text style={styles.hintText}>Your feedback helps us improve!</Text>
      </ScrollView>

      {/* Buttons */}
      <View style={styles.buttonsRow}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>End Trip</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Report Issue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },

  // App Bar
  appBar: {
    backgroundColor: "#5A0FC8",
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40,
    paddingBottom: 15,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    position: "relative",
    elevation: 4,
  },
  backButton: {
    position: "absolute",
    left: 15,
    top: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40,
  },
  appBarTitle: {
    fontFamily: "Montserrat",
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },

  scrollContainer: {
    paddingBottom: 40,
  },

  // Card
  card: {
    backgroundColor: "#111",
    margin: 15,
    padding: 15,
    borderRadius: 10,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  bodyText: {
    marginLeft: 8,
    fontFamily: "Montserrat",
    fontSize: 14,
    color: "white",
    textAlign: "center",
  },

  // Heading
  headingText: {
    fontFamily: "Montserrat",
    fontSize: 24,
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
    marginVertical: 10,
  },

  // Rating
  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 8,
  },

  // Feedback Input
  input: {
    marginHorizontal: 20,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 12,
    color: "#111",
    fontFamily: "Montserrat",
    fontSize: 14,
    textAlignVertical: "top",
  },
  hintText: {
    color: "#777",
    textAlign: "center",
    marginTop: 5,
    fontFamily: "Montserrat",
    fontSize: 14,
  },

  // Buttons
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingVertical: 20,
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  button: {
    backgroundColor: "#5A0FC8",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    elevation: 3,
  },
  buttonText: {
    color: "white",
    fontFamily: "Montserrat",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
