import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SchedulePage() {
  const [date, setDate] = useState("");
  const [pickUpTime, setPickUpTime] = useState("");
  const [dropOffTime, setDropOffTime] = useState("");
  const [pickUpLocation, setPickUpLocation] = useState("");
  const [dropOffLocation, setDropOffLocation] = useState("");

  const handleConfirm = () => {
    Alert.alert(
      "Schedule Confirmed!",
      `Date: ${date}\nPick-up: ${pickUpTime}\nDrop-off: ${dropOffTime}\nFrom: ${pickUpLocation}\nTo: ${dropOffLocation}`
    );
    console.log({ date, pickUpTime, dropOffTime, pickUpLocation, dropOffLocation });
  };

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Schedule</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Enter Ride Schedule</Text>

        {[
          { label: "Select Date", value: date, setter: setDate, options: ["2025-08-14", "2025-08-15"] },
          { label: "Pick Up Time", value: pickUpTime, setter: setPickUpTime, options: ["07:00 AM", "08:00 AM"] },
          { label: "Drop Off Time", value: dropOffTime, setter: setDropOffTime, options: ["02:00 PM", "03:00 PM"] },
          { label: "Pick-up Location", value: pickUpLocation, setter: setPickUpLocation, options: ["Home", "School"] },
          { label: "Drop-off Location", value: dropOffLocation, setter: setDropOffLocation, options: ["Home", "School"] },
        ].map((picker, index) => (
          <View key={index} style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>{picker.label}</Text>
            <Picker selectedValue={picker.value} onValueChange={picker.setter} style={styles.picker}>
              <Picker.Item label={picker.label} value="" />
              {picker.options.map((opt, i) => (
                <Picker.Item key={i} label={opt} value={opt} />
              ))}
            </Picker>
          </View>
        ))}

        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    backgroundColor: "#fff",
  },
  header: {
    height: 120,
    justifyContent: "flex-end",
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: "#5A0FC8",
  },
  headerText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    alignSelf: "center",
  },
  pickerContainer: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#A17DF0",
    borderRadius: 10,
    overflow: "hidden",
  },
  pickerLabel: {
    padding: 10,
    fontWeight: "500",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  confirmButton: {
    marginTop: 20,
    backgroundColor: "#5A0FC8",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
