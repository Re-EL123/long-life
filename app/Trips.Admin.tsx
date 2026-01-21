// app/Trips.Admin.tsx - Admin Trip Management Dashboard
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

// Types
interface Trip {
  id: string;
  childName: string;
  school: string;
  tripType: "once-off" | "weekly" | "monthly";
  status: "pending" | "assigned" | "active" | "completed" | "cancelled";
  date: string;
  pickupTime: string;
  pickupLocation: string;
  dropoffLocation: string;
  driver?: {
    name: string;
    phone: string;
    vehicleNumber: string;
  };
  createdAt: string;
}

// Mock API URL - Replace with your actual API
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://temp-weld-rho.vercel.app';

const TripsAdminScreen = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  const statusFilters = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Assigned", value: "assigned" },
    { label: "Active", value: "active" },
    { label: "Completed", value: "completed" },
  ];

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    filterTrips();
  }, [searchQuery, selectedStatus, trips]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      const response = await fetch(`${API_BASE_URL}/api/admin/trips`);
      
      if (response.ok) {
        const data = await response.json();
        setTrips(data.trips || []);
      } else {
        // Mock data for development
        setTrips(mockTrips);
      }
    } catch (error) {
      console.error("Error fetching trips:", error);
      // Use mock data if API fails
      setTrips(mockTrips);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTrips();
    setRefreshing(false);
  };

  const filterTrips = () => {
    let filtered = [...trips];

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((trip) => trip.status === selectedStatus);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (trip) =>
          trip.childName.toLowerCase().includes(query) ||
          trip.school.toLowerCase().includes(query) ||
          trip.pickupLocation.toLowerCase().includes(query) ||
          trip.dropoffLocation.toLowerCase().includes(query)
      );
    }

    setFilteredTrips(filtered);
  };

  const handleStatusChange = async (tripId: string, newStatus: string) => {
    const confirmMessage = `Change trip status to ${newStatus}?`;
    
    const proceed = Platform.OS === 'web' 
      ? confirm(confirmMessage)
      : await new Promise((resolve) => {
          Alert.alert(
            "Confirm Status Change",
            confirmMessage,
            [
              { text: "Cancel", onPress: () => resolve(false), style: "cancel" },
              { text: "Confirm", onPress: () => resolve(true) },
            ]
          );
        });

    if (!proceed) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/trips/${tripId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Update local state
        setTrips((prev) =>
          prev.map((trip) =>
            trip.id === tripId ? { ...trip, status: newStatus as any } : trip
          )
        );
        
        if (Platform.OS === 'web') {
          alert("Status updated successfully");
        } else {
          Alert.alert("Success", "Status updated successfully");
        }
      }
    } catch (error) {
      console.error("Error updating status:", error);
      if (Platform.OS === 'web') {
        alert("Failed to update status");
      } else {
        Alert.alert("Error", "Failed to update status");
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#FF9800";
      case "assigned":
        return "#2196F3";
      case "active":
        return "#4CAF50";
      case "completed":
        return "#9E9E9E";
      case "cancelled":
        return "#F44336";
      default:
        return "#9E9E9E";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return "time-outline";
      case "assigned":
        return "person-add-outline";
      case "active":
        return "car-outline";
      case "completed":
        return "checkmark-circle-outline";
      case "cancelled":
        return "close-circle-outline";
      default:
        return "help-outline";
    }
  };

  const renderTripCard = (trip: Trip) => (
    <Pressable
      key={trip.id}
      style={styles.tripCard}
      onPress={() => setSelectedTrip(trip)}
    >
      {/* Trip Header */}
      <View style={styles.tripHeader}>
        <View style={styles.tripHeaderLeft}>
          <Ionicons name="person-circle" size={40} color="#7E2EFF" />
          <View style={styles.tripHeaderInfo}>
            <Text style={styles.childName}>{trip.childName}</Text>
            <Text style={styles.schoolName}>{trip.school}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(trip.status) }]}>
          <Ionicons
            name={getStatusIcon(trip.status) as any}
            size={14}
            color="#fff"
          />
          <Text style={styles.statusText}>{trip.status}</Text>
        </View>
      </View>

      {/* Trip Details */}
      <View style={styles.tripDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            {new Date(trip.date).toLocaleDateString()} at {trip.pickupTime}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="repeat-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{trip.tripType}</Text>
        </View>
      </View>

      {/* Locations */}
      <View style={styles.locationsContainer}>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={16} color="#00C853" />
          <Text style={styles.locationText} numberOfLines={1}>
            {trip.pickupLocation}
          </Text>
        </View>
        <View style={styles.locationDivider} />
        <View style={styles.locationRow}>
          <Ionicons name="location" size={16} color="#FF5252" />
          <Text style={styles.locationText} numberOfLines={1}>
            {trip.dropoffLocation}
          </Text>
        </View>
      </View>

      {/* Driver Info (if assigned) */}
      {trip.driver && (
        <View style={styles.driverInfo}>
          <Ionicons name="car-outline" size={16} color="#7E2EFF" />
          <Text style={styles.driverText}>
            {trip.driver.name} • {trip.driver.vehicleNumber}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      {trip.status === "pending" && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.assignButton]}
            onPress={() => handleStatusChange(trip.id, "assigned")}
          >
            <Ionicons name="person-add" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Assign Driver</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => handleStatusChange(trip.id, "cancelled")}
          >
            <Ionicons name="close" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </Pressable>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Trip Management</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7E2EFF" />
          <Text style={styles.loadingText}>Loading trips...</Text>
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
        <Text style={styles.headerTitle}>Trip Management</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statsContainer}
        contentContainerStyle={styles.statsContent}
      >
        <View style={[styles.statCard, { backgroundColor: "#FF9800" }]}>
          <Ionicons name="time-outline" size={24} color="#fff" />
          <Text style={styles.statNumber}>
            {trips.filter((t) => t.status === "pending").length}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: "#2196F3" }]}>
          <Ionicons name="person-add-outline" size={24} color="#fff" />
          <Text style={styles.statNumber}>
            {trips.filter((t) => t.status === "assigned").length}
          </Text>
          <Text style={styles.statLabel}>Assigned</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: "#4CAF50" }]}>
          <Ionicons name="car-outline" size={24} color="#fff" />
          <Text style={styles.statNumber}>
            {trips.filter((t) => t.status === "active").length}
          </Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: "#9E9E9E" }]}>
          <Ionicons name="checkmark-circle-outline" size={24} color="#fff" />
          <Text style={styles.statNumber}>
            {trips.filter((t) => t.status === "completed").length}
          </Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </ScrollView>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search trips..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Status Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {statusFilters.map((filter) => (
          <TouchableOpacity
            key={filter.value}
            style={[
              styles.filterButton,
              selectedStatus === filter.value && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedStatus(filter.value)}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedStatus === filter.value && styles.filterButtonTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Trips List */}
      <ScrollView
        style={styles.tripsList}
        contentContainerStyle={styles.tripsListContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredTrips.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>No trips found</Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery
                ? "Try adjusting your search"
                : "No trips match the selected filters"}
            </Text>
          </View>
        ) : (
          filteredTrips.map(renderTripCard)
        )}
      </ScrollView>
    </View>
  );
};

export default TripsAdminScreen;

// Mock data for development
const mockTrips: Trip[] = [
  {
    id: "1",
    childName: "Micheal Williams",
    school: "Midrand Primary School",
    tripType: "once-off",
    status: "pending",
    date: new Date().toISOString(),
    pickupTime: "07:30",
    pickupLocation: "123 Main St, Midrand, Johannesburg",
    dropoffLocation: "Midrand Primary School, Midrand",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    childName: "Sarah Johnson",
    school: "Sandton High School",
    tripType: "weekly",
    status: "assigned",
    date: new Date().toISOString(),
    pickupTime: "08:00",
    pickupLocation: "456 Oak Ave, Sandton, Johannesburg",
    dropoffLocation: "Sandton High School, Sandton",
    driver: {
      name: "John Driver",
      phone: "+27 123 456 789",
      vehicleNumber: "ABC 123 GP",
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    childName: "David Brown",
    school: "Centurion Academy",
    tripType: "monthly",
    status: "active",
    date: new Date().toISOString(),
    pickupTime: "07:45",
    pickupLocation: "789 Pine Rd, Centurion, Pretoria",
    dropoffLocation: "Centurion Academy Soccer Field",
    driver: {
      name: "Mary Driver",
      phone: "+27 987 654 321",
      vehicleNumber: "XYZ 789 GP",
    },
    createdAt: new Date().toISOString(),
  },
];

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
  refreshButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 16,
  },
  statsContainer: {
    maxHeight: 120,
    paddingVertical: 16,
  },
  statsContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    width: 120,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    ...Platform.select({
      web: {
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      },
    }),
  },
  statNumber: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    marginTop: 8,
  },
  statLabel: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
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
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: "#1A1A1A",
    ...Platform.select({
      web: {
        outlineStyle: "none",
      },
    }),
  },
  filtersContainer: {
    maxHeight: 50,
    marginBottom: 16,
  },
  filtersContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    ...Platform.select({
      web: {
        cursor: "pointer",
      },
    }),
  },
  filterButtonActive: {
    backgroundColor: "#7E2EFF",
    borderColor: "#7E2EFF",
  },
  filterButtonText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "600",
  },
  filterButtonTextActive: {
    color: "#fff",
  },
  tripsList: {
    flex: 1,
  },
  tripsListContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  tripCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    ...Platform.select({
      web: {
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        cursor: "pointer",
      },
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
    alignItems: "center",
    marginBottom: 12,
  },
  tripHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  tripHeaderInfo: {
    marginLeft: 12,
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  schoolName: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  tripDetails: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: "#666",
  },
  locationsContainer: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationDivider: {
    width: 2,
    height: 16,
    backgroundColor: "#E0E0E0",
    marginLeft: 7,
    marginVertical: 4,
  },
  locationText: {
    flex: 1,
    fontSize: 13,
    color: "#333",
  },
  driverInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    marginBottom: 12,
  },
  driverText: {
    fontSize: 13,
    color: "#7E2EFF",
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  assignButton: {
    backgroundColor: "#4CAF50",
  },
  cancelButton: {
    backgroundColor: "#F44336",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
  },
});
