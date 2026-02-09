// DriverTripRequestScreen.tsx - Driver Trip Request Handler with OSM
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MapView, Marker, Polyline, PROVIDER_GOOGLE } from "./MapComponent";

// ✅ API URLs
const API_BASE_URL = "https://safe-school-ride.duckdns.org";
const OSRM_BASE_URL = "https://router.project-osrm.org";

// ✅ Interfaces
interface TripRequest {
  _id: string;
  tripType: string;
  parentId: string;
  parentName: string;
  driverId: string;
  driverName: string;
  driverVehicle: string;
  date: string;
  pickupTime: string;
  pickupLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  dropoffLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  route?: {
    distance: number;
    duration: number;
    coordinates: Array<{ latitude: number; longitude: number }>;
  };
  activity?: string;
  instructions?: string;
  children: Array<{
    childId: string;
    childName: string;
    school: string;
    homeAddress: string;
    schoolAddress: string;
    parentContact: string;
  }>;
  status: string;
  fare: number;
  estimatedDuration?: number;
  estimatedDistance?: string;
  createdAt: string;
}

const DriverTripRequestScreen = () => {
  const [tripRequests, setTripRequests] = useState<TripRequest[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<TripRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [driverLocation, setDriverLocation] = useState({
    latitude: -26.0667,
    longitude: 28.0667,
  });

  const mapRef = useRef<any>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // ✅ Fetch pending trip requests on mount
  useEffect(() => {
    fetchTripRequests();
    // Poll for new requests every 30 seconds
    const interval = setInterval(fetchTripRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Animate slide up when trip selected
  useEffect(() => {
    if (selectedTrip) {
      Animated.spring(slideAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();

      // Fit map to show route
      if (selectedTrip.route && Platform.OS !== "web" && mapRef.current) {
        mapRef.current.fitToCoordinates(selectedTrip.route.coordinates, {
          edgePadding: { top: 100, right: 50, bottom: 400, left: 50 },
          animated: true,
        });
      }
    } else {
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedTrip]);

  // ✅ Fetch trip requests for this driver
  const fetchTripRequests = async () => {
    try {
      const token =
        (await AsyncStorage.getItem("driverToken")) ||
        (await AsyncStorage.getItem("token"));

      const driverId = await AsyncStorage.getItem("driverId");

      const response = await fetch(
        `${API_BASE_URL}/api/trips/driver/${driverId}/pending`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      console.log("[Driver Requests]:", data);

      if (response.ok && data.trips) {
        setTripRequests(data.trips);
      } else {
        // Mock data for development
        const mockRequests: TripRequest[] = [
          {
            _id: "trip001",
            tripType: "once-off",
            parentId: "parent123",
            parentName: "Sarah Johnson",
            driverId: "driver1",
            driverName: "Thabo Molefe",
            driverVehicle: "Toyota Corolla - ABC123GP",
            date: new Date().toISOString(),
            pickupTime: "07:30",
            pickupLocation: {
              latitude: -26.0667,
              longitude: 28.0667,
              address: "123 Main Street, Benoni, Gauteng",
            },
            dropoffLocation: {
              latitude: -26.0833,
              longitude: 28.0833,
              address: "Benoni High School, School Road, Benoni",
            },
            route: {
              distance: 5400,
              duration: 720,
              coordinates: [
                { latitude: -26.0667, longitude: 28.0667 },
                { latitude: -26.075, longitude: 28.075 },
                { latitude: -26.0833, longitude: 28.0833 },
              ],
            },
            children: [
              {
                childId: "child1",
                childName: "Emma Johnson",
                school: "Benoni High School",
                homeAddress: "123 Main Street, Benoni",
                schoolAddress: "Benoni High School, School Road",
                parentContact: "+27 82 123 4567",
              },
            ],
            status: "pending",
            fare: 85,
            estimatedDuration: 12,
            estimatedDistance: "5.4",
            createdAt: new Date().toISOString(),
          },
        ];
        setTripRequests(mockRequests);
      }
    } catch (error) {
      console.error("[Fetch Requests] Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Accept trip request
  const handleAcceptTrip = async () => {
    if (!selectedTrip) return;

    setActionLoading(true);
    try {
      const token =
        (await AsyncStorage.getItem("driverToken")) ||
        (await AsyncStorage.getItem("token"));

      const response = await fetch(
        `${API_BASE_URL}/api/trips/${selectedTrip._id}/accept`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            driverLocation: driverLocation,
            estimatedArrival: calculateArrivalTime(),
          }),
        }
      );

      const result = await response.json();
      console.log("[Accept Trip]:", result);

      if (response.ok && result.success) {
        const message = `✅ Trip Accepted!\n\nYou've accepted the trip for ${selectedTrip.parentName}.\n\nPickup: ${selectedTrip.pickupTime}\nLocation: ${selectedTrip.pickupLocation.address}\n\nThe parent has been notified. Navigate to the pickup location to start the trip.`;

        if (Platform.OS === "web") {
          alert(message);
          router.push("/(driver)/active-trips" as any);
        } else {
          Alert.alert("Trip Accepted", message, [
            {
              text: "Navigate",
              onPress: () => {
                // Start navigation to pickup
                startNavigation();
              },
            },
            {
              text: "View Active Trips",
              onPress: () => {
                router.push("/(driver)/active-trips" as any);
              },
            },
          ]);
        }

        // Remove from pending list
        setTripRequests((prev) =>
          prev.filter((t) => t._id !== selectedTrip._id)
        );
        setSelectedTrip(null);
      } else {
        const message = result.message || "Failed to accept trip";
        if (Platform.OS === "web") {
          alert(message);
        } else {
          Alert.alert("Error", message);
        }
      }
    } catch (error) {
      console.error("[Accept Trip] Error:", error);
      const message = "Network error. Please try again.";
      if (Platform.OS === "web") {
        alert(message);
      } else {
        Alert.alert("Error", message);
      }
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ Decline trip request
  const handleDeclineTrip = async () => {
    if (!selectedTrip) return;

    const confirmDecline = () => {
      setActionLoading(true);
      declineTrip();
    };

    if (Platform.OS === "web") {
      if (
        confirm(
          "Are you sure you want to decline this trip? The system will notify other available drivers."
        )
      ) {
        confirmDecline();
      }
    } else {
      Alert.alert(
        "Decline Trip",
        "Are you sure you want to decline this trip? The system will notify other available drivers.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Decline",
            style: "destructive",
            onPress: confirmDecline,
          },
        ]
      );
    }
  };

  const declineTrip = async () => {
    if (!selectedTrip) return;

    try {
      const token =
        (await AsyncStorage.getItem("driverToken")) ||
        (await AsyncStorage.getItem("token"));

      const response = await fetch(
        `${API_BASE_URL}/api/trips/${selectedTrip._id}/decline`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason: "Driver declined",
          }),
        }
      );

      const result = await response.json();
      console.log("[Decline Trip]:", result);

      if (response.ok && result.success) {
        const message = "Trip declined. Other drivers will be notified.";
        if (Platform.OS === "web") {
          alert(message);
        } else {
          Alert.alert("Trip Declined", message);
        }

        // Remove from list
        setTripRequests((prev) =>
          prev.filter((t) => t._id !== selectedTrip._id)
        );
        setSelectedTrip(null);
      } else {
        const message = result.message || "Failed to decline trip";
        if (Platform.OS === "web") {
          alert(message);
        } else {
          Alert.alert("Error", message);
        }
      }
    } catch (error) {
      console.error("[Decline Trip] Error:", error);
      const message = "Network error. Please try again.";
      if (Platform.OS === "web") {
        alert(message);
      } else {
        Alert.alert("Error", message);
      }
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ Calculate estimated arrival time
  const calculateArrivalTime = () => {
    if (!selectedTrip) return "";

    const now = new Date();
    // Add 15 minutes for driver to get ready + route duration
    const arrivalTime = new Date(
      now.getTime() + 15 * 60000 + (selectedTrip.route?.duration || 0) * 1000
    );

    return arrivalTime.toLocaleTimeString("en-ZA", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ✅ Start navigation to pickup
  const startNavigation = () => {
    if (!selectedTrip) return;

    const { latitude, longitude } = selectedTrip.pickupLocation;

    // Open in Google Maps or system maps
    const url = Platform.select({
      ios: `maps:0,0?q=${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}`,
      web: `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
    });

    if (url) {
      if (Platform.OS === "web") {
        window.open(url, "_blank");
      } else {
        // Use Linking on native
        // Linking.openURL(url);
        console.log("Navigate to:", url);
      }
    }
  };

  // ✅ Format distance
  const formatDistance = (meters: number) => {
    const km = meters / 1000;
    return km < 1 ? `${Math.round(meters)} m` : `${km.toFixed(1)} km`;
  };

  // ✅ Format duration
  const formatDuration = (seconds: number) => {
    const minutes = Math.ceil(seconds / 60);
    return minutes < 60
      ? `${minutes} min`
      : `${Math.floor(minutes / 60)}h ${minutes % 60}min`;
  };

  // ✅ Render map
  const renderMap = () => {
    if (Platform.OS === "web") {
      return (
        <View style={styles.webMapPlaceholder}>
          <Ionicons name="map-outline" size={64} color="#E0E0E0" />
          <Text style={styles.webMapText}>Trip Route</Text>
          {selectedTrip && selectedTrip.route && (
            <View style={styles.webRouteInfo}>
              <Text style={styles.webRouteText}>
                📍 {formatDistance(selectedTrip.route.distance)}
              </Text>
              <Text style={styles.webRouteText}>
                ⏱️ {formatDuration(selectedTrip.route.duration)}
              </Text>
            </View>
          )}
        </View>
      );
    }

    if (!MapView) return null;

    return (
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: selectedTrip?.pickupLocation.latitude || driverLocation.latitude,
          longitude: selectedTrip?.pickupLocation.longitude || driverLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* Route Polyline */}
        {selectedTrip?.route && selectedTrip.route.coordinates.length > 0 && (
          <Polyline
            coordinates={selectedTrip.route.coordinates}
            strokeColor="#7E2EFF"
            strokeWidth={4}
          />
        )}

        {/* Driver Location */}
        <Marker coordinate={driverLocation} title="Your Location">
          <View style={styles.driverMarker}>
            <Ionicons name="car" size={24} color="#fff" />
          </View>
        </Marker>

        {/* Pickup Location */}
        {selectedTrip && (
          <Marker
            coordinate={selectedTrip.pickupLocation}
            title="Pickup"
            description={selectedTrip.pickupLocation.address}
          >
            <View style={styles.pickupMarker}>
              <Ionicons name="location" size={28} color="#00C853" />
            </View>
          </Marker>
        )}

        {/* Dropoff Location */}
        {selectedTrip && (
          <Marker
            coordinate={selectedTrip.dropoffLocation}
            title="Drop-off"
            description={selectedTrip.dropoffLocation.address}
          >
            <View style={styles.dropoffMarker}>
              <Ionicons name="location" size={28} color="#FF5252" />
            </View>
          </Marker>
        )}
      </MapView>
    );
  };

  // ✅ Render loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Trip Requests</Text>
          <View style={styles.logo}>
            <Text style={styles.logoText}>SAFE</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7E2EFF" />
          <Text style={styles.loadingText}>Loading trip requests...</Text>
        </View>
      </View>
    );
  }

  // ✅ Render empty state
  if (tripRequests.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Trip Requests</Text>
          <View style={styles.logo}>
            <Text style={styles.logoText}>SAFE</Text>
          </View>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="car-outline" size={80} color="#E0E0E0" />
          <Text style={styles.emptyTitle}>No Pending Requests</Text>
          <Text style={styles.emptyText}>
            You're all caught up! New trip requests will appear here.
          </Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={fetchTripRequests}
          >
            <Ionicons name="refresh" size={20} color="#7E2EFF" />
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trip Requests</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{tripRequests.length}</Text>
        </View>
      </View>

      {/* Map (shown when trip selected) */}
      {selectedTrip && renderMap()}

      {/* Request List or Details */}
      {!selectedTrip ? (
        <ScrollView style={styles.listContainer}>
          <Text style={styles.listTitle}>Pending Requests</Text>
          <Text style={styles.listSubtext}>
            Tap a request to view details and respond
          </Text>

          {tripRequests.map((trip) => (
            <TouchableOpacity
              key={trip._id}
              style={styles.requestCard}
              onPress={() => setSelectedTrip(trip)}
              activeOpacity={0.7}
            >
              <View style={styles.requestHeader}>
                <View style={styles.requestParent}>
                  <Ionicons name="person-circle" size={20} color="#7E2EFF" />
                  <Text style={styles.requestParentName}>{trip.parentName}</Text>
                </View>
                <View style={styles.requestFare}>
                  <Text style={styles.requestFareAmount}>R{trip.fare}</Text>
                </View>
              </View>

              <View style={styles.requestLocation}>
                <Ionicons name="radio-button-on" size={14} color="#00C853" />
                <Text style={styles.requestLocationText} numberOfLines={1}>
                  {trip.pickupLocation.address}
                </Text>
              </View>

              <View style={styles.requestLocation}>
                <Ionicons name="location" size={14} color="#FF5252" />
                <Text style={styles.requestLocationText} numberOfLines={1}>
                  {trip.dropoffLocation.address}
                </Text>
              </View>

              <View style={styles.requestMeta}>
                <View style={styles.requestMetaItem}>
                  <Ionicons name="time-outline" size={14} color="#666" />
                  <Text style={styles.requestMetaText}>
                    {trip.pickupTime} • {trip.estimatedDuration} min trip
                  </Text>
                </View>
                <View style={styles.requestMetaItem}>
                  <Ionicons name="navigate-outline" size={14} color="#666" />
                  <Text style={styles.requestMetaText}>
                    {trip.estimatedDistance} km
                  </Text>
                </View>
              </View>

              <View style={styles.requestFooter}>
                <View style={styles.requestPassengers}>
                  <Ionicons name="people-outline" size={14} color="#7E2EFF" />
                  <Text style={styles.requestPassengersText}>
                    {trip.children.length} passenger{trip.children.length > 1 ? "s" : ""}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#999" />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <Animated.View
          style={[
            styles.detailsSheet,
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
            <Text style={styles.detailsTitle}>Trip Request Details</Text>

            {/* Parent Info */}
            <View style={styles.detailsCard}>
              <Text style={styles.detailsLabel}>Requested By</Text>
              <View style={styles.parentInfo}>
                <View style={styles.parentAvatar}>
                  <Ionicons name="person" size={24} color="#7E2EFF" />
                </View>
                <View>
                  <Text style={styles.parentName}>{selectedTrip.parentName}</Text>
                  <Text style={styles.parentContact}>
                    {selectedTrip.children[0]?.parentContact}
                  </Text>
                </View>
              </View>
            </View>

            {/* Passengers */}
            <View style={styles.detailsCard}>
              <Text style={styles.detailsLabel}>Passengers</Text>
              {selectedTrip.children.map((child, index) => (
                <View key={child.childId} style={styles.passengerRow}>
                  <Ionicons name="person-outline" size={16} color="#666" />
                  <Text style={styles.passengerName}>{child.childName}</Text>
                  <Text style={styles.passengerSchool}>• {child.school}</Text>
                </View>
              ))}
            </View>

            {/* Route Details */}
            <View style={styles.detailsCard}>
              <Text style={styles.detailsLabel}>Trip Route</Text>
              <View style={styles.routeRow}>
                <View style={styles.routeIconCircle}>
                  <Ionicons name="radio-button-on" size={12} color="#00C853" />
                </View>
                <View style={styles.routeTextContainer}>
                  <Text style={styles.routeTitle}>Pickup</Text>
                  <Text style={styles.routeAddress} numberOfLines={2}>
                    {selectedTrip.pickupLocation.address}
                  </Text>
                </View>
              </View>

              <View style={styles.routeDivider} />

              <View style={styles.routeRow}>
                <View style={styles.routeIconCircle}>
                  <Ionicons name="location" size={12} color="#FF5252" />
                </View>
                <View style={styles.routeTextContainer}>
                  <Text style={styles.routeTitle}>Drop-off</Text>
                  <Text style={styles.routeAddress} numberOfLines={2}>
                    {selectedTrip.dropoffLocation.address}
                  </Text>
                </View>
              </View>

              {selectedTrip.route && (
                <>
                  <View style={styles.routeStats}>
                    <View style={styles.routeStat}>
                      <Ionicons name="navigate" size={16} color="#7E2EFF" />
                      <Text style={styles.routeStatText}>
                        {formatDistance(selectedTrip.route.distance)}
                      </Text>
                    </View>
                    <View style={styles.routeStat}>
                      <Ionicons name="time" size={16} color="#7E2EFF" />
                      <Text style={styles.routeStatText}>
                        {formatDuration(selectedTrip.route.duration)}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.navigateButton}
                    onPress={startNavigation}
                  >
                    <Ionicons name="navigate" size={18} color="#7E2EFF" />
                    <Text style={styles.navigateButtonText}>
                      Preview Route in Maps
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Schedule */}
            <View style={styles.detailsCard}>
              <Text style={styles.detailsLabel}>Scheduled Time</Text>
              <View style={styles.scheduleRow}>
                <Ionicons name="calendar-outline" size={18} color="#666" />
                <Text style={styles.scheduleText}>
                  {new Date(selectedTrip.date).toLocaleDateString("en-ZA", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </View>
              <View style={styles.scheduleRow}>
                <Ionicons name="time-outline" size={18} color="#666" />
                <Text style={styles.scheduleText}>
                  Pickup at {selectedTrip.pickupTime}
                </Text>
              </View>
            </View>

            {/* Fare */}
            <View style={styles.fareCard}>
              <Text style={styles.fareLabel}>Trip Fare</Text>
              <Text style={styles.fareAmount}>R{selectedTrip.fare}</Text>
              <Text style={styles.fareSubtext}>
                Platform fee and earnings breakdown in active trips
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[
                  styles.acceptButton,
                  actionLoading && styles.buttonDisabled,
                ]}
                onPress={handleAcceptTrip}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={22} color="#fff" />
                    <Text style={styles.acceptButtonText}>Accept Trip</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.declineButton,
                  actionLoading && styles.buttonDisabled,
                ]}
                onPress={handleDeclineTrip}
                disabled={actionLoading}
              >
                <Ionicons name="close-circle-outline" size={22} color="#FF5252" />
                <Text style={styles.declineButtonText}>Decline</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.backToListButton}
              onPress={() => setSelectedTrip(null)}
            >
              <Ionicons name="arrow-back" size={18} color="#7E2EFF" />
              <Text style={styles.backToListText}>Back to Requests</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      )}
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
  badge: {
    backgroundColor: "#FF5252",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: "#999",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginBottom: 24,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#F0E6FF",
    borderRadius: 8,
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7E2EFF",
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  listTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  listSubtext: {
    fontSize: 13,
    color: "#999",
    marginBottom: 20,
  },
  requestCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    ...Platform.select({
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      },
    }),
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  requestParent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  requestParentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  requestFare: {
    backgroundColor: "#F0E6FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  requestFareAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#7E2EFF",
  },
  requestLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  requestLocationText: {
    flex: 1,
    fontSize: 13,
    color: "#666",
  },
  requestMeta: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  requestMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  requestMetaText: {
    fontSize: 12,
    color: "#666",
  },
  requestFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  requestPassengers: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  requestPassengersText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#7E2EFF",
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
  driverMarker: {
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
  detailsSheet: {
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
  detailsTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 20,
  },
  detailsCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  detailsLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#999",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  parentInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  parentAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F0E6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  parentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  parentContact: {
    fontSize: 13,
    color: "#666",
  },
  passengerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  passengerName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  passengerSchool: {
    fontSize: 13,
    color: "#999",
  },
  routeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 8,
  },
  routeIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  routeTextContainer: {
    flex: 1,
  },
  routeTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#999",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  routeAddress: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  routeDivider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 12,
    marginLeft: 36,
  },
  routeStats: {
    flexDirection: "row",
    gap: 20,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  routeStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  routeStatText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  navigateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#F0E6FF",
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  navigateButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7E2EFF",
  },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  scheduleText: {
    fontSize: 14,
    color: "#333",
  },
  fareCard: {
    backgroundColor: "#F0E6FF",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  fareLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#5B13CC",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  fareAmount: {
    fontSize: 36,
    fontWeight: "800",
    color: "#7E2EFF",
    marginBottom: 8,
  },
  fareSubtext: {
    fontSize: 11,
    color: "#5B13CC",
    textAlign: "center",
  },
  actionButtons: {
    gap: 12,
    marginBottom: 16,
  },
  acceptButton: {
    backgroundColor: "#00C853",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
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
  acceptButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  declineButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: "#FF5252",
  },
  declineButtonText: {
    color: "#FF5252",
    fontSize: 16,
    fontWeight: "700",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  backToListButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
  },
  backToListText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7E2EFF",
  },
});

export default DriverTripRequestScreen;
