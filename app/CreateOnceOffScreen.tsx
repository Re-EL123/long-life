// CreateOnceOffScreen.tsx - Production OSM-Powered Trip Creation
// Uses: SafeMap (FREE OSM), GeocodingService (Photon+Nominatim), RoutingService (OSRM+Valhalla)
// All services are 100% FREE - no API keys required

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

// OLD: import { MapView, Marker, Polyline, PROVIDER_GOOGLE } from "./MapComponent";
// NEW:
import SafeMap, {
  SafeMapMarker,
  SafeMapRoute,
  Coordinate,
  MapRegion,
} from "./MapComponent";
import geocoding, { GeoResult } from "../services/geocoding";
import routing, { RouteResult } from "../services/routing";
import fareCalculator, { FareBreakdown } from "../services/fareCalculator";

// ✅ API URL
const API_BASE_URL = "https://safe-school-ride.duckdns.org";

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
  registrationNumber?: string;
  carBrand?: string;
  carModel?: string;
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
  const [region, setRegion] = useState<MapRegion>({
    latitude: -26.0667,
    longitude: 28.0667,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  // Location state
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [pickupCoords, setPickupCoords] = useState<Coordinate>({
    latitude: -26.0667,
    longitude: 28.0667,
  });
  const [dropoffCoords, setDropoffCoords] = useState<Coordinate>({
    latitude: -26.0833,
    longitude: 28.0833,
  });

  // ✅ Search State (using GeocodingService)
  const [pickupQuery, setPickupQuery] = useState("");
  const [dropoffQuery, setDropoffQuery] = useState("");
  const [pickupSuggestions, setPickupSuggestions] = useState<GeoResult[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<GeoResult[]>([]);
  const [pickupSearchLoading, setPickupSearchLoading] = useState(false);
  const [dropoffSearchLoading, setDropoffSearchLoading] = useState(false);
  const [activeInput, setActiveInput] = useState<"pickup" | "dropoff" | null>(
    null
  );

  // ✅ Route State (using RoutingService)
  const [routeData, setRouteData] = useState<RouteResult | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);

  // ✅ Fare State (using FareCalculator)
  const [fareData, setFareData] = useState<FareBreakdown | null>(null);

  // Drivers state
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [loadingDrivers, setLoadingDrivers] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"locations" | "drivers" | "confirm">(
    "locations"
  );

  const mapRef = useRef<any>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ Parse trip data on mount
  useEffect(() => {
    if (params.tripData) {
      try {
        const data = JSON.parse(params.tripData as string);
        setTripData(data);
        console.log("[CreateOnceOff] Trip data loaded:", data);

        if (data.children && data.children.length > 0) {
          const child = data.children[0];
          setPickupLocation(child.homeAddress);
          setPickupQuery(child.homeAddress);
          setDropoffLocation(child.schoolAddress);
          setDropoffQuery(child.schoolAddress);

          // Geocode addresses using the service
          handleGeocodeAddress(child.homeAddress, "pickup");
          handleGeocodeAddress(child.schoolAddress, "dropoff");
        }
      } catch (error) {
        console.error("[CreateOnceOff] Error parsing trip data:", error);
        showAlert("Error", "Invalid trip data");
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

  // ✅ Calculate route when both locations change
  useEffect(() => {
    if (pickupCoords && dropoffCoords) {
      handleCalculateRoute();
    }
  }, [pickupCoords, dropoffCoords]);

  // ✅ Recalculate fare when route changes
  useEffect(() => {
    if (routeData && tripData) {
      const fare = fareCalculator.calculate(
        routeData.distance,
        routeData.duration,
        tripData.children?.length || 1
      );
      setFareData(fare);
    }
  }, [routeData, tripData]);

  // ✅ Cross-platform alert helper
  const showAlert = (title: string, message: string, buttons?: any[]) => {
    if (Platform.OS === "web") {
      alert(`${title}\n\n${message}`);
      // Execute first button's onPress if exists
      if (buttons && buttons.length > 0 && buttons[0].onPress) {
        buttons[0].onPress();
      }
    } else {
      Alert.alert(title, message, buttons);
    }
  };

  // ✅ Search places using GeocodingService (Photon + Nominatim)
  const handleSearchPlaces = async (
    query: string,
    type: "pickup" | "dropoff"
  ) => {
    if (!query || query.trim().length < 3) {
      if (type === "pickup") setPickupSuggestions([]);
      else setDropoffSuggestions([]);
      return;
    }

    try {
      if (type === "pickup") setPickupSearchLoading(true);
      else setDropoffSearchLoading(true);

      const results = await geocoding.search(query, {
        country: "za",
        limit: 8,
        near: { lat: region.latitude, lng: region.longitude },
        language: "en",
      });

      console.log(`[Search ${type}]:`, results.length, "results");

      if (type === "pickup") setPickupSuggestions(results);
      else setDropoffSuggestions(results);
    } catch (error) {
      console.error(`[Search ${type}] Error:`, error);
      if (type === "pickup") setPickupSuggestions([]);
      else setDropoffSuggestions([]);
    } finally {
      if (type === "pickup") setPickupSearchLoading(false);
      else setDropoffSearchLoading(false);
    }
  };

  // ✅ Geocode a single address using GeocodingService
  const handleGeocodeAddress = async (
    address: string,
    type: "pickup" | "dropoff"
  ) => {
    try {
      const coords = await geocoding.geocodeAddress(address, "za");

      if (coords) {
        if (type === "pickup") {
          setPickupCoords(coords);
          setRegion({
            ...coords,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        } else {
          setDropoffCoords(coords);
        }
        console.log(`[Geocode ${type}]:`, coords);
      } else {
        console.warn(`[Geocode ${type}] No results for:`, address);
      }
    } catch (error) {
      console.error(`[Geocode ${type}] Error:`, error);
    }
  };

  // ✅ Reverse geocode using GeocodingService
  const handleReverseGeocode = async (
    latitude: number,
    longitude: number,
    type: "pickup" | "dropoff"
  ): Promise<string> => {
    try {
      const result = await geocoding.reverseGeocode(latitude, longitude);

      if (result) {
        const address = result.shortAddress || result.address;

        if (type === "pickup") {
          setPickupLocation(address);
          setPickupQuery(address);
        } else {
          setDropoffLocation(address);
          setDropoffQuery(address);
        }

        return address;
      }

      const fallback = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      if (type === "pickup") {
        setPickupLocation(fallback);
        setPickupQuery(fallback);
      } else {
        setDropoffLocation(fallback);
        setDropoffQuery(fallback);
      }
      return fallback;
    } catch (error) {
      console.error(`[ReverseGeocode ${type}] Error:`, error);
      const fallback = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      if (type === "pickup") {
        setPickupLocation(fallback);
        setPickupQuery(fallback);
      } else {
        setDropoffLocation(fallback);
        setDropoffQuery(fallback);
      }
      return fallback;
    }
  };

  // ✅ Calculate route using RoutingService (OSRM + Valhalla)
  const handleCalculateRoute = async () => {
    if (!pickupCoords || !dropoffCoords) return;

    // Avoid recalculating if coords haven't meaningfully changed
    const isSameLocation =
      Math.abs(pickupCoords.latitude - dropoffCoords.latitude) < 0.0001 &&
      Math.abs(pickupCoords.longitude - dropoffCoords.longitude) < 0.0001;

    if (isSameLocation) return;

    setRouteLoading(true);
    try {
      const result = await routing.getRoute(pickupCoords, dropoffCoords, {
        profile: "driving",
        steps: true,
      });

      if (result) {
        setRouteData(result);
        console.log(
          "[Route] Distance:",
          formatDistance(result.distance),
          "Duration:",
          formatDuration(result.duration)
        );
      } else {
        console.warn("[Route] No route found");
      }
    } catch (error) {
      console.error("[Route] Error:", error);
    } finally {
      setRouteLoading(false);
    }
  };

  // ✅ Handle pickup input change with debounced search
  const handlePickupChange = (text: string) => {
    setPickupQuery(text);
    setPickupLocation(text);
    setActiveInput("pickup");

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      handleSearchPlaces(text, "pickup");
    }, 350);
  };

  // ✅ Handle dropoff input change with debounced search
  const handleDropoffChange = (text: string) => {
    setDropoffQuery(text);
    setDropoffLocation(text);
    setActiveInput("dropoff");

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      handleSearchPlaces(text, "dropoff");
    }, 350);
  };

  // ✅ Select pickup suggestion
  const handleSelectPickupSuggestion = (place: GeoResult) => {
    const coords = {
      latitude: place.latitude,
      longitude: place.longitude,
    };

    const address = place.shortAddress || place.address;
    setPickupLocation(address);
    setPickupQuery(address);
    setPickupCoords(coords);
    setPickupSuggestions([]);
    setActiveInput(null);

    setRegion({
      ...coords,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    });
  };

  // ✅ Select dropoff suggestion
  const handleSelectDropoffSuggestion = (place: GeoResult) => {
    const coords = {
      latitude: place.latitude,
      longitude: place.longitude,
    };

    const address = place.shortAddress || place.address;
    setDropoffLocation(address);
    setDropoffQuery(address);
    setDropoffCoords(coords);
    setDropoffSuggestions([]);
    setActiveInput(null);

    setRegion({
      ...coords,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    });
  };

  // ✅ Handle map press - uses SafeMap coordinate callback
  const handleMapPress = async (coordinate: Coordinate) => {
    const { latitude, longitude } = coordinate;
    const type = activeInput || "pickup";

    const address = await handleReverseGeocode(latitude, longitude, type);

    if (type === "pickup") {
      setPickupCoords({ latitude, longitude });
    } else {
      setDropoffCoords({ latitude, longitude });
    }
  };

  // ✅ Handle marker press
  const handleMarkerPress = (markerId: string) => {
    // Check if it's a driver marker
    const driver = drivers.find((d) => d._id === markerId);
    if (driver) {
      handleSelectDriver(driver);
    }
  };

  // ✅ Use home address
  const useHomeAddress = () => {
    if (tripData?.children && tripData.children.length > 0) {
      const homeAddr = tripData.children[0].homeAddress;
      setPickupLocation(homeAddr);
      setPickupQuery(homeAddr);
      handleGeocodeAddress(homeAddr, "pickup");
      showAlert("Pickup Set", `Pickup location set to: ${homeAddr}`);
    }
  };

  // ✅ Use school address
  const useSchoolAddress = () => {
    if (tripData?.children && tripData.children.length > 0) {
      const schoolAddr = tripData.children[0].schoolAddress;
      setDropoffLocation(schoolAddr);
      setDropoffQuery(schoolAddr);
      handleGeocodeAddress(schoolAddr, "dropoff");
      showAlert("Drop-off Set", `Drop-off location set to: ${schoolAddr}`);
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
        `${API_BASE_URL}/api/user/drivers/available?lat=${pickupCoords.latitude}&lng=${pickupCoords.longitude}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      console.log("[Drivers Response]:", data);

      if (response.ok && data.drivers && data.drivers.length > 0) {
        setDrivers(data.drivers);
        setStep("drivers");
      } else {
        // Fallback mock drivers for development
        const mockDrivers: Driver[] = [
          {
            _id: "driver1",
            name: "Thabo Molefe",
            vehicle: "Toyota Corolla",
            registrationNumber: "ABC123GP",
            carBrand: "Toyota",
            carModel: "Corolla",
            rating: 4.8,
            distance: 1.2,
            latitude: pickupCoords.latitude + 0.005,
            longitude: pickupCoords.longitude + 0.005,
            available: true,
          },
          {
            _id: "driver2",
            name: "Nombuso Khumalo",
            vehicle: "Honda Civic",
            registrationNumber: "XYZ789GP",
            carBrand: "Honda",
            carModel: "Civic",
            rating: 4.9,
            distance: 2.1,
            latitude: pickupCoords.latitude - 0.008,
            longitude: pickupCoords.longitude + 0.003,
            available: true,
          },
          {
            _id: "driver3",
            name: "Sipho Dlamini",
            vehicle: "Nissan Almera",
            registrationNumber: "DEF456GP",
            carBrand: "Nissan",
            carModel: "Almera",
            rating: 4.7,
            distance: 3.5,
            latitude: pickupCoords.latitude + 0.01,
            longitude: pickupCoords.longitude - 0.007,
            available: true,
          },
        ];

        setDrivers(mockDrivers);
        setStep("drivers");
        showAlert("Info", "Showing available drivers in your area");
      }
    } catch (error) {
      console.error("[Fetch Drivers] Error:", error);
      showAlert("Error", "Failed to fetch drivers. Please try again.");
    } finally {
      setLoadingDrivers(false);
    }
  };

  // ✅ Handle driver selection
  const handleSelectDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setStep("confirm");

    setRegion({
      latitude: driver.latitude,
      longitude: driver.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    });
  };

  // ✅ Create trip with driver notification
  const handleCreateTrip = async () => {
    if (!selectedDriver) {
      showAlert("Error", "Please select a driver");
      return;
    }

    if (!routeData) {
      showAlert("Error", "Route calculation in progress. Please wait.");
      return;
    }

    if (!fareData) {
      showAlert("Error", "Fare calculation in progress. Please wait.");
      return;
    }

    setLoading(true);
    try {
      const token =
        (await AsyncStorage.getItem("userToken")) ||
        (await AsyncStorage.getItem("token"));

      const tripPayload = {
        tripType: "once-off",
        parentId: tripData?.parentId,
        parentName: tripData?.parentName,
        driverId: selectedDriver._id,
        driverName: selectedDriver.name,
        driverVehicle: `${selectedDriver.carBrand} ${selectedDriver.carModel} - ${selectedDriver.registrationNumber}`,
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
        route: {
          distance: routeData.distance,
          duration: routeData.duration,
          coordinates: routeData.coordinates,
        },
        activity: tripData?.activity,
        instructions: tripData?.instructions,
        children: tripData?.children,
        status: "pending",
        fare: fareData.total,
        fareBreakdown: fareData,
        estimatedDuration: Math.ceil(routeData.duration / 60),
        estimatedDistance: (routeData.distance / 1000).toFixed(2),
        createdAt: new Date().toISOString(),
      };

      console.log("[Create Trip] Payload:", tripPayload);

      const response = await fetch(`${API_BASE_URL}/api/trips/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tripPayload),
      });

      const result = await response.json();
      console.log("[Create Trip] Response:", result);

      if (response.ok && result.success) {
        const successMessage =
          `✅ Trip Request Sent!\n\n` +
          `Driver: ${selectedDriver.name}\n` +
          `Vehicle: ${selectedDriver.carBrand} ${selectedDriver.carModel}\n` +
          `Registration: ${selectedDriver.registrationNumber}\n` +
          `Estimated Fare: R${fareData.total}\n` +
          `Distance: ${(routeData.distance / 1000).toFixed(1)} km\n` +
          `Duration: ${Math.ceil(routeData.duration / 60)} min\n\n` +
          `The driver will receive your request and can accept or decline.`;

        showAlert("Trip Request Sent", successMessage, [
          {
            text: "View Trips",
            onPress: () => {
              router.push("/(tabs)/trips" as any);
            },
          },
        ]);
      } else {
        showAlert("Error", result.message || "Failed to create trip");
      }
    } catch (error) {
      console.error("[Create Trip] Error:", error);
      showAlert("Error", "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Continue to driver selection
  const handleContinue = () => {
    if (!pickupLocation || !dropoffLocation) {
      showAlert("Error", "Please set both pickup and drop-off locations");
      return;
    }

    if (!routeData) {
      showAlert("Info", "Calculating route. Please wait...");
      return;
    }

    fetchDrivers();
  };

  // ✅ Format helpers
  const formatDistance = (meters: number) => {
    const km = meters / 1000;
    return km < 1 ? `${Math.round(meters)} m` : `${km.toFixed(1)} km`;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.ceil(seconds / 60);
    return minutes < 60
      ? `${minutes} min`
      : `${Math.floor(minutes / 60)}h ${minutes % 60}min`;
  };

  // ✅ Build map markers
  const buildMapMarkers = (): SafeMapMarker[] => {
    const mapMarkers: SafeMapMarker[] = [
      {
        id: "pickup",
        coordinate: pickupCoords,
        title: "Pickup",
        description: pickupLocation,
        type: "pickup",
      },
      {
        id: "dropoff",
        coordinate: dropoffCoords,
        title: "Drop-off",
        description: dropoffLocation,
        type: "dropoff",
      },
    ];

    // Add driver markers
    drivers.forEach((driver) => {
      mapMarkers.push({
        id: driver._id,
        coordinate: {
          latitude: driver.latitude,
          longitude: driver.longitude,
        },
        title: driver.name,
        description: `${driver.carBrand} ${driver.carModel} - ${driver.registrationNumber}`,
        type: "driver",
        selected: selectedDriver?._id === driver._id,
      });
    });

    return mapMarkers;
  };

  // ✅ Build map routes
  const buildMapRoutes = (): SafeMapRoute[] => {
    if (!routeData || !routeData.coordinates || routeData.coordinates.length < 2) {
      return [];
    }

    return [
      {
        coordinates: routeData.coordinates,
        color: "#7E2EFF",
        width: 4,
      },
    ];
  };

  // ✅ Render suggestions list
  const renderSuggestions = (
    suggestions: GeoResult[],
    isLoading: boolean,
    type: "pickup" | "dropoff"
  ) => {
    if (activeInput !== type) return null;

    if (isLoading) {
      return (
        <View style={styles.suggestionsContainer}>
          <View style={styles.suggestionsLoading}>
            <ActivityIndicator size="small" color="#7E2EFF" />
            <Text style={styles.loadingText}>Searching locations...</Text>
          </View>
        </View>
      );
    }

    if (suggestions.length === 0) return null;

    return (
      <ScrollView
        style={styles.suggestionsContainer}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
        {suggestions.map((place, index) => (
          <TouchableOpacity
            key={`${place.id}-${index}`}
            style={styles.suggestionItem}
            onPress={() =>
              type === "pickup"
                ? handleSelectPickupSuggestion(place)
                : handleSelectDropoffSuggestion(place)
            }
          >
            <Ionicons name="location-outline" size={18} color="#666" />
            <View style={styles.suggestionTextContainer}>
              <Text style={styles.suggestionText} numberOfLines={2}>
                {place.shortAddress || place.address}
              </Text>
              {place.city && (
                <Text style={styles.suggestionSubtext}>
                  {place.city}
                  {place.state && `, ${place.state}`}
                  {place.postcode && ` ${place.postcode}`}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  // ✅ RENDER
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Trip</Text>
        <View style={styles.logo}>
          <Text style={styles.logoText}>SAFE</Text>
        </View>
      </View>

      {/* ✅ SafeMap - Universal map component (works on all platforms) */}
      <SafeMap
        region={region}
        markers={buildMapMarkers()}
        routes={buildMapRoutes()}
        onMapPress={handleMapPress}
        onMarkerPress={handleMarkerPress}
        onRegionChange={(newRegion) => setRegion(newRegion)}
        showUserLocation={false}
      />

      {/* Route loading banner */}
      {routeLoading && (
        <View style={styles.routeLoadingBanner}>
          <ActivityIndicator size="small" color="#fff" />
          <Text style={styles.routeLoadingText}>
            Calculating best route...
          </Text>
        </View>
      )}

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
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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

          {/* ===== STEP 1: LOCATIONS ===== */}
          {step === "locations" && (
            <View>
              <Text style={styles.sheetTitle}>Set Trip Locations</Text>
              <Text style={styles.sheetSubtext}>
                {Platform.OS === "web"
                  ? "Search for precise addresses, click the map, or use quick options"
                  : "Search, tap map, or use quick options"}
              </Text>

              {/* Pickup Location */}
              <View style={styles.locationSection}>
                <View style={styles.locationHeader}>
                  <View style={styles.locationIconCircle}>
                    <Ionicons
                      name="radio-button-on"
                      size={16}
                      color="#00C853"
                    />
                  </View>
                  <Text style={styles.locationLabel}>Pickup Location</Text>
                </View>
                <TextInput
                  style={[
                    styles.input,
                    activeInput === "pickup" && styles.inputActive,
                  ]}
                  placeholder="Search for pickup address..."
                  placeholderTextColor="#999"
                  value={pickupQuery}
                  onChangeText={handlePickupChange}
                  onFocus={() => setActiveInput("pickup")}
                />
                {renderSuggestions(
                  pickupSuggestions,
                  pickupSearchLoading,
                  "pickup"
                )}
                <TouchableOpacity
                  style={styles.quickButton}
                  onPress={useHomeAddress}
                >
                  <Ionicons name="home-outline" size={16} color="#7E2EFF" />
                  <Text style={styles.quickButtonText}>Use Home Address</Text>
                </TouchableOpacity>
              </View>

              {/* Drop-off Location */}
              <View style={styles.locationSection}>
                <View style={styles.locationHeader}>
                  <View style={styles.locationIconCircle}>
                    <Ionicons name="location" size={16} color="#FF5252" />
                  </View>
                  <Text style={styles.locationLabel}>Drop-off Location</Text>
                </View>
                <TextInput
                  style={[
                    styles.input,
                    activeInput === "dropoff" && styles.inputActive,
                  ]}
                  placeholder="Search for drop-off address..."
                  placeholderTextColor="#999"
                  value={dropoffQuery}
                  onChangeText={handleDropoffChange}
                  onFocus={() => setActiveInput("dropoff")}
                />
                {renderSuggestions(
                  dropoffSuggestions,
                  dropoffSearchLoading,
                  "dropoff"
                )}
                <TouchableOpacity
                  style={styles.quickButton}
                  onPress={useSchoolAddress}
                >
                  <Ionicons name="school-outline" size={16} color="#7E2EFF" />
                  <Text style={styles.quickButtonText}>
                    Use School Address
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Route Info Card */}
              {routeData && fareData && (
                <View style={styles.routeInfoCard}>
                  <Text style={styles.routeInfoTitle}>Trip Overview</Text>
                  <View style={styles.routeInfoRow}>
                    <Ionicons name="navigate" size={16} color="#7E2EFF" />
                    <Text style={styles.routeInfoText}>
                      Distance: {formatDistance(routeData.distance)}
                    </Text>
                  </View>
                  <View style={styles.routeInfoRow}>
                    <Ionicons name="time" size={16} color="#7E2EFF" />
                    <Text style={styles.routeInfoText}>
                      Duration: {formatDuration(routeData.duration)}
                    </Text>
                  </View>
                  <View style={styles.routeInfoRow}>
                    <Ionicons name="cash" size={16} color="#00C853" />
                    <Text style={styles.routeInfoText}>
                      Estimated Fare: R{fareData.total}
                    </Text>
                  </View>
                </View>
              )}

              {/* Scheduled Details */}
              {tripData && (
                <View style={styles.tripInfo}>
                  <Text style={styles.tripInfoTitle}>Scheduled Details</Text>
                  <View style={styles.tripInfoRow}>
                    <Ionicons
                      name="calendar-outline"
                      size={16}
                      color="#666"
                    />
                    <Text style={styles.tripInfoText}>
                      {new Date(tripData.date).toLocaleDateString("en-ZA", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                  </View>
                  <View style={styles.tripInfoRow}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.tripInfoText}>
                      {tripData.pickupTime}
                    </Text>
                  </View>
                  <View style={styles.tripInfoRow}>
                    <Ionicons name="people-outline" size={16} color="#666" />
                    <Text style={styles.tripInfoText}>
                      {tripData.children.length} passenger
                      {tripData.children.length > 1 ? "s" : ""}
                    </Text>
                  </View>
                </View>
              )}

              {/* Continue Button */}
              <TouchableOpacity
                style={[
                  styles.continueButton,
                  (loadingDrivers || !routeData) && styles.buttonDisabled,
                ]}
                onPress={handleContinue}
                disabled={loadingDrivers || !routeData}
              >
                {loadingDrivers ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.continueButtonText}>
                      Find Available Drivers
                    </Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* ===== STEP 2: DRIVERS ===== */}
          {step === "drivers" && (
            <View>
              <Text style={styles.sheetTitle}>Select Driver</Text>
              <Text style={styles.sheetSubtext}>
                {drivers.length} driver{drivers.length !== 1 ? "s" : ""}{" "}
                available nearby
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
                    <Text style={styles.driverVehicle}>
                      {driver.carBrand} {driver.carModel}
                    </Text>
                    <Text style={styles.driverRegistration}>
                      {driver.registrationNumber}
                    </Text>
                    <View style={styles.driverMeta}>
                      <View style={styles.driverMetaItem}>
                        <Ionicons name="star" size={14} color="#FFB800" />
                        <Text style={styles.driverMetaText}>
                          {driver.rating}
                        </Text>
                      </View>
                      <View style={styles.driverMetaItem}>
                        <Ionicons name="navigate" size={14} color="#666" />
                        <Text style={styles.driverMetaText}>
                          {driver.distance.toFixed(1)} km away
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
                  setSelectedDriver(null);
                }}
              >
                <Ionicons name="arrow-back" size={18} color="#7E2EFF" />
                <Text style={styles.backButtonText}>Change Locations</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ===== STEP 3: CONFIRM ===== */}
          {step === "confirm" && selectedDriver && routeData && fareData && (
            <View>
              <Text style={styles.sheetTitle}>Confirm Trip Request</Text>
              <Text style={styles.sheetSubtext}>
                Driver will be notified and can accept or decline
              </Text>

              {/* Driver Card */}
              <View style={styles.confirmCard}>
                <Text style={styles.confirmLabel}>Your Driver</Text>
                <View style={styles.confirmDriverRow}>
                  <View style={styles.driverAvatarLarge}>
                    <Ionicons name="person" size={32} color="#7E2EFF" />
                  </View>
                  <View style={styles.confirmDriverInfo}>
                    <Text style={styles.confirmDriverName}>
                      {selectedDriver.name}
                    </Text>
                    <Text style={styles.confirmDriverVehicle}>
                      {selectedDriver.carBrand} {selectedDriver.carModel}
                    </Text>
                    <Text style={styles.confirmDriverRegistration}>
                      {selectedDriver.registrationNumber}
                    </Text>
                    <View style={styles.confirmDriverRating}>
                      <Ionicons name="star" size={14} color="#FFB800" />
                      <Text style={styles.confirmDriverRatingText}>
                        {selectedDriver.rating} •{" "}
                        {selectedDriver.distance.toFixed(1)} km away
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Trip Summary */}
              <View style={styles.confirmCard}>
                <Text style={styles.confirmLabel}>Trip Summary</Text>
                <View style={styles.confirmRow}>
                  <View style={styles.confirmIconCircle}>
                    <Ionicons
                      name="radio-button-on"
                      size={12}
                      color="#00C853"
                    />
                  </View>
                  <Text style={styles.confirmText} numberOfLines={2}>
                    {pickupLocation}
                  </Text>
                </View>
                <View style={styles.confirmDivider} />
                <View style={styles.confirmRow}>
                  <View style={styles.confirmIconCircle}>
                    <Ionicons name="location" size={12} color="#FF5252" />
                  </View>
                  <Text style={styles.confirmText} numberOfLines={2}>
                    {dropoffLocation}
                  </Text>
                </View>
              </View>

              {/* Route Details */}
              <View style={styles.confirmCard}>
                <Text style={styles.confirmLabel}>Route Details</Text>
                <View style={styles.confirmRow}>
                  <Ionicons name="navigate" size={16} color="#666" />
                  <Text style={styles.confirmText}>
                    {formatDistance(routeData.distance)}
                  </Text>
                </View>
                <View style={styles.confirmRow}>
                  <Ionicons name="time" size={16} color="#666" />
                  <Text style={styles.confirmText}>
                    {formatDuration(routeData.duration)} estimated
                  </Text>
                </View>
                <View style={styles.confirmRow}>
                  <Ionicons name="calendar" size={16} color="#666" />
                  <Text style={styles.confirmText}>
                    {new Date(tripData?.date || "").toLocaleDateString(
                      "en-ZA"
                    )}{" "}
                    at {tripData?.pickupTime}
                  </Text>
                </View>
              </View>

              {/* Fare Breakdown */}
              <View style={styles.fareCard}>
                <View style={styles.fareRow}>
                  <Text style={styles.fareLabel}>Base Fare</Text>
                  <Text style={styles.fareValue}>
                    R{fareData.baseFare}
                  </Text>
                </View>
                <View style={styles.fareRow}>
                  <Text style={styles.fareLabel}>
                    Distance (
                    {(routeData.distance / 1000).toFixed(1)} km)
                  </Text>
                  <Text style={styles.fareValue}>
                    R{fareData.distanceFare}
                  </Text>
                </View>
                <View style={styles.fareRow}>
                  <Text style={styles.fareLabel}>
                    Time ({Math.ceil(routeData.duration / 60)} min)
                  </Text>
                  <Text style={styles.fareValue}>
                    R{fareData.timeFare}
                  </Text>
                </View>
                {fareData.childrenFare > 0 && (
                  <View style={styles.fareRow}>
                    <Text style={styles.fareLabel}>
                      Additional Children
                    </Text>
                    <Text style={styles.fareValue}>
                      R{fareData.childrenFare}
                    </Text>
                  </View>
                )}
                {fareData.discount > 0 && (
                  <View style={styles.fareRow}>
                    <Text style={[styles.fareLabel, { color: "#00C853" }]}>
                      Discount
                    </Text>
                    <Text style={[styles.fareValue, { color: "#00C853" }]}>
                      -R{fareData.discount}
                    </Text>
                  </View>
                )}
                <View style={styles.fareDivider} />
                <View style={styles.fareRow}>
                  <Text style={styles.fareTotalLabel}>Total Fare</Text>
                  <Text style={styles.fareTotalValue}>
                    R{fareData.total}
                  </Text>
                </View>
              </View>

              {/* Create Trip Button */}
              <TouchableOpacity
                style={[
                  styles.createButton,
                  loading && styles.buttonDisabled,
                ]}
                onPress={handleCreateTrip}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.createButtonText}>
                      Send Trip Request
                    </Text>
                    <Ionicons name="paper-plane" size={20} color="#fff" />
                  </>
                )}
              </TouchableOpacity>

              {/* Back Button */}
              <TouchableOpacity
                style={styles.backButtonBottom}
                onPress={() => {
                  setStep("drivers");
                  setSelectedDriver(null);
                }}
              >
                <Ionicons name="arrow-back" size={18} color="#7E2EFF" />
                <Text style={styles.backButtonText}>
                  Choose Different Driver
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

// ============================================
// STYLES
// ============================================
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
      } as any,
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
  routeLoadingBanner: {
    position: "absolute",
    top: Platform.OS === "web" ? 80 : 110,
    left: 20,
    right: 20,
    backgroundColor: "rgba(126, 46, 255, 0.95)",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    zIndex: 5,
  },
  routeLoadingText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
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
    maxHeight: "70%",
    ...Platform.select({
      web: {
        boxShadow: "0 -4px 12px rgba(0,0,0,0.15)",
      } as any,
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
    marginBottom: 4,
  },
  sheetSubtext: {
    fontSize: 13,
    color: "#999",
    marginBottom: 20,
  },
  locationSection: {
    marginBottom: 20,
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  locationIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F8F9FA",
    alignItems: "center",
    justifyContent: "center",
  },
  locationLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: "#1A1A1A",
    backgroundColor: "#F8F9FA",
  },
  inputActive: {
    borderColor: "#7E2EFF",
    backgroundColor: "#fff",
  },
  suggestionsContainer: {
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    maxHeight: 250,
    ...Platform.select({
      web: {
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      } as any,
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
    }),
  },
  suggestionsLoading: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: "#666",
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    gap: 12,
  },
  suggestionTextContainer: {
    flex: 1,
  },
  suggestionText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 18,
    fontWeight: "500",
  },
  suggestionSubtext: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  quickButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    paddingVertical: 8,
  },
  quickButtonText: {
    fontSize: 13,
    color: "#7E2EFF",
    fontWeight: "600",
  },
  routeInfoCard: {
    backgroundColor: "#F0E6FF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  routeInfoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#5B13CC",
    marginBottom: 12,
  },
  routeInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  routeInfoText: {
    fontSize: 13,
    color: "#5B13CC",
    fontWeight: "600",
  },
  tripInfo: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  tripInfoTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tripInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  tripInfoText: {
    fontSize: 13,
    color: "#333",
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
      web: {
        boxShadow: "0 4px 12px rgba(126,46,255,0.3)",
      } as any,
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
    opacity: 0.5,
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
  driverAvatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F0E6FF",
    alignItems: "center",
    justifyContent: "center",
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
    marginBottom: 2,
  },
  driverRegistration: {
    fontSize: 12,
    color: "#999",
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
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  confirmLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#999",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  confirmDriverRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  confirmDriverInfo: {
    flex: 1,
  },
  confirmDriverName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  confirmDriverVehicle: {
    fontSize: 13,
    color: "#666",
    marginBottom: 2,
  },
  confirmDriverRegistration: {
    fontSize: 12,
    color: "#999",
    marginBottom: 6,
  },
  confirmDriverRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  confirmDriverRatingText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  confirmRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 10,
  },
  confirmIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  confirmText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  confirmDivider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 8,
    marginLeft: 36,
  },
  fareCard: {
    backgroundColor: "#F0E6FF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  fareRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  fareLabel: {
    fontSize: 13,
    color: "#5B13CC",
  },
  fareValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#5B13CC",
  },
  fareDivider: {
    height: 1,
    backgroundColor: "#D1C4E9",
    marginVertical: 12,
  },
  fareTotalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#5B13CC",
  },
  fareTotalValue: {
    fontSize: 24,
    fontWeight: "800",
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
      web: {
        boxShadow: "0 4px 12px rgba(0,200,83,0.3)",
      } as any,
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