// RequestDriverScreen.tsx - Enhanced with Children Multi-Select and Once-Off Navigation
import { Picker } from "@react-native-picker/picker";
import React, { useState, useEffect, useRef } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Platform,
  Animated,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ✅ Enhanced Web-compatible date/time picker
const CrossPlatformDateTimePicker = Platform.OS === "web"
  ? ({ mode, value, onChange }: any) => {
      const inputType = mode === "time" ? "time" : "date";

      const formattedValue =
        mode === "time"
          ? value.toTimeString().slice(0, 5)
          : value.toISOString().split("T")[0];

      return (
        <input
          type={inputType}
          value={formattedValue}
          onChange={(e) => {
            const newDate =
              mode === "time"
                ? new Date(`1970-01-01T${e.target.value}`)
                : new Date(e.target.value + "T00:00:00");
            onChange(null, newDate);
          }}
          style={{
            padding: 12,
            borderRadius: 8,
            border: "1px solid #E0E0E0",
            fontSize: 15,
            width: "100%",
            fontFamily: "inherit",
            backgroundColor: "#fff",
            color: "#1A1A1A",
          }}
        />
      );
    }
  : require("@react-native-community/datetimepicker").default;

// ✅ API URL
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://safe-school-ride.duckdns.org";

// ✅ Child interface
interface Child {
  _id: string;
  name: string;
  surname: string;
  age: number;
  gender: string;
  schoolName: string;
  homeAddress: string;
  schoolAddress: string;
  parentContact: string;
}

const RequestDriverScreen = () => {
  // State
  const [tripType, setTripType] = useState("once-off");
  const [activity, setActivity] = useState("");
  const [date, setDate] = useState(new Date());
  const [pickupTime, setPickupTime] = useState(new Date());
  const [instructions, setInstructions] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Children and parent state
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>([]);
  const [selectedChildren, setSelectedChildren] = useState<Child[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [parentName, setParentName] = useState("Parent");
  const [userRole, setUserRole] = useState("Parent");

  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // ✅ Fetch parent info and children on mount
  useEffect(() => {
    fetchParentInfo();
    fetchChildren();

    if (Platform.OS !== "web") {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, []);

  // ✅ Fetch parent information from AsyncStorage
  const fetchParentInfo = async () => {
    try {
      const name = await AsyncStorage.getItem("userName");
      const role = await AsyncStorage.getItem("userRole");

      if (name) setParentName(name);
      if (role) setUserRole(role.charAt(0).toUpperCase() + role.slice(1));
    } catch (error) {
      console.error("[RequestDriver] Error fetching parent info:", error);
    }
  };

  // ✅ Fetch children from API
  const fetchChildren = async () => {
    try {
      setLoadingChildren(true);
      const token =
        (await AsyncStorage.getItem("userToken")) ||
        (await AsyncStorage.getItem("token"));

      if (!token) {
        if (Platform.OS === "web") {
          alert("Please log in first");
        } else {
          Alert.alert("Error", "Please log in first");
        }
        router.replace("/LoginPage");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/user/children`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("[RequestDriver] Children fetched:", data);

      if (response.ok && data.children) {
        setChildren(data.children);
        if (data.children.length > 0) {
          const firstId = data.children[0]._id;
          setSelectedChildIds([firstId]);
          setSelectedChildren([data.children[0]]);
        }
      } else {
        console.error("[RequestDriver] Failed to fetch children:", data.message);
      }
    } catch (error) {
      console.error("[RequestDriver] Error fetching children:", error);
      if (Platform.OS === "web") {
        alert("Failed to load children. Please try again.");
      } else {
        Alert.alert("Error", "Failed to load children. Please try again.");
      }
    } finally {
      setLoadingChildren(false);
    }
  };

  // ✅ Handle child selection (multi-select)
  const toggleChildSelect = (childId: string) => {
    setSelectedChildIds((prev) => {
      const exists = prev.includes(childId);
      const nextIds = exists
        ? prev.filter((id) => id !== childId)
        : [...prev, childId];

      setSelectedChildren(
        children.filter((c) => nextIds.includes(c._id))
      );

      return nextIds;
    });
  };

  // ✅ Day selection toggle
  const toggleDay = (day: string) => {
    if (Platform.OS !== "web") {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }

    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS !== "web") {
      setShowDatePicker(Platform.OS === "ios");
    }
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS !== "web") {
      setShowTimePicker(Platform.OS === "ios");
    }
    if (selectedTime) {
      setPickupTime(selectedTime);
    }
  };

  // ✅ Handle Request - Different flow for once-off vs recurring
  const handleRequest = async () => {
    // Validation
    if (selectedChildren.length === 0) {
      if (Platform.OS === "web") {
        alert("Please select at least one child");
      } else {
        Alert.alert("Error", "Please select at least one child");
      }
      return;
    }

    if (
      (tripType === "weekly" || tripType === "monthly") &&
      selectedDays.length === 0
    ) {
      if (Platform.OS === "web") {
        alert("Please select at least one day for recurring trips");
      } else {
        Alert.alert("Error", "Please select at least one day for recurring trips");
      }
      return;
    }

    // ✅ Get parent ID from AsyncStorage
    const parentId = await AsyncStorage.getItem("userId");

    // ✅ ONCE-OFF TRIP: Navigate to createOnceOff screen
    if (tripType === "once-off") {
      const tripData = {
        parentId: parentId || "UNKNOWN_PARENT_ID",
        parentName,
        tripType: "once-off",
        date: date.toISOString(),
        pickupTime: pickupTime.toTimeString().slice(0, 5),
        activity,
        instructions,
        children: selectedChildren.map((child) => ({
          childId: child._id,
          childName: `${child.name} ${child.surname}`,
          school: child.schoolName,
          homeAddress: child.homeAddress || "Home Address",
          schoolAddress: child.schoolAddress || child.schoolName,
          parentContact: child.parentContact,
        })),
      };

      console.log("[RequestDriver] Navigating to createOnceOff with data:", tripData);

      // Navigate to createOnceOff screen with trip data
      router.push({
        pathname: "/CreateOnceOffScreen",
        params: {
          tripData: JSON.stringify(tripData),
        },
      } as any);

      return;
    }

    // ✅ RECURRING TRIP: Submit to API with confirmation popup
    const message = `This ${tripType} trip request will be sent to admin for driver assignment.`;

    const confirmAction = async () => {
      setLoading(true);
      try {
        // Mock coordinates - in production, use actual geocoding
        const pickupCoords = {
          latitude: -26.0667,
          longitude: 28.0667,
        };

        const dropoffCoords = {
          latitude: -26.0833,
          longitude: 28.0833,
        };

        const requestData = {
          parentId: parentId || "UNKNOWN_PARENT_ID",
          tripType,
          date: date.toISOString(),
          pickupTime: pickupTime.toTimeString().slice(0, 5),
          activity,
          instructions,
          selectedDays: selectedDays,
          children: selectedChildren.map((child) => ({
            childId: child._id,
            childName: `${child.name} ${child.surname}`,
            school: child.schoolName,
            pickupLocation: {
              latitude: pickupCoords.latitude,
              longitude: pickupCoords.longitude,
              address: child.homeAddress || "Home Address",
            },
            dropoffLocation: {
              latitude: dropoffCoords.latitude,
              longitude: dropoffCoords.longitude,
              address: child.schoolAddress || child.schoolName,
            },
          })),
        };

        console.log(
          "🚀 Sending recurring trip request to:",
          `${API_BASE_URL}/api/trips/create-request`
        );
        console.log("📦 Request data:", requestData);

        const token =
          (await AsyncStorage.getItem("userToken")) ||
          (await AsyncStorage.getItem("token"));

        const response = await fetch(
          `${API_BASE_URL}/api/trips/create-request`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
          }
        );

        const result = await response.json();
        console.log("✅ Response:", result);

        if (response.ok && result.success) {
          // ✅ SUCCESS POPUP
          if (Platform.OS === "web") {
            alert(
              `✅ Success!\n\n${result.message || `Your ${tripType} trip request has been submitted successfully. Admin will assign a driver within 24 hours.`}`
            );
            router.back();
          } else {
            Alert.alert(
              "✅ Request Submitted",
              result.message || `Your ${tripType} trip request has been submitted successfully. Admin will assign a driver within 24 hours.`,
              [
                {
                  text: "OK",
                  onPress: () => router.back(),
                },
              ]
            );
          }
        } else {
          // ✅ ERROR POPUP
          const errorMsg = result.message || "Failed to submit request";
          console.error("❌ Error response:", errorMsg);
          if (Platform.OS === "web") {
            alert(`❌ Submission Failed\n\n${errorMsg}`);
          } else {
            Alert.alert("❌ Submission Failed", errorMsg, [
              { text: "OK", style: "default" },
            ]);
          }
        }
      } catch (error) {
        console.error("❌ Network error:", error);
        const errorMsg =
          "Network error. Please check your connection and try again.";
        if (Platform.OS === "web") {
          alert(`❌ Error\n\n${errorMsg}`);
        } else {
          Alert.alert("❌ Error", errorMsg, [
            { text: "OK", style: "default" },
          ]);
        }
      } finally {
        setLoading(false);
      }
    };

    if (Platform.OS === "web") {
      if (confirm(`${message}\n\nDo you want to continue?`)) {
        await confirmAction();
      }
    } else {
      Alert.alert("Confirm Request", message, [
        { text: "Cancel", style: "cancel" },
        { text: "Submit", style: "default", onPress: confirmAction },
      ]);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Driver</Text>
        <View style={styles.logo}>
          <Text style={styles.logoText}>SAFE</Text>
        </View>
      </View>

      <Animated.View
        style={[
          styles.content,
          Platform.OS !== "web" && {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Profile */}
        <View style={styles.profileContainer}>
          <View style={styles.profileIconWrapper}>
            <Ionicons name="person-circle" size={70} color="#7E2EFF" />
          </View>
          <Text style={styles.profileName}>{parentName}</Text>
          <Text style={styles.profileSubtitle}>{userRole}</Text>
        </View>

        {/* ✅ Child Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Child</Text>
          {loadingChildren ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#7E2EFF" />
              <Text style={styles.loadingText}>Loading children...</Text>
            </View>
          ) : children.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="alert-circle-outline"
                size={40}
                color="#999"
              />
              <Text style={styles.emptyText}>No children found</Text>
              <TouchableOpacity
                style={styles.addChildButton}
                onPress={() => router.push("/tripChildDetails" as any)}
              >
                <Text style={styles.addChildText}>Add Child</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {children.map((child) => {
                const checked = selectedChildIds.includes(child._id);
                return (
                  <TouchableOpacity
                    key={child._id}
                    style={styles.childRow}
                    onPress={() => toggleChildSelect(child._id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={
                        checked ? "checkbox-outline" : "square-outline"
                      }
                      size={22}
                      color={checked ? "#7E2EFF" : "#ccc"}
                    />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={styles.childRowTitle}>
                        {child.name} {child.surname}
                      </Text>
                      <Text style={styles.childRowSubtitle}>
                        {child.schoolName}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              {/* Selected children summary */}
              {selectedChildren.length > 0 && (
                <View style={styles.childInfoCard}>
                  <Text style={styles.childInfoLabel}>
                    Selected: {selectedChildren.length} child
                    {selectedChildren.length > 1 ? "ren" : ""}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Trip Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trip Type</Text>
          <View style={styles.tripTypeButtons}>
            {["once-off", "weekly", "monthly"].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.tripTypeButton,
                  tripType === type && styles.tripTypeButtonActive,
                ]}
                onPress={() => setTripType(type)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={
                    type === "once-off"
                      ? "flash"
                      : type === "weekly"
                      ? "calendar"
                      : "repeat"
                  }
                  size={18}
                  color={tripType === type ? "#fff" : "#7E2EFF"}
                  style={{ marginBottom: 4 }}
                />
                <Text
                  style={[
                    styles.tripTypeText,
                    tripType === type && styles.tripTypeTextActive,
                  ]}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Day Selection for Weekly/Monthly */}
        {(tripType === "weekly" || tripType === "monthly") && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Days</Text>
            <View style={styles.daysRow}>
              {daysOfWeek.map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayButton,
                    selectedDays.includes(day) && styles.dayButtonActive,
                  ]}
                  onPress={() => toggleDay(day)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.dayText,
                      selectedDays.includes(day) &&
                        styles.dayTextActive,
                    ]}
                  >
                    {day.slice(0, 3)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {tripType === "once-off" ? "Date" : "Start Date"}
          </Text>
          {Platform.OS === "web" ? (
            <View style={styles.inputWrapper}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color="#7E2EFF"
              />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <CrossPlatformDateTimePicker
                  mode="date"
                  value={date}
                  onChange={handleDateChange}
                />
              </View>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={styles.inputWrapper}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color="#7E2EFF"
                />
                <Text style={styles.inputText}>
                  {date.toDateString()}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
              {showDatePicker && (
                <CrossPlatformDateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}
            </>
          )}
        </View>

        {/* Time Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pickup Time</Text>
          {Platform.OS === "web" ? (
            <View style={styles.inputWrapper}>
              <Ionicons
                name="time-outline"
                size={20}
                color="#7E2EFF"
              />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <CrossPlatformDateTimePicker
                  mode="time"
                  value={pickupTime}
                  onChange={handleTimeChange}
                />
              </View>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={styles.inputWrapper}
                onPress={() => setShowTimePicker(true)}
              >
                <Ionicons
                  name="time-outline"
                  size={20}
                  color="#7E2EFF"
                />
                <Text style={styles.inputText}>
                  {pickupTime.toTimeString().slice(0, 5)}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
              {showTimePicker && (
                <CrossPlatformDateTimePicker
                  value={pickupTime}
                  mode="time"
                  display="default"
                  onChange={handleTimeChange}
                />
              )}
            </>
          )}
        </View>

        {/* Activity Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity (Optional)</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="football-outline"
              size={20}
              color="#7E2EFF"
            />
            <Picker
              selectedValue={activity}
              onValueChange={(value) => setActivity(value)}
              style={styles.picker}
            >
              <Picker.Item label="Select activity" value="" />
              <Picker.Item label="Soccer" value="soccer" />
              <Picker.Item label="Swimming" value="swimming" />
              <Picker.Item label="Extra Classes" value="classes" />
              <Picker.Item
                label="School Drop-off/Pickup"
                value="school"
              />
            </Picker>
          </View>
        </View>

        {/* Info Card for Once-Off */}
        {tripType === "once-off" && (
          <View style={styles.infoCard}>
            <Ionicons
              name="flash"
              size={24}
              color="#7E2EFF"
            />
            <Text style={styles.infoText}>
              You&apos;ll be able to see available drivers near you on the map and select your preferred pickup and drop-off locations.
            </Text>
          </View>
        )}

        {/* Info Card for Recurring */}
        {tripType !== "once-off" && (
          <View style={styles.infoCard}>
            <Ionicons
              name="information-circle"
              size={24}
              color="#7E2EFF"
            />
            <Text style={styles.infoText}>
              Our admin will assign a dedicated, verified driver for your{" "}
              {tripType} schedule within 24 hours.
            </Text>
          </View>
        )}

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Special Instructions (Optional)
          </Text>
          <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
            <Ionicons
              name="document-text-outline"
              size={20}
              color="#7E2EFF"
              style={{
                alignSelf: "flex-start",
                marginTop: 12,
              }}
            />
            <TextInput
              placeholder="Add any special instructions..."
              placeholderTextColor="#999"
              style={[styles.input, styles.textArea]}
              multiline
              numberOfLines={4}
              value={instructions}
              onChangeText={setInstructions}
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.button,
            (loading || loadingChildren || children.length === 0) &&
              styles.buttonDisabled,
          ]}
          onPress={handleRequest}
          disabled={loading || loadingChildren || children.length === 0}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.buttonText}>
                {tripType === "once-off"
                  ? "Find Driver"
                  : "Submit Request"}
              </Text>
              <Ionicons
                name="arrow-forward"
                size={20}
                color="#fff"
                style={{ marginLeft: 8 }}
              />
            </>
          )}
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
};

export default RequestDriverScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: "#7E2EFF",
    paddingTop: Platform.OS === "web" ? 20 : 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...Platform.select({
      web: {
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  logo: {
    backgroundColor: "#5B13CC",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logoText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
    letterSpacing: 1,
  },
  content: {
    padding: 20,
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 30,
    paddingVertical: 20,
  },
  profileIconWrapper: {
    marginBottom: 12,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  profileSubtitle: {
    color: "#666",
    fontSize: 15,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#1A1A1A",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  loadingText: {
    marginLeft: 12,
    fontSize: 14,
    color: "#666",
  },
  emptyContainer: {
    alignItems: "center",
    padding: 30,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  emptyText: {
    fontSize: 15,
    color: "#666",
    marginTop: 12,
    marginBottom: 16,
  },
  addChildButton: {
    backgroundColor: "#7E2EFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addChildText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  childInfoCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  childInfoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  childRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    ...Platform.select({
      web: {
        cursor: "pointer",
        transition: "all 0.2s",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      },
    }),
  },
  childRowTitle: {
    fontSize: 15,
    color: "#1A1A1A",
    fontWeight: "600",
  },
  childRowSubtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  tripTypeButtons: {
    flexDirection: "row",
    gap: 10,
  },
  tripTypeButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#fff",
    ...Platform.select({
      web: {
        cursor: "pointer",
        transition: "all 0.2s",
      },
    }),
  },
  tripTypeButtonActive: {
    backgroundColor: "#7E2EFF",
    borderColor: "#7E2EFF",
    ...Platform.select({
      web: {
        boxShadow: "0 4px 12px rgba(126, 46, 255, 0.3)",
      },
      default: {
        shadowColor: "#7E2EFF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
      },
    }),
  },
  tripTypeText: {
    color: "#7E2EFF",
    fontSize: 14,
    fontWeight: "600",
  },
  tripTypeTextActive: {
    color: "#fff",
  },
  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  dayButton: {
    width: 44,
    height: 44,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    ...Platform.select({
      web: {
        cursor: "pointer",
        transition: "all 0.15s",
      },
    }),
  },
  dayButtonActive: {
    backgroundColor: "#7E2EFF",
    borderColor: "#7E2EFF",
  },
  dayText: {
    color: "#666",
    fontSize: 12,
    fontWeight: "600",
  },
  dayTextActive: {
    color: "#fff",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...Platform.select({
      web: {
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
      },
    }),
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: "#1A1A1A",
    ...Platform.select({
      web: {
        outline: "none",
      } as any,
    }),
  },
  inputText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: "#1A1A1A",
  },
  picker: {
    flex: 1,
    marginLeft: 8,
    ...Platform.select({
      web: {
        border: "none",
        outline: "none",
      } as any,
    }),
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#F0E6FF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: "flex-start",
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#5B13CC",
    lineHeight: 20,
  },
  textAreaWrapper: {
    alignItems: "flex-start",
    minHeight: 100,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
    paddingTop: 8,
  },
  button: {
    backgroundColor: "#7E2EFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "center",
    ...Platform.select({
      web: {
        cursor: "pointer",
        boxShadow: "0 4px 16px rgba(126, 46, 255, 0.3)",
        transition: "all 0.2s",
      },
      default: {
        shadowColor: "#7E2EFF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
      },
    }),
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});