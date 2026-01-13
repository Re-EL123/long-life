// RequestDriverScreen.tsx - Enhanced Cross-Platform Version
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
    Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

// ✅ Enhanced Web-compatible date/time picker
const CrossPlatformDateTimePicker = Platform.OS === 'web' 
  ? ({ mode, value, onChange }: any) => {
      const inputType = mode === 'time' ? 'time' : 'date';
      
      // ✅ IMPROVED: Better date formatting for web
      const formattedValue = mode === 'time' 
        ? value.toTimeString().slice(0, 5)
        : value.toISOString().split('T')[0];

      return (
        <input
          type={inputType}
          value={formattedValue}
          onChange={(e) => {
            const newDate = mode === 'time'
              ? new Date(`1970-01-01T${e.target.value}`)
              : new Date(e.target.value + 'T00:00:00'); // ✅ FIXED: Prevent timezone issues
            onChange(null, newDate);
          }}
          style={{
            padding: 12,
            borderRadius: 8,
            border: '1px solid #E0E0E0',
            fontSize: 15,
            width: '100%',
            fontFamily: 'inherit',
            backgroundColor: '#fff',
            color: '#1A1A1A',
          }}
        />
      );
    }
  : require('@react-native-community/datetimepicker').default;

// ✅ Your actual Vercel API URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://temp-weld-rho.vercel.app';

const RequestDriverScreen = () => {
  // State
  const [tripType, setTripType] = useState("once-off");
  const [activity, setActivity] = useState("");
  const [date, setDate] = useState(new Date());
  const [pickupTime, setPickupTime] = useState(new Date());
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [instructions, setInstructions] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [pickupSuggestions, setPickupSuggestions] = useState<string[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<string[]>([]);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);

  // ✅ Animation values - Native only
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // ✅ Entry animation - Native only
  useEffect(() => {
    if (Platform.OS !== 'web') {
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

  // ✅ Day selection toggle
  const toggleDay = (day: string) => {
    // ✅ Simple feedback animation for native only
    if (Platform.OS !== 'web') {
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

    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS !== 'web') {
      setShowDatePicker(Platform.OS === 'ios');
    }
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS !== 'web') {
      setShowTimePicker(Platform.OS === 'ios');
    }
    if (selectedTime) {
      setPickupTime(selectedTime);
    }
  };

  // ✅ Location autocomplete with debounce prevention
  const handleLocationSearch = (text: string, isPickup: boolean) => {
    if (isPickup) {
      setPickupLocation(text);
      if (text.length > 2) {
        setPickupSuggestions([
          `${text} - Midrand, Johannesburg`,
          `${text} - Sandton, Johannesburg`,
          `${text} - Centurion, Pretoria`,
        ]);
        setShowPickupSuggestions(true);
      } else {
        setShowPickupSuggestions(false);
      }
    } else {
      setDropoffLocation(text);
      if (text.length > 2) {
        setDropoffSuggestions([
          `${text} - Midrand Primary School`,
          `${text} - Soccer Academy`,
          `${text} - Swimming Club`,
        ]);
        setShowDropoffSuggestions(true);
      } else {
        setShowDropoffSuggestions(false);
      }
    }
  };

  const selectSuggestion = (suggestion: string, isPickup: boolean) => {
    if (isPickup) {
      setPickupLocation(suggestion);
      setShowPickupSuggestions(false);
    } else {
      setDropoffLocation(suggestion);
      setShowDropoffSuggestions(false);
    }
  };

  const handleRequest = async () => {
    // Validation
    if (!pickupLocation || !dropoffLocation) {
      if (Platform.OS === 'web') {
        alert("Please fill in all required fields");
      } else {
        Alert.alert("Error", "Please fill in all required fields");
      }
      return;
    }

    if ((tripType === "weekly" || tripType === "monthly") && selectedDays.length === 0) {
      if (Platform.OS === 'web') {
        alert("Please select at least one day for recurring trips");
      } else {
        Alert.alert("Error", "Please select at least one day for recurring trips");
      }
      return;
    }

    // Mock coordinates - integrate with actual location services
    const pickupCoords = {
      latitude: -26.0667,
      longitude: 28.0667,
    };

    const dropoffCoords = {
      latitude: -26.0833,
      longitude: 28.0833,
    };

    const requestData = {
      childName: "Micheal williams",
      childId: "REPLACE_WITH_ACTUAL_CHILD_ID",
      parentId: "REPLACE_WITH_ACTUAL_PARENT_ID",
      school: "midrand primary school",
      tripType,
      date: date.toISOString(),
      pickupTime: pickupTime.toTimeString().slice(0, 5),
      pickupLocation: {
        latitude: pickupCoords.latitude,
        longitude: pickupCoords.longitude,
        address: pickupLocation,
      },
      dropoffLocation: {
        latitude: dropoffCoords.latitude,
        longitude: dropoffCoords.longitude,
        address: dropoffLocation,
      },
      activity,
      instructions,
      selectedDays: tripType !== "once-off" ? selectedDays : [],
    };

    const message = tripType === "once-off"
      ? "This will be sent to available drivers near your location."
      : `This ${tripType} trip request will be sent to admin for driver assignment.`;

    const confirmAction = async () => {
      setLoading(true);
      try {
        console.log('🚀 Sending request to:', `${API_BASE_URL}/api/trips/create-request`);
        console.log('📦 Request data:', requestData);

        const response = await fetch(`${API_BASE_URL}/api/trips/create-request`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });

        const result = await response.json();
        console.log('✅ Response:', result);

        if (response.ok && result.success) {
          if (Platform.OS === 'web') {
            alert(result.message);
            router.back();
          } else {
            Alert.alert("Success", result.message, [
              { text: "OK", onPress: () => router.back() }
            ]);
          }
        } else {
          const errorMsg = result.message || "Failed to submit request";
          console.error('❌ Error response:', errorMsg);
          if (Platform.OS === 'web') {
            alert(errorMsg);
          } else {
            Alert.alert("Error", errorMsg);
          }
        }
      } catch (error) {
        console.error('❌ Network error:', error);
        const errorMsg = "Network error. Please check your connection and try again.";
        if (Platform.OS === 'web') {
          alert(errorMsg);
        } else {
          Alert.alert("Error", errorMsg);
        }
      } finally {
        setLoading(false);
      }
    };

    if (Platform.OS === 'web') {
      if (confirm(`${message}\n\nDo you want to continue?`)) {
        await confirmAction();
      }
    } else {
      Alert.alert("Confirm Request", message, [
        { text: "Cancel", style: "cancel" },
        { text: "Submit", style: "destructive", onPress: confirmAction },
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
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
          // ✅ Apply animations only on native platforms
          Platform.OS !== 'web' && {
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
          <Text style={styles.profileName}>Micheal Williams</Text>
          <Text style={styles.profileSubtitle}>Midrand Primary School</Text>
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
                    type === "once-off" ? "flash" : 
                    type === "weekly" ? "calendar" : "repeat"
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
                      selectedDays.includes(day) && styles.dayTextActive,
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
          {Platform.OS === 'web' ? (
            <View style={styles.inputWrapper}>
              <Ionicons name="calendar-outline" size={20} color="#7E2EFF" />
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
                <Ionicons name="calendar-outline" size={20} color="#7E2EFF" />
                <Text style={styles.inputText}>{date.toDateString()}</Text>
                <Ionicons name="chevron-down" size={20} color="#999" />
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
          {Platform.OS === 'web' ? (
            <View style={styles.inputWrapper}>
              <Ionicons name="time-outline" size={20} color="#7E2EFF" />
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
                <Ionicons name="time-outline" size={20} color="#7E2EFF" />
                <Text style={styles.inputText}>
                  {pickupTime.toTimeString().slice(0, 5)}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#999" />
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

        {/* Location Fields with Autocomplete */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Locations</Text>
          
          {/* Pickup Location */}
          <View style={styles.locationContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons name="location" size={20} color="#00C853" />
              <TextInput
                placeholder="Pickup location"
                placeholderTextColor="#999"
                style={styles.input}
                value={pickupLocation}
                onChangeText={(text) => handleLocationSearch(text, true)}
                onFocus={() => pickupLocation.length > 2 && setShowPickupSuggestions(true)}
                onBlur={() => {
                  // ✅ Delay to allow suggestion click
                  setTimeout(() => setShowPickupSuggestions(false), 200);
                }}
              />
              {pickupLocation ? (
                <TouchableOpacity onPress={() => setPickupLocation("")}>
                  <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              ) : null}
            </View>
            {showPickupSuggestions && pickupSuggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {pickupSuggestions.map((suggestion, index) => (
                  <Pressable
                    key={index}
                    style={styles.suggestionItem}
                    onPress={() => selectSuggestion(suggestion, true)}
                  >
                    <Ionicons name="location-outline" size={16} color="#666" />
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* Dropoff Location */}
          <View style={styles.locationContainer}>
            <View style={[styles.inputWrapper, { marginTop: 12 }]}>
              <Ionicons name="location" size={20} color="#FF5252" />
              <TextInput
                placeholder="Drop off location"
                placeholderTextColor="#999"
                style={styles.input}
                value={dropoffLocation}
                onChangeText={(text) => handleLocationSearch(text, false)}
                onFocus={() => dropoffLocation.length > 2 && setShowDropoffSuggestions(true)}
                onBlur={() => {
                  // ✅ Delay to allow suggestion click
                  setTimeout(() => setShowDropoffSuggestions(false), 200);
                }}
              />
              {dropoffLocation ? (
                <TouchableOpacity onPress={() => setDropoffLocation("")}>
                  <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              ) : null}
            </View>
            {showDropoffSuggestions && dropoffSuggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {dropoffSuggestions.map((suggestion, index) => (
                  <Pressable
                    key={index}
                    style={styles.suggestionItem}
                    onPress={() => selectSuggestion(suggestion, false)}
                  >
                    <Ionicons name="location-outline" size={16} color="#666" />
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Activity Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity (Optional)</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="football-outline" size={20} color="#7E2EFF" />
            <Picker
              selectedValue={activity}
              onValueChange={(value) => setActivity(value)}
              style={styles.picker}
            >
              <Picker.Item label="Select activity" value="" />
              <Picker.Item label="Soccer" value="soccer" />
              <Picker.Item label="Swimming" value="swimming" />
              <Picker.Item label="Extra Classes" value="classes" />
              <Picker.Item label="School Drop-off/Pickup" value="school" />
            </Picker>
          </View>
        </View>

        {/* Info Card for Recurring */}
        {tripType !== "once-off" && (
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color="#7E2EFF" />
            <Text style={styles.infoText}>
              Our admin will assign a dedicated, verified driver for your{" "}
              {tripType} schedule within 24 hours.
            </Text>
          </View>
        )}

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Instructions (Optional)</Text>
          <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
            <Ionicons name="document-text-outline" size={20} color="#7E2EFF" style={{ alignSelf: 'flex-start', marginTop: 12 }} />
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
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRequest}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.buttonText}>
                {tripType === "once-off" ? "Find Driver" : "Submit Request"}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
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
    paddingTop: Platform.OS === 'web' ? 20 : 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
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
        cursor: 'pointer',
        transition: 'all 0.2s',
      },
    }),
  },
  tripTypeButtonActive: {
    backgroundColor: "#7E2EFF",
    borderColor: "#7E2EFF",
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(126, 46, 255, 0.3)',
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
        cursor: 'pointer',
        transition: 'all 0.15s',
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
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
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
        outlineStyle: 'none',
      },
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
        border: 'none',
        outlineStyle: 'none',
      },
    }),
  },
  locationContainer: {
    position: "relative",
    zIndex: 1,
  },
  suggestionsContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        zIndex: 1000,
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
      },
    }),
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    ...Platform.select({
      web: {
        cursor: 'pointer',
        ':hover': {
          backgroundColor: '#F8F9FA',
        },
      },
    }),
  },
  suggestionText: {
    marginLeft: 12,
    fontSize: 14,
    color: "#333",
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
        cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(126, 46, 255, 0.3)',
        transition: 'all 0.2s',
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
