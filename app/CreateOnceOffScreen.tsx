// CreateOnceOffScreen.tsx - Web-Compatible Map-based Trip Creation
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MapView, Marker, PROVIDER_GOOGLE } from "./MapComponent";

// ✅ API URL
const API_BASE_URL ="https://safe-school-ride.duckdns.org";

// ✅ BigDataCloud API base (place autocomplete / geocoding)
const BIGDATACLOUD_PLACES_URL =
  "https://api.bigdatacloud.net/data/reverse-geocode-client"; // example endpoint for reverse geocode
// For forward search you might use a different BDC endpoint if desired.

/**
 * You can also define a type for BigDataCloud suggestions if you use a dedicated
 * autocomplete endpoint. For this example, suggestions are just generic objects.
 */
interface PlaceSuggestion {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
}

// ✅ Interfaces
interface Driver {
  _id: string;
  name: string;
  vehicle: string;
  rating: number;
  distance: number;
  latitude: number;
  longitude: number;
  available: boolean;
}

interface TripChild {
  childId: string;
  childName: string;
  school: string;
  homeAddress: string;
  schoolAddress: string;
  parentContact: string;
}

interface TripData {
  parentId: string;
  parentName: string;
  tripType: string;
  date: string;
  pickupTime: string;
  activity: string;
  instructions: string;
  children: TripChild[];
}

const CreateOnceOffScreen = () => {
  const params = useLocalSearchParams();
  const [tripData, setTripData] = useState<TripData | null>(null);

  // Map state
  const [region, setRegion] = useState({
    latitude: -26.0667,
    longitude: 28.0667,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  // Location state
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [pickupCoords, setPickupCoords] = useState({
    latitude: -26.0667,
    longitude: 28.0667,
  });
  const [dropoffCoords, setDropoffCoords] = useState({
    latitude: -26.0833,
    longitude: 28.0833,
  });
  const [isSettingPickup, setIsSettingPickup] = useState(true);

  // ✅ BigDataCloud pickup suggestions
  const [pickupQuery, setPickupQuery] = useState("");
  const [pickupSuggestions, setPickupSuggestions] = useState<PlaceSuggestion[]>([]);
  const [pickupSuggestionsLoading, setPickupSuggestionsLoading] = useState(false);

  // Drivers state
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [loadingDrivers, setLoadingDrivers] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [showDriverList, setShowDriverList] = useState(false);
  const [step, setStep] = useState<"locations" | "drivers" | "confirm">("locations");

  const mapRef = useRef<any>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // ✅ Parse trip data on mount
  useEffect(() => {
    if (params.tripData) {
      try {
        const data = JSON.parse(params.tripData as string);
        setTripData(data);
        console.log("[CreateOnceOff] Trip data loaded:", data);

        // Set initial pickup location from first child
        if (data.children && data.children.length > 0) {
          setPickupLocation(data.children[0].homeAddress);
          setPickupQuery(data.children[0].homeAddress);
          setDropoffLocation(data.children[0].schoolAddress);
        }
      } catch (error) {
        console.error("[CreateOnceOff] Error parsing trip data:", error);
        Alert.alert("Error", "Invalid trip data");
        router.back();
      }
    }
  }, [params.tripData]);

  // ✅ Animate slide up
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);

  // ✅ Handle map press to set location (Native only)
  const handleMapPress = (e: any) => {
    if (Platform.OS === "web") return;

    const { latitude, longitude } = e.nativeEvent.coordinate;

    if (isSettingPickup) {
      setPickupCoords({ latitude, longitude });
      setPickupLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      setPickupQuery(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
    } else {
      setDropoffCoords({ latitude, longitude });
      setDropoffLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
    }
  };

  // ✅ Use current location from child's home address
  const useHomeAddress = () => {
    if (tripData?.children && tripData.children.length > 0) {
      const homeAddr = tripData.children[0].homeAddress;
      setPickupLocation(homeAddr);
      setPickupQuery(homeAddr);
      if (Platform.OS === "web") {
        alert(`Pickup location set to: ${homeAddr}`);
      } else {
        Alert.alert("Pickup Set", `Pickup location set to: ${homeAddr}`);
      }
    }
  };

  // ✅ Use school address as dropoff
  const useSchoolAddress = () => {
    if (tripData?.children && tripData.children.length > 0) {
      const schoolAddr = tripData.children[0].schoolAddress;
      setDropoffLocation(schoolAddr);
      if (Platform.OS === "web") {
        alert(`Drop-off location set to: ${schoolAddr}`);
      } else {
        Alert.alert("Drop-off Set", `Drop-off location set to: ${schoolAddr}`);
      }
    }
  };

  // ✅ Fetch pickup suggestions from BigDataCloud (simple example)
  const fetchPickupSuggestions = async (query: string) => {
    // For very short input, avoid spamming API
    if (!query || query.trim().length < 3) {
      setPickupSuggestions([]);
      return;
    }

    try {
      setPickupSuggestionsLoading(true);

      // Example: if you already have coordinates, you could reverse-geocode.
      // For text search, BigDataCloud has other endpoints; adjust accordingly.
      // Here we mock suggestions based on current pickupCoords.
      const resp = await fetch(
        `${BIGDATACLOUD_PLACES_URL}?latitude=${pickupCoords.latitude}&longitude=${pickupCoords.longitude}&localityLanguage=en`
      );
      const data = await resp.json();

      // Very simple suggestion list: current coordinate + locality name
      const suggestions: PlaceSuggestion[] = [
        {
          id: "current",
          label: data.locality || query,
          latitude: pickupCoords.latitude,
          longitude: pickupCoords.longitude,
        },
      ];

      setPickupSuggestions(suggestions);
    } catch (error) {
      console.error("[CreateOnceOff] Error fetching pickup suggestions:", error);
      setPickupSuggestions([]);
    } finally {
      setPickupSuggestionsLoading(false);
    }
  };

  // ✅ Handle pickup input change (update text + trigger suggestions)
  const handlePickupChange = (text: string) => {
    setPickupLocation(text);
    setPickupQuery(text);
    fetchPickupSuggestions(text);
  };

  // ✅ When user selects a pickup suggestion
  const handleSelectPickupSuggestion = (suggestion: PlaceSuggestion) => {
    setPickupLocation(suggestion.label);
    setPickupQuery(suggestion.label);
    setPickupCoords({
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
    });
    setPickupSuggestions([]);

    // Optionally update map region (native only)
    if (Platform.OS !== "web" && mapRef.current && suggestion.latitude && suggestion.longitude) {
      mapRef.current.animateToRegion({
        latitude: suggestion.latitude,
        longitude: suggestion.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    }
  };

  // ✅ Fetch available drivers
  const fetchDrivers = async () => {
    setLoadingDrivers(true);
    try {
      const token =
        (await AsyncStorage.getItem("userToken")) ||
        (await AsyncStorage.getItem("token"));

      const response = await fetch(
        `${API_BASE_URL}/api/drivers/available?lat=${pickupCoords.latitude}&lng=${pickupCoords.longitude}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      console.log("[CreateOnceOff] Drivers response:", data);

      if (response.ok && data.drivers) {
        // Mock drivers if API doesn't return any
        const mockDrivers: Driver[] = [
          {
            _id: "driver1",
            name: "John Smith",
            vehicle: "Toyota Corolla - ABC123GP",
            rating: 4.8,
            distance: 1.2,
            latitude: pickupCoords.latitude + 0.005,
            longitude: pickupCoords.longitude + 0.005,
            available: true,
          },
          {
            _id: "driver2",
            name: "Sarah Johnson",
            vehicle: "Honda Civic - XYZ789GP",
            rating: 4.9,
            distance: 2.1,
            latitude: pickupCoords.latitude - 0.008,
            longitude: pickupCoords.longitude + 0.003,
            available: true,
          },
          {
            _id: "driver3",
            name: "Michael Williams",
            vehicle: "Nissan Almera - DEF456GP",
            rating: 4.7,
            distance: 3.5,
            latitude: pickupCoords.latitude + 0.01,
            longitude: pickupCoords.longitude - 0.007,
            available: true,
          },
        ];

        setDrivers(data.drivers.length > 0 ? data.drivers : mockDrivers);
        setStep("drivers");
        setShowDriverList(true);
      } else {
        const message =
          "No drivers available at the moment. Showing nearby drivers.";
        if (Platform.OS === "web") {
          alert(message);
        } else {
          Alert.alert("Info", message);
        }

        const mockDrivers: Driver[] = [
          {
            _id: "driver1",
            name: "John Smith",
            vehicle: "Toyota Corolla - ABC123GP",
            rating: 4.8,
            distance: 1.2,
            latitude: pickupCoords.latitude + 0.005,
            longitude: pickupCoords.longitude + 0.005,
            available: true,
          },
          {
            _id: "driver2",
            name: "Sarah Johnson",
            vehicle: "Honda Civic - XYZ789GP",
            rating: 4.9,
            distance: 2.1,
            latitude: pickupCoords.latitude - 0.008,
            longitude: pickupCoords.longitude + 0.003,
            available: true,
          },
        ];
        setDrivers(mockDrivers);
        setStep("drivers");
        setShowDriverList(true);
      }
    } catch (error) {
      console.error("[CreateOnceOff] Error fetching drivers:", error);
      const message = "Failed to fetch drivers. Please try again.";
      if (Platform.OS === "web") {
        alert(message);
      } else {
        Alert.alert("Error", message);
      }
    } finally {
      setLoadingDrivers(false);
    }
  };

  // ✅ Handle driver selection
  const handleSelectDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setShowDriverList(false);
    setStep("confirm");

    // Zoom to driver location (Native only)
    if (Platform.OS !== "web" && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: driver.latitude,
        longitude: driver.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    }
  };

  // ✅ Create once-off trip - FIXED ENDPOINT
  const handleCreateTrip = async () => {
    if (!selectedDriver) {
      const message = "Please select a driver";
      if (Platform.OS === "web") {
        alert(message);
      } else {
        Alert.alert("Error", message);
      }
      return;
    }

    setLoading(true);
    try {
      const token =
        (await AsyncStorage.getItem("userToken")) ||
        (await AsyncStorage.getItem("token"));

      const tripPayload = {
        tripType: "once-off", // ← ADDED: Required for consolidated endpoint
        parentId: tripData?.parentId,
        driverId: selectedDriver._id,
        driverName: selectedDriver.name,
        date: tripData?.date,
        pickupTime: tripData?.pickupTime,
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
        activity: tripData?.activity,
        instructions: tripData?.instructions,
        children: tripData?.children,
        status: "pending",
        fare: calculateFare(),
      };

      console.log("[CreateOnceOff] Creating trip with payload:", tripPayload);

      // ✅ FIXED: Changed from /api/trips/create-once-off to /api/trips
      const response = await fetch(
        `${API_BASE_URL}/api/trips`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(tripPayload),
        }
      );

      const result = await response.json();
      console.log("[CreateOnceOff] Trip creation response:", result);

      if (response.ok && result.success) {
        if (Platform.OS === "web") {
          alert(
            `✅ Trip Created Successfully!\n\nDriver: ${selectedDriver.name}\nEstimated Fare: R${calculateFare()}\n\nThe driver will be notified and you can track the trip in your current trips.`
          );
          router.push("/(tabs)/trips" as any);
        } else {
          Alert.alert(
            "✅ Trip Created",
            `Your trip has been created successfully!\n\nDriver: ${selectedDriver.name}\nEstimated Fare: R${calculateFare()}\n\nThe driver will be notified and you can track the trip in your current trips.`,
            [
              {
                text: "View Trips",
                onPress: () => {
                  router.push("/(tabs)/trips" as any);
                },
              },
            ]
          );
        }
      } else {
        const message = result.message || "Failed to create trip";
        if (Platform.OS === "web") {
          alert(message);
        } else {
          Alert.alert("Error", message);
        }
      }
    } catch (error) {
      console.error("[CreateOnceOff] Error creating trip:", error);
      const message = "Network error. Please try again.";
      if (Platform.OS === "web") {
        alert(message);
      } else {
        Alert.alert("Error", message);
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Calculate fare based on distance
  const calculateFare = () => {
    const distance = calculateDistance(
      pickupCoords.latitude,
      pickupCoords.longitude,
      dropoffCoords.latitude,
      dropoffCoords.longitude
    );
    const baseFare = 25;
    const perKm = 12;
    return Math.round(baseFare + distance * perKm);
  };

  // ✅ Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // ✅ Continue to driver selection
  const handleContinue = () => {
    if (!pickupLocation || !dropoffLocation) {
      const message = "Please set both pickup and drop-off locations";
      if (Platform.OS === "web") {
        alert(message);
      } else {
        Alert.alert("Error", message);
      }
      return;
    }
    fetchDrivers();
  };

  // ✅ Render Native Map
  const renderNativeMap = () => {
    if (Platform.OS === "web" || !MapView) return null;

    return (
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        onPress={handleMapPress}
      >
        {/* Pickup Marker */}
        <Marker
          coordinate={pickupCoords}
          title="Pickup Location"
          description={pickupLocation}
          pinColor="#00C853"
        >
          <View style={styles.markerContainer}>
            <Ionicons name="location" size={32} color="#00C853" />
          </View>
        </Marker>

        {/* Dropoff Marker */}
        <Marker
          coordinate={dropoffCoords}
          title="Drop-off Location"
          description={dropoffLocation}
          pinColor="#FF5252"
        >
          <View style={styles.markerContainer}>
            <Ionicons name="location" size={32} color="#FF5252" />
          </View>
        </Marker>

        {/* Driver Markers */}
        {drivers.map((driver) => (
          <Marker
            key={driver._id}
            coordinate={{
              latitude: driver.latitude,
              longitude: driver.longitude,
            }}
            title={driver.name}
            description={driver.vehicle}
          >
            <View style={styles.driverMarker}>
              <Ionicons name="car" size={24} color="#7E2EFF" />
            </View>
          </Marker>
        ))}

        {/* Selected Driver Marker */}
        {selectedDriver && (
          <Marker
            coordinate={{
              latitude: selectedDriver.latitude,
              longitude: selectedDriver.longitude,
            }}
            title={selectedDriver.name}
            description="Your Selected Driver"
          >
            <View style={styles.selectedDriverMarker}>
              <Ionicons name="car" size={28} color="#fff" />
            </View>
          </Marker>
        )}
      </MapView>
    );
  };

  // ✅ Render Web Map Placeholder
  const renderWebMap = () => {
    if (Platform.OS !== "web") return null;

    return (
      <View style={styles.webMapPlaceholder}>
        <Ionicons name="map-outline" size={64} color="#E0E0E0" />
        <Text style={styles.webMapText}>Map View</Text>
        <Text style={styles.webMapSubtext}>
          Use the fields below to set your locations
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find Driver</Text>
        <View style={styles.logo}>
          <Text style={styles.logoText}>SAFE</Text>
        </View>
      </View>

      {/* Map - Conditional Rendering */}
      {renderNativeMap()}
      {renderWebMap()}

      {/* Bottom Sheet */}
      <Animated.View
        style={[
          styles.bottomSheet,
          {
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [500, 0],
                }),
              },
            ],
          },
        ]}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Step Indicator */}
          <View style={styles.stepIndicator}>
            <View
              style={[
                styles.stepDot,
                step === "locations" && styles.stepDotActive,
              ]}
            />
            <View style={styles.stepLine} />
            <View
              style={[
                styles.stepDot,
                step === "drivers" && styles.stepDotActive,
              ]}
            />
            <View style={styles.stepLine} />
            <View
              style={[
                styles.stepDot,
                step === "confirm" && styles.stepDotActive,
              ]}
            />
          </View>

          {/* Locations Step */}
          {step === "locations" && (
            <View>
              <Text style={styles.sheetTitle}>Set Locations</Text>

              {/* Pickup Location */}
              <View style={styles.locationSection}>
                <View style={styles.locationHeader}>
                  <Ionicons name="location" size={20} color="#00C853" />
                  <Text style={styles.locationLabel}>Pickup Location</Text>
                </View>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder={
                      Platform.OS === "web"
                        ? "Enter pickup address"
                        : "Tap map or enter address"
                    }
                    placeholderTextColor="#999"
                    value={pickupLocation}
                    onChangeText={handlePickupChange}
                    onFocus={() => setIsSettingPickup(true)}
                  />
                </View>

                {/* Pickup suggestions list (BigDataCloud) */}
                {pickupSuggestionsLoading && (
                  <Text style={styles.sheetSubtitle}>Searching pickup...</Text>
                )}
                {pickupSuggestions.length > 0 && (
                  <View
                    style={{
                      marginTop: 8,
                      backgroundColor: "#fff",
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: "#E0E0E0",
                    }}
                  >
                    {pickupSuggestions.map((s) => (
                      <TouchableOpacity
                        key={s.id}
                        onPress={() => handleSelectPickupSuggestion(s)}
                        style={{
                          paddingVertical: 8,
                          paddingHorizontal: 12,
                          borderBottomWidth: 1,
                          borderBottomColor: "#F0F0F0",
                        }}
                      >
                        <Text style={{ fontSize: 13, color: "#333" }}>
                          {s.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <TouchableOpacity style={styles.quickButton} onPress={useHomeAddress}>
                  <Ionicons name="home" size={16} color="#7E2EFF" />
                  <Text style={styles.quickButtonText}>Use Home Address</Text>
                </TouchableOpacity>
              </View>

              {/* Dropoff Location */}
              <View style={styles.locationSection}>
                <View style={styles.locationHeader}>
                  <Ionicons name="location" size={20} color="#FF5252" />
                  <Text style={styles.locationLabel}>Drop-off Location</Text>
                </View>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder={
                      Platform.OS === "web"
                        ? "Enter drop-off address"
                        : "Tap map or enter address"
                    }
                    placeholderTextColor="#999"
                    value={dropoffLocation}
                    onChangeText={setDropoffLocation}
                    onFocus={() => setIsSettingPickup(false)}
                  />
                </View>
                <TouchableOpacity style={styles.quickButton} onPress={useSchoolAddress}>
                  <Ionicons name="school" size={16} color="#7E2EFF" />
                  <Text style={styles.quickButtonText}>Use School Address</Text>
                </TouchableOpacity>
              </View>

              {/* Trip Info */}
              {tripData && (
                <View style={styles.tripInfo}>
                  <Text style={styles.tripInfoTitle}>Trip Details</Text>
                  <View style={styles.tripInfoRow}>
                    <Ionicons name="calendar" size={16} color="#666" />
                    <Text style={styles.tripInfoText}>
                      {new Date(tripData.date).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.tripInfoRow}>
                    <Ionicons name="time" size={16} color="#666" />
                    <Text style={styles.tripInfoText}>{tripData.pickupTime}</Text>
                  </View>
                  <View style={styles.tripInfoRow}>
                    <Ionicons name="people" size={16} color="#666" />
                    <Text style={styles.tripInfoText}>
                      {tripData.children.length} child
                      {tripData.children.length > 1 ? "ren" : ""}
                    </Text>
                  </View>
                </View>
              )}

              {/* Continue Button */}
              <TouchableOpacity
                style={[
                  styles.continueButton,
                  loadingDrivers && styles.buttonDisabled,
                ]}
                onPress={handleContinue}
                disabled={loadingDrivers}
              >
                {loadingDrivers ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.continueButtonText}>Find Drivers</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Drivers Step */}
          {step === "drivers" && (
            <View>
              <Text style={styles.sheetTitle}>Available Drivers</Text>
              <Text style={styles.sheetSubtitle}>
                {drivers.length} driver{drivers.length !== 1 ? "s" : ""} nearby
              </Text>

              {drivers.map((driver) => (
                <TouchableOpacity
                  key={driver._id}
                  style={styles.driverCard}
                  onPress={() => handleSelectDriver(driver)}
                  activeOpacity={0.7}
                >
                  <View style={styles.driverAvatar}>
                    <Ionicons name="person" size={28} color="#7E2EFF" />
                  </View>
                  <View style={styles.driverInfo}>
                    <Text style={styles.driverName}>{driver.name}</Text>
                    <Text style={styles.driverVehicle}>{driver.vehicle}</Text>
                    <View style={styles.driverMeta}>
                      <View style={styles.driverMetaItem}>
                        <Ionicons name="star" size={14} color="#FFB800" />
                        <Text style={styles.driverMetaText}>{driver.rating}</Text>
                      </View>
                      <View style={styles.driverMetaItem}>
                        <Ionicons name="navigate" size={14} color="#666" />
                        <Text style={styles.driverMetaText}>
                          {driver.distance} km away
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={styles.backButtonBottom}
                onPress={() => {
                  setStep("locations");
                  setDrivers([]);
                  setShowDriverList(false);
                }}
              >
                <Ionicons name="arrow-back" size={18} color="#7E2EFF" />
                <Text style={styles.backButtonText}>Change Locations</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Confirm Step */}
          {step === "confirm" && selectedDriver && (
            <View>
              <Text style={styles.sheetTitle}>Confirm Trip</Text>

              {/* Selected Driver Info */}
              <View style={styles.confirmCard}>
                <Text style={styles.confirmLabel}>Selected Driver</Text>
                <View style={styles.confirmDriverRow}>
                  <View style={styles.driverAvatar}>
                    <Ionicons name="person" size={24} color="#7E2EFF" />
                  </View>
                  <View>
                    <Text style={styles.confirmDriverName}>
                      {selectedDriver.name}
                    </Text>
                    <Text style={styles.confirmDriverVehicle}>
                      {selectedDriver.vehicle}
                    </Text>
                    <View style={styles.confirmDriverRating}>
                      <Ionicons name="star" size={14} color="#FFB800" />
                      <Text style={styles.confirmDriverRatingText}>
                        {selectedDriver.rating}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Trip Summary */}
              <View style={styles.confirmCard}>
                <Text style={styles.confirmLabel}>Trip Summary</Text>
                <View style={styles.confirmRow}>
                  <Ionicons name="location" size={16} color="#00C853" />
                  <Text style={styles.confirmText}>{pickupLocation}</Text>
                </View>
                <View style={styles.confirmRow}>
                  <Ionicons name="location" size={16} color="#FF5252" />
                  <Text style={styles.confirmText}>{dropoffLocation}</Text>
                </View>
                <View style={styles.confirmRow}>
                  <Ionicons name="calendar" size={16} color="#666" />
                  <Text style={styles.confirmText}>
                    {new Date(tripData?.date || "").toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.confirmRow}>
                  <Ionicons name="time" size={16} color="#666" />
                  <Text style={styles.confirmText}>{tripData?.pickupTime}</Text>
                </View>
              </View>

              {/* Fare */}
              <View style={styles.fareCard}>
                <Text style={styles.fareLabel}>Estimated Fare</Text>
                <Text style={styles.fareAmount}>R{calculateFare()}</Text>
              </View>

              {/* Action Buttons */}
              <TouchableOpacity
                style={[styles.createButton, loading && styles.buttonDisabled]}
                onPress={handleCreateTrip}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.createButtonText}>
                      Confirm & Create Trip
                    </Text>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backButtonBottom}
                onPress={() => {
                  setStep("drivers");
                  setSelectedDriver(null);
                  setShowDriverList(true);
                }}
              >
                <Ionicons name="arrow-back" size={18} color="#7E2EFF" />
                <Text style={styles.backButtonText}>Choose Different Driver</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: "#7E2EFF",
    paddingTop: Platform.OS === "web" ? 20 : 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 10,
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
  map: {
    flex: 1,
  },
  webMapPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F9FA",
  },
  webMapText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#999",
    marginTop: 12,
  },
  webMapSubtext: {
    fontSize: 13,
    color: "#CCC",
    marginTop: 4,
  },
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  driverMarker: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: "#7E2EFF",
    ...Platform.select({
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
      },
    }),
  },
  selectedDriverMarker: {
    backgroundColor: "#7E2EFF",
    borderRadius: 25,
    padding: 10,
    borderWidth: 3,
    borderColor: "#fff",
    ...Platform.select({
      default: {
        shadowColor: "#7E2EFF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
      },
    }),
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    maxHeight: "65%",
    ...Platform.select({
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 12,
      },
    }),
  },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E0E0E0",
  },
  stepDotActive: {
    backgroundColor: "#7E2EFF",
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 8,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  sheetSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  locationSection: {
    marginBottom: 20,
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  locationLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    backgroundColor: "#F8F9FA",
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1A1A1A",
  },
  quickButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingVertical: 6,
  },
  quickButtonText: {
    fontSize: 13,
    color: "#7E2EFF",
    fontWeight: "600",
  },
  tripInfo: {
    backgroundColor: "#F0E6FF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  tripInfoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#5B13CC",
    marginBottom: 12,
  },
  tripInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  tripInfoText: {
    fontSize: 13,
    color: "#5B13CC",
  },
  continueButton: {
    backgroundColor: "#7E2EFF",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    ...Platform.select({
      default: {
        shadowColor: "#7E2EFF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
      },
    }),
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  driverCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F0E6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  driverVehicle: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
  },
  driverMeta: {
    flexDirection: "row",
    gap: 16,
  },
  driverMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  driverMetaText: {
    fontSize: 12,
    color: "#666",
  },
  backButtonBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    marginTop: 12,
  },
  backButtonText: {
    fontSize: 14,
    color: "#7E2EFF",
    fontWeight: "600",
  },
  confirmCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  confirmLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  confirmDriverRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  confirmDriverName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  confirmDriverVehicle: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
  },
  confirmDriverRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  confirmDriverRatingText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  confirmRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
  },
  confirmText: {
    flex: 1,
    fontSize: 14,
    color: "#1A1A1A",
    lineHeight: 20,
  },
  fareCard: {
    backgroundColor: "#F0E6FF",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  fareLabel: {
    fontSize: 13,
    color: "#5B13CC",
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fareAmount: {
    fontSize: 32,
    fontWeight: "700",
    color: "#7E2EFF",
  },
  createButton: {
    backgroundColor: "#00C853",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
    ...Platform.select({
      default: {
        shadowColor: "#00C853",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
      },
    }),
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default CreateOnceOffScreen;
