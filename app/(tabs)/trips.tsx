// app/(tabs)/trips.tsx - Trips Tab Screen
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ✅ API URL
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://safe-school-ride.duckdns.org";

// ✅ Trip Interface
interface Trip {
  _id: string;
  tripType: "once-off" | "weekly" | "monthly";
  status: "pending" | "accepted" | "in-progress" | "completed" | "cancelled";
  date: string;
  pickupTime: string;
  pickupLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };
  dropoffLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };
  driverName?: string;
  driverId?: string;
  fare?: number;
  children: Array<{
    childId: string;
    childName: string;
    school: string;
  }>;
  activity?: string;
  instructions?: string;
  createdAt: string;
  completedAt?: string;
}

type TabType = "current" | "history";

const TripsScreen = () => {
  const [activeTab, setActiveTab] = useState<TabType>("current");
  const [currentTrips, setCurrentTrips] = useState<Trip[]>([]);
  const [historyTrips, setHistoryTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState("User");

  // ✅ Fetch user info
  useEffect(() => {
    fetchUserInfo();
  }, []);

  // ✅ Fetch trips on mount and when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchTrips();
    }, [])
  );

  const fetchUserInfo = async () => {
    try {
      const name = await AsyncStorage.getItem("userName");
      if (name) setUserName(name);
    } catch (error) {
      console.error("[Trips] Error fetching user info:", error);
    }
  };

  // ✅ Fetch trips from API
  const fetchTrips = async () => {
    try {
      setLoading(true);
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

      const response = await fetch(`${API_BASE_URL}/api/trips/user-trips`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("[Trips] Fetched trips:", data);

      if (response.ok && data.trips) {
        // Separate current and history trips
        const current = data.trips.filter(
          (trip: Trip) =>
            trip.status === "pending" ||
            trip.status === "accepted" ||
            trip.status === "in-progress"
        );

        const history = data.trips.filter(
          (trip: Trip) => trip.status === "completed" || trip.status === "cancelled"
        );

        setCurrentTrips(current);
        setHistoryTrips(history);
      } else {
        console.error("[Trips] Failed to fetch trips:", data.message);
        // Set empty arrays if no trips found
        setCurrentTrips([]);
        setHistoryTrips([]);
      }
    } catch (error) {
      console.error("[Trips] Error fetching trips:", error);
      if (Platform.OS === "web") {
        alert("Failed to load trips. Please try again.");
      } else {
        Alert.alert("Error", "Failed to load trips. Please try again.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ Pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchTrips();
  };

  // ✅ Cancel trip
  const handleCancelTrip = async (tripId: string) => {
    const confirmAction = async () => {
      try {
        const token =
          (await AsyncStorage.getItem("userToken")) ||
          (await AsyncStorage.getItem("token"));

        const response = await fetch(`${API_BASE_URL}/api/trips/${tripId}/cancel`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (response.ok && result.success) {
          if (Platform.OS === "web") {
            alert("Trip cancelled successfully");
          } else {
            Alert.alert("Success", "Trip cancelled successfully");
          }
          fetchTrips(); // Refresh trips
        } else {
          if (Platform.OS === "web") {
            alert(result.message || "Failed to cancel trip");
          } else {
            Alert.alert("Error", result.message || "Failed to cancel trip");
          }
        }
      } catch (error) {
        console.error("[Trips] Error cancelling trip:", error);
        if (Platform.OS === "web") {
          alert("Failed to cancel trip. Please try again.");
        } else {
          Alert.alert("Error", "Failed to cancel trip. Please try again.");
        }
      }
    };

    if (Platform.OS === "web") {
      if (confirm("Are you sure you want to cancel this trip?")) {
        await confirmAction();
      }
    } else {
      Alert.alert("Cancel Trip", "Are you sure you want to cancel this trip?", [
        { text: "No", style: "cancel" },
        { text: "Yes", style: "destructive", onPress: confirmAction },
      ]);
    }
  };

  // ✅ Get status color
  const getStatusColor = (status: Trip["status"]) => {
    switch (status) {
      case "pending":
        return "#FFB800";
      case "accepted":
        return "#2196F3";
      case "in-progress":
        return "#7E2EFF";
      case "completed":
        return "#00C853";
      case "cancelled":
        return "#FF5252";
      default:
        return "#999";
    }
  };

  // ✅ Get status icon
  const getStatusIcon = (status: Trip["status"]) => {
    switch (status) {
      case "pending":
        return "time-outline";
      case "accepted":
        return "checkmark-circle-outline";
      case "in-progress":
        return "car-outline";
      case "completed":
        return "checkmark-done-circle-outline";
      case "cancelled":
        return "close-circle-outline";
      default:
        return "help-circle-outline";
    }
  };

  // ✅ Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // ✅ Render trip card
  const renderTripCard = (trip: Trip) => {
    const isHistory = activeTab === "history";

    return (
      <View key={trip._id} style={styles.tripCard}>
        {/* Trip Header */}
        <View style={styles.tripHeader}>
          <View style={styles.tripHeaderLeft}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: `${getStatusColor(trip.status)}20` },
              ]}
            >
              <Ionicons
                name={getStatusIcon(trip.status) as any}
                size={14}
                color={getStatusColor(trip.status)}
              />
              <Text
                style={[styles.statusText, { color: getStatusColor(trip.status) }]}
              >
                {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
              </Text>
            </View>
            <View style={styles.tripTypeBadge}>
              <Text style={styles.tripTypeText}>{trip.tripType}</Text>
            </View>
          </View>
          <Text style={styles.tripDate}>{formatDate(trip.date)}</Text>
        </View>

        {/* Driver Info */}
        {trip.driverName && (
          <View style={styles.driverSection}>
            <View style={styles.driverAvatar}>
              <Ionicons name="person" size={20} color="#7E2EFF" />
            </View>
            <View style={styles.driverInfo}>
              <Text style={styles.driverLabel}>Driver</Text>
              <Text style={styles.driverName}>{trip.driverName}</Text>
            </View>
          </View>
        )}

        {/* Location Info */}
        <View style={styles.locationSection}>
          <View style={styles.locationRow}>
            <View style={styles.locationDot} />
            <View style={styles.locationLine} />
            <View style={styles.locationInfo}>
              <View style={styles.locationHeader}>
                <Ionicons name="location" size={16} color="#00C853" />
                <Text style={styles.locationLabel}>Pickup</Text>
              </View>
              <Text style={styles.locationAddress} numberOfLines={2}>
                {trip.pickupLocation.address}
              </Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <View style={[styles.locationDot, { backgroundColor: "#FF5252" }]} />
            <View style={styles.locationInfo}>
              <View style={styles.locationHeader}>
                <Ionicons name="location" size={16} color="#FF5252" />
                <Text style={styles.locationLabel}>Drop-off</Text>
              </View>
              <Text style={styles.locationAddress} numberOfLines={2}>
                {trip.dropoffLocation.address}
              </Text>
            </View>
          </View>
        </View>

        {/* Trip Details */}
        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{trip.pickupTime}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="people-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              {trip.children.length} child{trip.children.length > 1 ? "ren" : ""}
            </Text>
          </View>
          {trip.fare && (
            <View style={styles.detailRow}>
              <Ionicons name="cash-outline" size={16} color="#666" />
              <Text style={styles.detailText}>R{trip.fare}</Text>
            </View>
          )}
        </View>

        {/* Children List */}
        {trip.children.length > 0 && (
          <View style={styles.childrenSection}>
            <Text style={styles.childrenLabel}>Children:</Text>
            <View style={styles.childrenList}>
              {trip.children.map((child, index) => (
                <View key={child.childId} style={styles.childChip}>
                  <Text style={styles.childChipText}>{child.childName}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          {!isHistory && trip.status === "pending" && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleCancelTrip(trip._id)}
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle-outline" size={18} color="#FF5252" />
              <Text style={styles.cancelButtonText}>Cancel Trip</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => {
              // Navigate to trip details screen
              console.log("View trip details:", trip._id);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.viewButtonText}>View Details</Text>
            <Ionicons name="chevron-forward" size={18} color="#7E2EFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ✅ Render empty state
  const renderEmptyState = () => {
    const isHistory = activeTab === "history";

    return (
      <View style={styles.emptyState}>
        <Ionicons
          name={isHistory ? "time-outline" : "car-outline"}
          size={64}
          color="#E0E0E0"
        />
        <Text style={styles.emptyTitle}>
          {isHistory ? "No Trip History" : "No Current Trips"}
        </Text>
        <Text style={styles.emptySubtitle}>
          {isHistory
            ? "Your completed trips will appear here"
            : "Request a trip to get started"}
        </Text>
        {!isHistory && (
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.push("/RequestDriverScreen" as any)}
          >
            <Text style={styles.emptyButtonText}>Request Driver</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {userName}</Text>
          <Text style={styles.headerTitle}>Your Trips</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/RequestDriverScreen" as any)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "current" && styles.tabActive]}
          onPress={() => setActiveTab("current")}
          activeOpacity={0.7}
        >
          <Ionicons
            name="car-outline"
            size={20}
            color={activeTab === "current" ? "#7E2EFF" : "#999"}
          />
          <Text
            style={[styles.tabText, activeTab === "current" && styles.tabTextActive]}
          >
            Current
          </Text>
          {currentTrips.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{currentTrips.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "history" && styles.tabActive]}
          onPress={() => setActiveTab("history")}
          activeOpacity={0.7}
        >
          <Ionicons
            name="time-outline"
            size={20}
            color={activeTab === "history" ? "#7E2EFF" : "#999"}
          />
          <Text
            style={[styles.tabText, activeTab === "history" && styles.tabTextActive]}
          >
            History
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#7E2EFF"]}
            tintColor="#7E2EFF"
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7E2EFF" />
            <Text style={styles.loadingText}>Loading trips...</Text>
          </View>
        ) : activeTab === "current" ? (
          currentTrips.length > 0 ? (
            currentTrips.map(renderTripCard)
          ) : (
            renderEmptyState()
          )
        ) : historyTrips.length > 0 ? (
          historyTrips.map(renderTripCard)
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
    </View>
  );
};

export default TripsScreen;

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
  greeting: {
    color: "#E0D4FF",
    fontSize: 14,
    marginBottom: 4,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },
  addButton: {
    backgroundColor: "#5B13CC",
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
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
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: "#7E2EFF",
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#999",
  },
  tabTextActive: {
    color: "#7E2EFF",
  },
  badge: {
    backgroundColor: "#7E2EFF",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  tripCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    ...Platform.select({
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      },
    }),
  },
  tripHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  tripHeaderLeft: {
    flexDirection: "row",
    gap: 8,
    flex: 1,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  tripTypeBadge: {
    backgroundColor: "#F0E6FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tripTypeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#7E2EFF",
    textTransform: "capitalize",
  },
  tripDate: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  driverSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  driverAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0E6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  driverInfo: {
    flex: 1,
  },
  driverLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  driverName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  locationSection: {
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: "row",
    marginBottom: 12,
    position: "relative",
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#00C853",
    marginTop: 4,
    marginRight: 12,
    zIndex: 2,
  },
  locationLine: {
    position: "absolute",
    left: 5.5,
    top: 16,
    width: 1,
    height: 24,
    backgroundColor: "#E0E0E0",
    zIndex: 1,
  },
  locationInfo: {
    flex: 1,
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  locationAddress: {
    fontSize: 14,
    color: "#1A1A1A",
    lineHeight: 20,
  },
  detailsSection: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  childrenSection: {
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  childrenLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  childrenList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  childChip: {
    backgroundColor: "#F0E6FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  childChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#7E2EFF",
  },
  actionSection: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  cancelButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#FF5252",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF5252",
  },
  viewButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#F0E6FF",
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7E2EFF",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: "#7E2EFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    ...Platform.select({
      default: {
        shadowColor: "#7E2EFF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});