import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  SafeAreaView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const CreateAccount = () => {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [cell, setCell] = useState("");
  const [address, setAddress] = useState("");
  const [isSouthAfrican, setIsSouthAfrican] = useState("");
  const [idOrPassport, setIdOrPassport] = useState("");

  type Errors = {
    name?: string;
    surname?: string;
    cell?: string;
    address?: string;
    isSouthAfrican?: string;
    idOrPassport?: string;
  };

  const [errors, setErrors] = useState<Errors>({});

  const validate = () => {
    const newErrors: Errors = {};
    if (!name) newErrors.name = "Name is required";
    if (!surname) newErrors.surname = "Surname is required";
    if (!cell) newErrors.cell = "Cell number is required";
    else if (cell.length < 10) newErrors.cell = "Enter a valid 10-digit number";
    if (!address) newErrors.address = "Address is required";
    if (!isSouthAfrican) newErrors.isSouthAfrican = "Please select Yes or No";
    if (!idOrPassport)
      newErrors.idOrPassport =
        isSouthAfrican === "Yes"
          ? "ID number is required"
          : "Passport number is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      Alert.alert("Success", "Account created!");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.appBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Driver Details</Text>
        <Image
          source={require("../assets/images/logo3.png")}
          style={styles.logo2}
          resizeMode="contain"
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formCard}>
          {/* Name */}
          <Text style={styles.label}>Name:</Text>
          <TextInput
            placeholder="Enter your name"
            style={styles.textInput}
            value={name}
            onChangeText={setName}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

          {/* Surname */}
          <Text style={styles.label}>Surname:</Text>
          <TextInput
            placeholder="Enter your surme"
            style={styles.textInput}
            value={surname}
            onChangeText={setSurname}
          />
          {errors.surname && (
            <Text style={styles.errorText}>{errors.surname}</Text>
          )}

          {/* Cell Number */}
          <Text style={styles.label}>Cell Number:</Text>
          <TextInput
            placeholder="Enter your cell number"
            keyboardType="phone-pad"
            style={styles.textInput}
            value={cell}
            onChangeText={setCell}
          />
          {errors.cell && <Text style={styles.errorText}>{errors.cell}</Text>}

          {/* Address */}
          <Text style={styles.label}>Address:</Text>
          <TextInput
            placeholder="Enter your address"
            style={styles.textInput}
            value={address}
            onChangeText={setAddress}
          />
          {errors.address && (
            <Text style={styles.errorText}>{errors.address}</Text>
          )}

          {/* Are you South African */}
          <Text style={styles.label}>Are you South African?</Text>
          <View style={styles.choiceContainer}>
            <TouchableOpacity
              style={[
                styles.choiceButton,
                isSouthAfrican === "Yes" && styles.choiceSelected,
              ]}
              onPress={() => setIsSouthAfrican("Yes")}
            >
              <Text
                style={[
                  styles.choiceText,
                  isSouthAfrican === "Yes" && styles.choiceTextSelected,
                ]}
              >
                Yes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.choiceButton,
                isSouthAfrican === "No" && styles.choiceSelected,
              ]}
              onPress={() => setIsSouthAfrican("No")}
            >
              <Text
                style={[
                  styles.choiceText,
                  isSouthAfrican === "No" && styles.choiceTextSelected,
                ]}
              >
                No
              </Text>
            </TouchableOpacity>
          </View>
          {errors.isSouthAfrican && (
            <Text style={styles.errorText}>{errors.isSouthAfrican}</Text>
          )}

          {/* Conditional ID / Passport input */}
          {isSouthAfrican === "Yes" && (
            <>
              <Text style={styles.label}>ID Number:</Text>
              <TextInput
                placeholder="Enter your ID number"
                style={styles.textInput}
                value={idOrPassport}
                onChangeText={setIdOrPassport}
                keyboardType="numeric"
              />
              {errors.idOrPassport && (
                <Text style={styles.errorText}>{errors.idOrPassport}</Text>
              )}
            </>
          )}

          {isSouthAfrican === "No" && (
            <>
              <Text style={styles.label}>Passport Number:</Text>
              <TextInput
                placeholder="Enter your Passport number"
                style={styles.textInput}
                value={idOrPassport}
                onChangeText={setIdOrPassport}
              />
              {errors.idOrPassport && (
                <Text style={styles.errorText}>{errors.idOrPassport}</Text>
              )}
            </>
          )}

          {/* Social Options */}
          <Text style={styles.orText}>or continue with</Text>
          <Text style={styles.socialText}>
            Google <Text style={styles.spacer}>or Facebook</Text>
          </Text>

          {/* Button */}
          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateAccount;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  appBar: {
    height: 100,
    backgroundColor: "#5A0FC8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingTop: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  backBtn: {
    padding: 6,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  logo2: {
    width: 55,
    height: 40,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  label: {
    fontSize: 15,
    color: "#333",
    marginBottom: 6,
    fontWeight: "600",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    marginBottom: 10,
    backgroundColor: "#FAFAFA",
  },
  choiceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  choiceButton: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
    backgroundColor: "#F2F2F2",
  },
  choiceSelected: {
    backgroundColor: "#5A0FC8",
    borderColor: "#5A0FC8",
  },
  choiceText: {
    color: "#333",
    fontWeight: "600",
  },
  choiceTextSelected: {
    color: "#fff",
  },
  orText: {
    fontSize: 15,
    textAlign: "center",
    marginTop: 20,
    color: "#333",
    fontWeight: "600",
  },
  socialText: {
    fontSize: 15,
    textAlign: "center",
    marginVertical: 10,
    color: "#5A0FC8",
    fontWeight: "600",
  },
  spacer: {
    color: "#5A0FC8",
  },
  button: {
    backgroundColor: "#5A0FC8",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 8,
  },
});
