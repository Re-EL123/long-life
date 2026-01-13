import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";


const ChildDetailsScreen: React.FC = () => {
  const [form, setForm] = useState({
    name: "",
    surname: "",
    age: "",
    gender: "",
    school: "",
    emergency: "",
    homeAddress: "",
    schoolAddress: "",
    parentName: "",
    relationship: "",
  });


  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);


  // Handle photo selection from gallery
  const handleSelectPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Camera roll permission is required");
        return;
      }


      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });


      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
        console.log("[ChildDetails] Photo selected:", result.assets[0].uri);
      }
    } catch (error) {
      console.error("[ChildDetails] Error selecting photo:", error);
    }
  };


  // Handle camera photo
  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Camera permission is required");
        return;
      }


      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });


      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
        console.log("[ChildDetails] Photo taken:", result.assets[0].uri);
      }
    } catch (error) {
      console.error("[ChildDetails] Error taking photo:", error);
    }
  };


  // Show photo options
  const handlePhotoOptions = () => {
    Alert.alert(
      "Add Child Photo",
      "Choose an option",
      [
        { text: "Take Photo", onPress: handleTakePhoto },
        { text: "Choose from Gallery", onPress: handleSelectPhoto },
        { text: "Cancel", onPress: () => {}, style: "cancel" },
      ]
    );
  };


  // ✅ Fixed handleChange
  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prevForm) => ({ ...prevForm, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };


  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};


    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.surname.trim()) newErrors.surname = "Surname is required";
    if (!form.age.trim()) newErrors.age = "Age is required";
    if (form.age && isNaN(Number(form.age)))
      newErrors.age = "Age must be a number";
    if (!form.gender.trim()) newErrors.gender = "Gender is required";
    if (!form.school.trim()) newErrors.school = "School name is required";
    if (!form.emergency.trim()) newErrors.emergency = "Emergency contact is required";
    if (form.emergency && !/^\d{10,}/.test(form.emergency.replace(/\D/g, "")))
      newErrors.emergency = "Enter a valid phone number";


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  // Upload photo to server
  const uploadPhoto = async (token: string, childId: string): Promise<boolean> => {
    if (!photoUri) return true;


    try {
      console.log("[ChildDetails] Uploading photo...");


      const formData = new FormData();
      formData.append("photo", {
        uri: photoUri,
        type: "image/jpeg",
        name: `child-${childId}-${Date.now()}.jpg`,
      } as any);


      const res = await fetch(
        `https://temp-weld-rho.vercel.app/api/user/children/${childId}/photo`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          body: formData,
        }
      );


      console.log("[ChildDetails] Photo upload status:", res.status);
      return true;
    } catch (error) {
      console.error("[ChildDetails] Error uploading photo:", error);
      return true;
    }
  };


  const handleNext = async () => {
    if (!validateForm()) return;


    setLoading(true);


    try {
      const token = await AsyncStorage.getItem("userToken") || await AsyncStorage.getItem("token");


      if (!token) {
        Alert.alert("Error", "Please log in first");
        router.replace("/LoginPage");
        return;
      }


      console.log("[ChildDetails] Creating child with all details...");


      // ✅ FIXED: Added surname to API call
      const res = await fetch(
        "https://temp-weld-rho.vercel.app/api/user/children",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name.trim(),
            surname: form.surname.trim(),
            gender: form.gender.toLowerCase(),
            age: parseInt(form.age),
            grade: form.school,
            schoolName: form.school,
            homeAddress: form.homeAddress.trim() || "N/A",
            schoolAddress: form.schoolAddress.trim() || "N/A",
            parentName: form.parentName.trim() || "N/A",
            relationship: form.relationship.trim() || "N/A",
            parentContact: form.emergency.trim(),
          }),
        }
      );


      const data = await res.json();
      console.log("[ChildDetails] Response:", data);


      if (!res.ok) {
        Alert.alert("Error", data.message || "Failed to add child");
        return;
      }


      const childId = data.child?._id || data._id;


      // Upload photo if selected
      if (photoUri && childId) {
        await uploadPhoto(token, childId);
      }


      Alert.alert("Success", "Child added successfully!", [
        {
          text: "OK",
          onPress: () => {
            setForm({
              name: "",
              surname: "",
              age: "",
              gender: "",
              school: "",
              emergency: "",
              homeAddress: "",
              schoolAddress: "",
              parentName: "",
              relationship: "",
            });
            setPhotoUri(null);
            router.back();
          },
        },
      ]);
    } catch (error) {
      console.error("Error adding child:", error);
      Alert.alert("Error", "Failed to add child. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.appBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Add Child</Text>
        <Image
          source={require("../assets/images/logo3.png")}
          style={styles.logo2}
          resizeMode="contain"
        />
      </View>


      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Page Title */}
        <Text style={styles.pageTitle}>Please enter your child's details</Text>


        {/* Hidden Photo Button - Functionality only */}
        <TouchableOpacity
          onPress={handlePhotoOptions}
          disabled={loading}
          style={{ height: 0, opacity: 0, overflow: "hidden" }}
        />


        {/* Form Card */}
        <View style={styles.formCard}>
          {/* Photo Status Indicator - Hidden but shows when photo added */}
          {photoUri && (
            <Text style={{ fontSize: 11, color: "#5A0FC8", marginBottom: 8, textAlign: "center", fontWeight: "500" }}>
              ✓ Photo added
            </Text>
          )}


          <Text style={styles.label}>Name:</Text>
          <TextInput
            placeholder="Enter name"
            style={[styles.input, errors.name && styles.inputError]}
            value={form.name}
            onChangeText={(text) => handleChange("name", text)}
            placeholderTextColor="#999"
            editable={!loading}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}


          <Text style={styles.label}>Surname:</Text>
          <TextInput
            placeholder="Enter surname"
            style={[styles.input, errors.surname && styles.inputError]}
            value={form.surname}
            onChangeText={(text) => handleChange("surname", text)}
            placeholderTextColor="#999"
            editable={!loading}
          />
          {errors.surname && (
            <Text style={styles.errorText}>{errors.surname}</Text>
          )}


          <Text style={styles.label}>Age:</Text>
          <TextInput
            placeholder="Enter age"
            style={[styles.input, errors.age && styles.inputError]}
            value={form.age}
            keyboardType="numeric"
            onChangeText={(text) => handleChange("age", text)}
            placeholderTextColor="#999"
            editable={!loading}
          />
          {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}


          <Text style={styles.label}>Gender:</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[
                styles.genderOption,
                form.gender === "male" && styles.genderSelected,
              ]}
              onPress={() => handleChange("gender", "male")}
              disabled={loading}
            >
              <Text
                style={[
                  styles.genderText,
                  form.gender === "male" && styles.genderTextSelected,
                ]}
              >
                Male
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.genderOption,
                form.gender === "female" && styles.genderSelected,
              ]}
              onPress={() => handleChange("gender", "female")}
              disabled={loading}
            >
              <Text
                style={[
                  styles.genderText,
                  form.gender === "female" && styles.genderTextSelected,
                ]}
              >
                Female
              </Text>
            </TouchableOpacity>
          </View>
          {errors.gender && (
            <Text style={styles.errorText}>{errors.gender}</Text>
          )}


          <Text style={styles.label}>School Name:</Text>
          <TextInput
            placeholder="Enter school name"
            style={[styles.input, errors.school && styles.inputError]}
            value={form.school}
            onChangeText={(text) => handleChange("school", text)}
            placeholderTextColor="#999"
            editable={!loading}
          />
          {errors.school && (
            <Text style={styles.errorText}>{errors.school}</Text>
          )}


          <Text style={styles.label}>Home Address:</Text>
          <TextInput
            placeholder="Enter home address"
            style={styles.input}
            value={form.homeAddress}
            onChangeText={(text) => handleChange("homeAddress", text)}
            placeholderTextColor="#999"
            editable={!loading}
          />


          <Text style={styles.label}>School Address:</Text>
          <TextInput
            placeholder="Enter school address"
            style={styles.input}
            value={form.schoolAddress}
            onChangeText={(text) => handleChange("schoolAddress", text)}
            placeholderTextColor="#999"
            editable={!loading}
          />


          <Text style={styles.label}>Parent/Guardian Name:</Text>
          <TextInput
            placeholder="Enter parent name"
            style={styles.input}
            value={form.parentName}
            onChangeText={(text) => handleChange("parentName", text)}
            placeholderTextColor="#999"
            editable={!loading}
          />


          <Text style={styles.label}>Relationship:</Text>
          <TextInput
            placeholder="e.g., Mother, Father, Guardian"
            style={styles.input}
            value={form.relationship}
            onChangeText={(text) => handleChange("relationship", text)}
            placeholderTextColor="#999"
            editable={!loading}
          />


          <Text style={styles.label}>Emergency Contact:</Text>
          <TextInput
            placeholder="Enter emergency contact number"
            style={[styles.input, errors.emergency && styles.inputError]}
            value={form.emergency}
            keyboardType="phone-pad"
            onChangeText={(text) => handleChange("emergency", text)}
            placeholderTextColor="#999"
            editable={!loading}
          />
          {errors.emergency && (
            <Text style={styles.errorText}>{errors.emergency}</Text>
          )}


          {/* Hidden Photo Button Inside Form - Long press to trigger */}
          <TouchableOpacity
            onLongPress={handlePhotoOptions}
            onPress={handlePhotoOptions}
            disabled={loading}
            activeOpacity={1}
            style={{ height: 0, overflow: "hidden" }}
          />
        </View>


        {/* Next Button */}
        <TouchableOpacity
          style={[styles.nextBtn, loading && styles.nextBtnDisabled]}
          onPress={handleNext}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.nextText}>Add Child</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};


export default ChildDetailsScreen;


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
    elevation: 5
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
  pageTitle: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
    fontWeight: "600",
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
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    marginBottom: 15,
    backgroundColor: "#FAFAFA",
    color: "#000",
  },
  inputError: {
    borderColor: "#ff4444",
    backgroundColor: "#fff5f5",
  },
  errorText: {
    color: "#ff4444",
    fontSize: 12,
    marginTop: -12,
    marginBottom: 10,
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  genderSelected: {
    backgroundColor: "#5A0FC8",
    borderColor: "#5A0FC8",
  },
  genderText: {
    color: "#333",
    fontWeight: "600",
    fontSize: 14,
  },
  genderTextSelected: {
    color: "#fff",
  },
  nextBtn: {
    backgroundColor: "#5A0FC8",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  nextBtnDisabled: {
    opacity: 0.6,
  },
  nextText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});