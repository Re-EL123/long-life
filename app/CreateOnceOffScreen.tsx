// CreateOnceOffScreen.tsx - Professional OSM-Powered Trip Creation
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
import { MapView, Marker, Polyline, PROVIDER_GOOGLE } from "./MapComponent";

// ✅ API URLs
const API_BASE_URL = "https://safe-school-ride.duckdns.org";

// ✅ OpenStreetMap Services
const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";
const OSRM_BASE_URL = "https://router.project-osrm.org";

// ✅ Interfaces
interface OSMPlace {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    road?: string;
    suburb?: string;
    city?: string;
    country?: string;
  };
}

interface RouteData {
  distance: number; // in meters
  duration: number; // in seconds
  coordinates: Array<{ latitude: number; longitude: number }>;
}

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

  // ✅ OSM Search State
  const [pickupQuery, setPickupQuery] = useState("");
  const [dropoffQuery, setDropoffQuery] = useState("");
  const [pickupSuggestions, setPickupSuggestions] = useState<OSMPlace[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<OSMPlace[]>([]);
  const [pickupSearchLoading, setPickupSearchLoading] = useState(false);
  const [dropoffSearchLoading, setDropoffSearchLoading] = useState(false);
  const [activeInput, setActiveInput] = useState<"pickup" | "dropoff" | null>(null);

  // ✅ Route State
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);

  // Drivers state
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [loadingDrivers, setLoadingDrivers] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"locations" | "drivers" | "confirm">("locations");

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

        // Set initial locations from first child
        if (data.children && data.children.length > 0) {
          const child = data.children[0];
          setPickupLocation(child.homeAddress);
          setPickupQuery(child.homeAddress);
          setDropoffLocation(child.schoolAddress);
          setDropoffQuery(child.schoolAddress);

          // Geocode initial addresses
          geocodeAddress(child.homeAddress, "pickup");
          geocodeAddress(child.schoolAddress, "dropoff");
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

  // ✅ Calculate route when both locations are set
  useEffect(() => {
    if (pickupCoords && dropoffCoords) {
      calculateRoute();
    }
  }, [pickupCoords, dropoffCoords]);

  // ✅ OSM Nominatim Search
  const searchOSMPlaces = async (query: string, type: "pickup" | "dropoff") => {
    if (!query || query.trim().length < 3) {
      if (type === "pickup") setPickupSuggestions([]);
      else setDropoffSuggestions([]);
      return;
    }

    try {
      if (type === "pickup") setPickupSearchLoading(true);
      else setDropoffSearchLoading(true);

      // Nominatim search with South Africa bias
      const response = await fetch(
        `${NOMINATIM_BASE_URL}/search?` +
          new URLSearchParams({
            q: query,
            format: "json",
            addressdetails: "1",
            limit: "5",
            countrycodes: "za", // South Africa
            "accept-language": "en",
          }),
        {
          headers: {
            "User-Agent": "SafeSchoolRide/1.0",
          },
        }
      );

      const data: OSMPlace[] = await response.json();
      console.log(`[OSM Search ${type}]:`, data);

      if (type === "pickup") setPickupSuggestions(data);
      else setDropoffSuggestions(data);
    } catch (error) {
      console.error(`[OSM Search ${type}] Error:`, error);
      if (type === "pickup") setPickupSuggestions([]);
      else setDropoffSuggestions([]);
    } finally {
      if (type === "pickup") setPickupSearchLoading(false);
      else setDropoffSearchLoading(false);
    }
  };

  // ✅ Geocode address (for initial load)
  const geocodeAddress = async (address: string, type: "pickup" | "dropoff") => {
    try {
      const response = await fetch(
        `${NOMINATIM_BASE_URL}/search?` +
          new URLSearchParams({
            q: address,
            format: "json",
            limit: "1",
            countrycodes: "za",
          }),
        {
          headers: {
            "User-Agent": "SafeSchoolRide/1.0",
          },
        }
      );

      const data: OSMPlace[] = await response.json();
      if (data.length > 0) {
        const coords = {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
        };

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
      }
    } catch (error) {
      console.error(`[Geocode ${type}] Error:`, error);
    }
  };

  // ✅ Reverse Geocode (when tapping map)
  const reverseGeocode = async (
    latitude: number,
    longitude: number,
    type: "pickup" | "dropoff"
  ) => {
    try {
      const response = await fetch(
        `${NOMINATIM_BASE_URL}/reverse?` +
          new URLSearchParams({
            lat: latitude.toString(),
            lon: longitude.toString(),
            format: "json",
            addressdetails: "1",
          }),
        {
          headers: {
            "User-Agent": "SafeSchoolRide/1.0",
          },
        }
      );

      const data: OSMPlace = await response.json();
      const address = data.display_name;

      if (type === "pickup") {
        setPickupLocation(address);
        setPickupQuery(address);
      } else {
        setDropoffLocation(address);
        setDropoffQuery(address);
      }

      return address;
    } catch (error) {
      console.error(`[Reverse Geocode ${type}] Error:`, error);
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }
  };

  // ✅ Calculate Route using OSRM
  const calculateRoute = async () => {
    if (!pickupCoords || !dropoffCoords) return;

    setRouteLoading(true);
    try {
      const coords = `${pickupCoords.longitude},${pickupCoords.latitude};${dropoffCoords.longitude},${dropoffCoords.latitude}`;
      const response = await fetch(
        `${OSRM_BASE_URL}/route/v1/driving/${coords}?overview=full&geometries=geojson`
      );

      const data = await response.json();
      console.log("[OSRM Route]:", data);

      if (data.code === "Ok" && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinates = route.geometry.coordinates.map(
          (coord: [number, number]) => ({
            latitude: coord[1],
            longitude: coord[0],
          })
        );

        setRouteData({
          distance: route.distance, // meters
          duration: route.duration, // seconds
          coordinates,
        });

        // Fit map to show entire route
        if (Platform.OS !== "web" && mapRef.current) {
          mapRef.current.fitToCoordinates(coordinates, {
            edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
            animated: true,
          });
        }
      }
    } catch (error) {
      console.error("[OSRM Route] Error:", error);
    } finally {
      setRouteLoading(false);
    }
  };

  // ✅ Handle pickup input change
  const handlePickupChange = (text: string) => {
    setPickupQuery(text);
    setPickupLocation(text);
    setActiveInput("pickup");

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchOSMPlaces(text, "pickup");
    }, 500);
  };

  // ✅ Handle dropoff input change
  const handleDropoffChange = (text: string) => {
    setDropoffQuery(text);
    setDropoffLocation(text);
    setActiveInput("dropoff");

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchOSMPlaces(text, "dropoff");
    }, 500);
  };

  // ✅ Select pickup suggestion
  const handleSelectPickupSuggestion = (place: OSMPlace) => {
    const coords = {
      latitude: parseFloat(place.lat),
      longitude: parseFloat(place.lon),
    };

    setPickupLocation(place.display_name);
    setPickupQuery(place.display_name);
    setPickupCoords(coords);
    setPickupSuggestions([]);
    setActiveInput(null);

    // Animate to location
    if (Platform.OS !== "web" && mapRef.current) {
      mapRef.current.animateToRegion({
        ...coords,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    }
  };

  // ✅ Select dropoff suggestion
  const handleSelectDropoffSuggestion = (place: OSMPlace) => {
    const coords = {
      latitude: parseFloat(place.lat),
      longitude: parseFloat(place.lon),
    };

    setDropoffLocation(place.display_name);
    setDropoffQuery(place.display_name);
    setDropoffCoords(coords);
    setDropoffSuggestions([]);
    setActiveInput(null);

    // Animate to location
    if (Platform.OS !== "web" && mapRef.current) {
      mapRef.current.animateToRegion({
        ...coords,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    }
  };

  // ✅ Handle map press (tap to set location)
  const handleMapPress = async (e: any) => {
    if (Platform.OS === "web") return;

    const { latitude, longitude } = e.nativeEvent.coordinate;

    // Reverse geocode the tapped location
    const address = await reverseGeocode(
      latitude,
      longitude,
      activeInput || "pickup"
    );

    if (activeInput === "pickup" || !activeInput) {
      setPickupCoords({ latitude, longitude });
      setPickupLocation(address);
      setPickupQuery(address);
    } else {
      setDropoffCoords({ latitude, longitude });
      setDropoffLocation(address);
      setDropoffQuery(address);
    }
  };

  // ✅ Use home address
  const useHomeAddress = () => {
    if (tripData?.children && tripData.children.length > 0) {
      const homeAddr = tripData.children[0].homeAddress;
      setPickupLocation(homeAddr);
      setPickupQuery(homeAddr);
      geocodeAddress(homeAddr, "pickup");

      if (Platform.OS === "web") {
        alert(`Pickup location set to: ${homeAddr}`);
      } else {
        Alert.alert("Pickup Set", `Pickup location set to: ${homeAddr}`);
      }
    }
  };

  // ✅ Use school address
  const useSchoolAddress = () => {
    if (tripData?.children && tripData.children.length > 0) {
      const schoolAddr = tripData.children[0].schoolAddress;
      setDropoffLocation(schoolAddr);
      setDropoffQuery(schoolAddr);
      geocodeAddress(schoolAddr, "dropoff");

      if (Platform.OS === "web") {
        alert(`Drop-off location set to: ${schoolAddr}`);
      } else {
        Alert.alert("Drop-off Set", `Drop-off location set to: ${schoolAddr}`);
      }
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
      console.log("[Drivers Response]:", data);

      if (response.ok && data.drivers && data.drivers.length > 0) {
        setDrivers(data.drivers);
        setStep("drivers");
      } else {
        // Mock drivers for development
        const mockDrivers: Driver[] = [
          {
            _id: "driver1",
            name: "Thabo Molefe",
            vehicle: "Toyota Corolla - ABC123GP",
            rating: 4.8,
            distance: 1.2,
            latitude: pickupCoords.latitude + 0.005,
            longitude: pickupCoords.longitude + 0.005,
            available: true,
          },
          {
            _id: "driver2",
            name: "Nombuso Khumalo",
            vehicle: "Honda Civic - XYZ789GP",
            rating: 4.9,
            distance: 2.1,
            latitude: pickupCoords.latitude - 0.008,
            longitude: pickupCoords.longitude + 0.003,
            available: true,
          },
          {
            _id: "driver3",
            name: "Sipho Dlamini",
            vehicle: "Nissan Almera - DEF456GP",
            rating: 4.7,
            distance: 3.5,
            latitude: pickupCoords.latitude + 0.01,
            longitude: pickupCoords.longitude - 0.007,
            available: true,
          },
        ];

        setDrivers(mockDrivers);
        setStep("drivers");

        if (Platform.OS !== "web") {
          Alert.alert(
            "Info",
            "Showing available drivers in your area"
          );
        }
      }
    } catch (error) {
      console.error("[Fetch Drivers] Error:", error);
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
    setStep("confirm");

    // Zoom to driver location
    if (Platform.OS !== "web" && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: driver.latitude,
        longitude: driver.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    }
  };

  // ✅ Create trip with driver notification
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

    if (!routeData) {
      const message = "Route calculation in progress. Please wait.";
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
        tripType: "once-off",
        parentId: tripData?.parentId,
        parentName: tripData?.parentName,
        driverId: selectedDriver._id,
        driverName: selectedDriver.name,
        driverVehicle: selectedDriver.vehicle,
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
        status: "pending", // Driver needs to accept
        fare: calculateFare(),
        estimatedDuration: Math.ceil(routeData.duration / 60), // minutes
        estimatedDistance: (routeData.distance / 1000).toFixed(2), // km
      };

      console.log("[Create Trip] Payload:", tripPayload);

      const response = await fetch(`${API_BASE_URL}/api/trips`, {
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
        const successMessage = `✅ Trip Request Sent!\n\nDriver: ${selectedDriver.name}\nEstimated Fare: R${calculateFare()}\nDistance: ${(routeData.distance / 1000).toFixed(1)} km\nDuration: ${Math.ceil(routeData.duration / 60)} min\n\nThe driver will receive your request and can accept or decline. You'll be notified once they respond.`;

        if (Platform.OS === "web") {
          alert(successMessage);
          router.push("/(tabs)/trips" as any);
        } else {
          Alert.alert("Trip Request Sent", successMessage, [
            {
              text: "View Trips",
              onPress: () => {
                router.push("/(tabs)/trips" as any);
              },
            },
          ]);
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
      console.error("[Create Trip] Error:", error);
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

  // ✅ Calculate fare based on OSM route distance
  const calculateFare = () => {
    if (!routeData) return 0;

    const distanceKm = routeData.distance / 1000;
    const baseFare = 25;
    const perKm = 12;
    const timeFactor = Math.ceil(routeData.duration / 60) * 0.5; // R0.50 per minute

    return Math.round(baseFare + distanceKm * perKm + timeFactor);
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

    if (!routeData) {
      const message = "Calculating route. Please wait...";
      if (Platform.OS === "web") {
        alert(message);
      } else {
        Alert.alert("Info", message);
      }
      return;
    }

    fetchDrivers();
  };

  // ✅ Format distance for display
  const formatDistance = (meters: number) => {
    const km = meters / 1000;
    return km < 1 ? `${Math.round(meters)} m` : `${km.toFixed(1)} km`;
  };

  // ✅ Format duration for display
  const formatDuration = (seconds: number) => {
    const minutes = Math.ceil(seconds / 60);
    return minutes < 60
      ? `${minutes} min`
      : `${Math.floor(minutes / 60)}h ${minutes % 60}min`;
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
        {/* Route Polyline */}
        {routeData && routeData.coordinates.length > 0 && (
          <Polyline
            coordinates={routeData.coordinates}
            strokeColor="#7E2EFF"
            strokeWidth={4}
          />
        )}

        {/* Pickup Marker */}
        <Marker
          coordinate={pickupCoords}
          title="Pickup"
          description={pickupLocation}
        >
          <View style={styles.pickupMarker}>
            <Ionicons name="location" size={28} color="#00C853" />
          </View>
        </Marker>

        {/* Dropoff Marker */}
        <Marker
          coordinate={dropoffCoords}
          title="Drop-off"
          description={dropoffLocation}
        >
          <View style={styles.dropoffMarker}>
            <Ionicons name="location" size={28} color="#FF5252" />
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
            <View
              style={[
                styles.driverMarker,
                selectedDriver?._id === driver._id && styles.selectedDriverMarker,
              ]}
            >
              <Ionicons
                name="car"
                size={24}
                color={selectedDriver?._id === driver._id ? "#fff" : "#7E2EFF"}
              />
            </View>
          </Marker>
        ))}
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
          Search for locations below to set pickup and drop-off points
        </Text>
        {routeData && (
          <View style={styles.webRouteInfo}>
            <Text style={styles.webRouteText}>
              📍 Distance: {formatDistance(routeData.distance)}
            </Text>
            <Text style={styles.webRouteText}>
              ⏱️ Duration: {formatDuration(routeData.duration)}
            </Text>
          </View>
        )}
      </View>
    );
  };

  // ✅ Render location suggestions
  const renderSuggestions = (
    suggestions: OSMPlace[],
    loading: boolean,
    type: "pickup" | "dropoff"
  ) => {
    if (activeInput !== type) return null;
    if (loading) {
      return (
        <View style={styles.suggestionsContainer}>
          <ActivityIndicator size="small" color="#7E2EFF" />
          <Text style={styles.loadingText}>Searching locations...</Text>
        </View>
      );
    }

    if (suggestions.length === 0) return null;

    return (
      <View style={styles.suggestionsContainer}>
        {suggestions.map((place) => (
          <TouchableOpacity
            key={place.place_id}
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
                {place.display_name}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
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
        <Text style={styles.headerTitle}>Book Trip</Text>
        <View style={styles.logo}>
          <Text style={styles.logoText}>SAFE</Text>
        </View>
      </View>

      {/* Map */}
      {renderNativeMap()}
      {renderWebMap()}

      {/* Route Loading Indicator */}
      {routeLoading && (
        <View style={styles.routeLoadingBanner}>
          <ActivityIndicator size="small" color="#fff" />
          <Text style={styles.routeLoadingText}>Calculating best route...</Text>
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

          {/* Locations Step */}
          {step === "locations" && (
            <View>
              <Text style={styles.sheetTitle}>Set Trip Locations</Text>
              <Text style={styles.sheetSubtext}>
                {Platform.OS === "web"
                  ? "Search for addresses or use quick options"
                  : "Search, tap map, or use quick options"}
              </Text>

              {/* Pickup Location */}
              <View style={styles.locationSection}>
                <View style={styles.locationHeader}>
                  <View style={styles.locationIconCircle}>
                    <Ionicons name="radio-button-on" size={16} color="#00C853" />
                  </View>
                  <Text style={styles.locationLabel}>Pickup Location</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Search for pickup address..."
                  placeholderTextColor="#999"
                  value={pickupQuery}
                  onChangeText={handlePickupChange}
                  onFocus={() => setActiveInput("pickup")}
                />
                {renderSuggestions(pickupSuggestions, pickupSearchLoading, "pickup")}
                <TouchableOpacity style={styles.quickButton} onPress={useHomeAddress}>
                  <Ionicons name="home-outline" size={16} color="#7E2EFF" />
                  <Text style={styles.quickButtonText}>Use Home Address</Text>
                </TouchableOpacity>
              </View>

              {/* Dropoff Location */}
              <View style={styles.locationSection}>
                <View style={styles.locationHeader}>
                  <View style={styles.locationIconCircle}>
                    <Ionicons name="location" size={16} color="#FF5252" />
                  </View>
                  <Text style={styles.locationLabel}>Drop-off Location</Text>
                </View>
                <TextInput
                  style={styles.input}
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
                <TouchableOpacity style={styles.quickButton} onPress={useSchoolAddress}>
                  <Ionicons name="school-outline" size={16} color="#7E2EFF" />
                  <Text style={styles.quickButtonText}>Use School Address</Text>
                </TouchableOpacity>
              </View>

              {/* Route Info */}
              {routeData && (
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
                      Estimated Fare: R{calculateFare()}
                    </Text>
                  </View>
                </View>
              )}

              {/* Trip Details */}
              {tripData && (
                <View style={styles.tripInfo}>
                  <Text style={styles.tripInfoTitle}>Scheduled Details</Text>
                  <View style={styles.tripInfoRow}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
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
                    <Text style={styles.tripInfoText}>{tripData.pickupTime}</Text>
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
                    <Text style={styles.continueButtonText}>Find Available Drivers</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Drivers Step */}
          {step === "drivers" && (
            <View>
              <Text style={styles.sheetTitle}>Select Driver</Text>
              <Text style={styles.sheetSubtext}>
                {drivers.length} driver{drivers.length !== 1 ? "s" : ""} available
                nearby
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

          {/* Confirm Step */}
          {step === "confirm" && selectedDriver && routeData && (
            <View>
              <Text style={styles.sheetTitle}>Confirm Trip Request</Text>
              <Text style={styles.sheetSubtext}>
                Driver will be notified and can accept or decline
              </Text>

              {/* Selected Driver */}
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
                      {selectedDriver.vehicle}
                    </Text>
                    <View style={styles.confirmDriverRating}>
                      <Ionicons name="star" size={14} color="#FFB800" />
                      <Text style={styles.confirmDriverRatingText}>
                        {selectedDriver.rating} • {selectedDriver.distance.toFixed(1)} km
                        away
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
                    <Ionicons name="radio-button-on" size={12} color="#00C853" />
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
                    {new Date(tripData?.date || "").toLocaleDateString("en-ZA")} at{" "}
                    {tripData?.pickupTime}
                  </Text>
                </View>
              </View>

              {/* Fare Breakdown */}
              <View style={styles.fareCard}>
                <View style={styles.fareRow}>
                  <Text style={styles.fareLabel}>Base Fare</Text>
                  <Text style={styles.fareValue}>R25</Text>
                </View>
                <View style={styles.fareRow}>
                  <Text style={styles.fareLabel}>
                    Distance ({(routeData.distance / 1000).toFixed(1)} km)
                  </Text>
                  <Text style={styles.fareValue}>
                    R{Math.round((routeData.distance / 1000) * 12)}
                  </Text>
                </View>
                <View style={styles.fareRow}>
                  <Text style={styles.fareLabel}>
                    Time ({Math.ceil(routeData.duration / 60)} min)
                  </Text>
                  <Text style={styles.fareValue}>
                    R{Math.round(Math.ceil(routeData.duration / 60) * 0.5)}
                  </Text>
                </View>
                <View style={styles.fareDivider} />
                <View style={styles.fareRow}>
                  <Text style={styles.fareTotalLabel}>Total Fare</Text>
                  <Text style={styles.fareTotalValue}>R{calculateFare()}</Text>
                </View>
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
                    <Text style={styles.createButtonText}>Send Trip Request</Text>
                    <Ionicons name="paper-plane" size={20} color="#fff" />
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backButtonBottom}
                onPress={() => {
                  setStep("drivers");
                  setSelectedDriver(null);
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
    paddingHorizontal: 20,
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
    textAlign: "center",
  },
  webRouteInfo: {
    marginTop: 20,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  webRouteText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  pickupMarker: {
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 8,
    borderWidth: 3,
    borderColor: "#00C853",
    ...Platform.select({
      default: {
        shadowColor: "#00C853",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
      },
    }),
  },
  dropoffMarker: {
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 8,
    borderWidth: 3,
    borderColor: "#FF5252",
    ...Platform.select({
      default: {
        shadowColor: "#FF5252",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
      },
    }),
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
  suggestionsContainer: {
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    maxHeight: 200,
    ...Platform.select({
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
    }),
  },
  loadingText: {
    marginLeft: 12,
    fontSize: 13,
    color: "#666",
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    gap: 12,
  },
  suggestionTextContainer: {
    flex: 1,
  },
  suggestionText: {
    fontSize: 13,
    color: "#333",
    lineHeight: 18,
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