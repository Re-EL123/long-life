// DriverDashboard.tsx - Enhanced with Complete Trip Management
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { FontAwesome5, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'https://safe-school-ride.duckdns.org';

interface TripRequest {
  _id: string;
  parentName: string;
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
  pickupTime: string;
  date: string;
  fare: number;
  estimatedDistance: string;
  estimatedDuration: number;
  children: Array<{
    childName: string;
  }>;
  status: string;
  createdAt: string;
}

interface Trip {
  _id: string;
  parentName: string;
  pickupLocation: {
    address: string;
  };
  dropoffLocation: {
    address: string;
  };
  pickupTime: string;
  date: string;
  fare: number;
  actualFare?: number;
  status: string;
  timeUntilPickup?: string;
  children: Array<{
    childName: string;
  }>;
  startedAt?: string;
  completedAt?: string;
  estimatedDistance?: string;
  estimatedDuration?: number;
}

type TripFilter = 'all' | 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';

export default function DriverDashboard() {
  const [driverData, setDriverData] = useState<any>(null);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Trip Management State
  const [tripRequests, setTripRequests] = useState<TripRequest[]>([]);
  const [upcomingTrips, setUpcomingTrips] = useState<Trip[]>([]);
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<TripFilter>('all');
  const [showTripHistory, setShowTripHistory] = useState(false);
  
  // Modal State
  const [selectedRequest, setSelectedRequest] = useState<TripRequest | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showTripDetailModal, setShowTripDetailModal] = useState(false);
  const [processingRequest, setProcessingRequest] = useState(false);

  // Statistics State
  const [stats, setStats] = useState({
    todayTrips: 0,
    todayEarnings: 0,
    totalTrips: 0,
    completionRate: 0,
  });

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadTripRequests, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    try {
      const storedToken =
        (await AsyncStorage.getItem('userToken')) ||
        (await AsyncStorage.getItem('token'));

      if (!storedToken) {
        console.log('No token found, redirecting to login');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        console.error('Profile fetch failed:', data);
        setLoading(false);
        return;
      }

      setDriverData(data.user);
      setIsActive(!!data.user.isActive);

      await Promise.all([
        loadTripRequests(),
        loadUpcomingTrips(),
        loadAllTrips(),
        loadDriverStats(),
      ]);
    } catch (error) {
      console.error('Failed to load driver dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTripRequests = async () => {
    try {
      const storedToken =
        (await AsyncStorage.getItem('userToken')) ||
        (await AsyncStorage.getItem('token'));

      if (!storedToken || !driverData?.id) return;

      const response = await fetch(
        `${API_BASE_URL}/api/trips/requests/${driverData.id}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${storedToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setTripRequests(data.requests || []);
        if (data.requests && data.requests.length > 0 && !showRequestModal) {
          setSelectedRequest(data.requests[0]);
          setShowRequestModal(true);
        }
      }
    } catch (error) {
      console.error('Failed to load trip requests:', error);
    }
  };

  const loadUpcomingTrips = async () => {
    try {
      const storedToken =
        (await AsyncStorage.getItem('userToken')) ||
        (await AsyncStorage.getItem('token'));

      if (!storedToken || !driverData?.id) return;

      const response = await fetch(
        `${API_BASE_URL}/api/trips/upcoming/${driverData.id}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${storedToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        const tripsWithCountdown = (data.trips || []).map((trip: Trip) => ({
          ...trip,
          timeUntilPickup: calculateTimeUntilPickup(trip.date, trip.pickupTime),
        }));
        setUpcomingTrips(tripsWithCountdown);
      }
    } catch (error) {
      console.error('Failed to load upcoming trips:', error);
    }
  };

  const loadAllTrips = async () => {
    try {
      const storedToken =
        (await AsyncStorage.getItem('userToken')) ||
        (await AsyncStorage.getItem('token'));

      if (!storedToken || !driverData?.id) return;

      const response = await fetch(
        `${API_BASE_URL}/api/trips?userId=${driverData.id}&role=driver`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${storedToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setAllTrips(data.trips || []);
      }
    } catch (error) {
      console.error('Failed to load all trips:', error);
    }
  };

  const loadDriverStats = async () => {
    try {
      const storedToken =
        (await AsyncStorage.getItem('userToken')) ||
        (await AsyncStorage.getItem('token'));

      if (!storedToken || !driverData?.id) return;

      // Calculate today's trips and earnings
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const response = await fetch(
        `${API_BASE_URL}/api/trips?userId=${driverData.id}&role=driver&startDate=${today.toISOString()}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${storedToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        const trips = data.trips || [];
        const completedTrips = trips.filter((t: Trip) => t.status === 'completed');
        
        setStats({
          todayTrips: completedTrips.length,
          todayEarnings: completedTrips.reduce((sum: number, t: Trip) => sum + (t.actualFare || t.fare), 0),
          totalTrips: trips.length,
          completionRate: trips.length > 0 ? (completedTrips.length / trips.length) * 100 : 0,
        });
      }
    } catch (error) {
      console.error('Failed to load driver stats:', error);
    }
  };

  const calculateTimeUntilPickup = (date: string, time: string): string => {
    try {
      const [hours, minutes] = time.split(':').map(Number);
      const pickupDate = new Date(date);
      pickupDate.setHours(hours, minutes, 0, 0);

      const now = new Date();
      const diff = pickupDate.getTime() - now.getTime();

      if (diff < 0) return 'Now';

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) return `${days}d ${hrs}h`;
      if (hrs > 0) return `${hrs}h ${mins}m`;
      return `${mins}m`;
    } catch (error) {
      return 'Soon';
    }
  };

  const handleAcceptTrip = async () => {
    if (!selectedRequest) return;

    setProcessingRequest(true);
    try {
      const storedToken =
        (await AsyncStorage.getItem('userToken')) ||
        (await AsyncStorage.getItem('token'));

      const response = await fetch(
        `${API_BASE_URL}/api/trips/${selectedRequest._id}/accept`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${storedToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setShowRequestModal(false);
        await Promise.all([loadTripRequests(), loadUpcomingTrips(), loadAllTrips()]);
        alert('Trip accepted! Added to your upcoming trips.');
      } else {
        alert(data.message || 'Failed to accept trip');
      }
    } catch (error) {
      console.error('Failed to accept trip:', error);
      alert('Network error. Please try again.');
    } finally {
      setProcessingRequest(false);
    }
  };

  const handleDeclineTrip = async () => {
    if (!selectedRequest) return;

    setProcessingRequest(true);
    try {
      const storedToken =
        (await AsyncStorage.getItem('userToken')) ||
        (await AsyncStorage.getItem('token'));

      const response = await fetch(
        `${API_BASE_URL}/api/trips/${selectedRequest._id}/decline`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${storedToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setShowRequestModal(false);
        await Promise.all([loadTripRequests(), loadAllTrips()]);
      } else {
        alert(data.message || 'Failed to decline trip');
      }
    } catch (error) {
      console.error('Failed to decline trip:', error);
      alert('Network error. Please try again.');
    } finally {
      setProcessingRequest(false);
    }
  };

  const handleStartTrip = async (tripId: string) => {
    try {
      const storedToken =
        (await AsyncStorage.getItem('userToken')) ||
        (await AsyncStorage.getItem('token'));

      const response = await fetch(
        `${API_BASE_URL}/api/trips/${tripId}/start`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${storedToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        router.push(`/trip-tracking/${tripId}` as any);
      } else {
        alert(data.message || 'Failed to start trip');
      }
    } catch (error) {
      console.error('Failed to start trip:', error);
      alert('Network error. Please try again.');
    }
  };

  const handleCompleteTrip = async (tripId: string) => {
    try {
      const storedToken =
        (await AsyncStorage.getItem('userToken')) ||
        (await AsyncStorage.getItem('token'));

      const response = await fetch(
        `${API_BASE_URL}/api/trips/${tripId}/complete`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${storedToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            actualFare: selectedTrip?.fare,
            notes: 'Trip completed successfully',
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setShowTripDetailModal(false);
        await Promise.all([loadUpcomingTrips(), loadAllTrips(), loadDriverStats()]);
        alert('Trip completed successfully!');
      } else {
        alert(data.message || 'Failed to complete trip');
      }
    } catch (error) {
      console.error('Failed to complete trip:', error);
      alert('Network error. Please try again.');
    }
  };

  const getFilteredTrips = () => {
    if (selectedFilter === 'all') return allTrips;
    return allTrips.filter(trip => trip.status === selectedFilter);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'accepted': return '#2196F3';
      case 'in-progress': return '#9C27B0';
      case 'completed': return '#4CAF50';
      case 'cancelled': return '#F44336';
      case 'declined': return '#757575';
      default: return '#666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'time-outline';
      case 'accepted': return 'checkmark-circle-outline';
      case 'in-progress': return 'car-outline';
      case 'completed': return 'checkmark-done-circle';
      case 'cancelled': return 'close-circle-outline';
      case 'declined': return 'remove-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  }, []);

  const toggleActive = async (value: boolean) => {
    setIsActive(value);
    try {
      const storedToken =
        (await AsyncStorage.getItem('userToken')) ||
        (await AsyncStorage.getItem('token'));

      if (!storedToken || !driverData?.id) {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: value }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        console.error('Toggle active failed:', data);
        setIsActive(!value);
        return;
      }

      setDriverData((prev: any) =>
        prev ? { ...prev, isActive: data.user.isActive } : prev
      );
    } catch (error) {
      console.error('Failed to toggle active status:', error);
      setIsActive(!value);
    }
  };

  if (loading) {
    return (
      <View style={styles.root}>
        <ActivityIndicator size="large" color="#5A0FC8" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#5A0FC8', '#5A0FC8']}
        style={styles.headerBackground}
      >
        <View style={styles.topRow}>
          <Image
            source={require('@/assets/images/logo2.png')}
            style={styles.logo}
          />
          <TouchableOpacity onPress={loadTripRequests}>
            <View>
              <Ionicons name="notifications-outline" size={24} color="white" />
              {tripRequests.length > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {tripRequests.length}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.welcome}>
          Welcome {driverData?.name || 'Driver'}
        </Text>
        {driverData?.registrationNumber && (
          <Text style={styles.carRegistration}>
            {driverData.registrationNumber} • {driverData.carBrand} {driverData.carModel}
          </Text>
        )}

        <View style={styles.activeToggleRow}>
          <Text style={styles.heading}>ACTIVE</Text>
          <Switch
            value={isActive}
            onValueChange={toggleActive}
            trackColor={{ false: '#767577', true: '#81C784' }}
            thumbColor={isActive ? '#4CAF50' : '#f4f3f4'}
          />
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Status Card */}
        <Text style={styles.subheading}>Status</Text>
        <View style={styles.statusCard}>
          <Text
            style={{
              color: isActive ? '#00C853' : '#FF5252',
              fontWeight: 'bold',
              fontSize: 16,
            }}
          >
            {isActive ? 'Ready for Trips' : 'Offline'}
          </Text>
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="car-outline" size={24} color="#5A0FC8" />
            <Text style={styles.statValue}>{stats.todayTrips}</Text>
            <Text style={styles.statLabel}>Today's Trips</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="cash-outline" size={24} color="#00C853" />
            <Text style={styles.statValue}>R{stats.todayEarnings}</Text>
            <Text style={styles.statLabel}>Today's Earnings</Text>
          </View>
        </View>

        {/* Trip Requests Section */}
        {tripRequests.length > 0 && (
          <View style={styles.requestsSection}>
            <Text style={styles.subheading}>
              Trip Requests ({tripRequests.length})
            </Text>
            {tripRequests.map((request) => (
              <TouchableOpacity
                key={request._id}
                style={styles.requestCard}
                onPress={() => {
                  setSelectedRequest(request);
                  setShowRequestModal(true);
                }}
              >
                <View style={styles.requestHeader}>
                  <Text style={styles.requestParent}>{request.parentName}</Text>
                  <Text style={styles.requestFare}>R{request.fare}</Text>
                </View>
                <View style={styles.requestLocation}>
                  <Ionicons name="location" size={14} color="#666" />
                  <Text style={styles.requestLocationText} numberOfLines={1}>
                    {request.pickupLocation.address}
                  </Text>
                </View>
                <View style={styles.requestMeta}>
                  <Text style={styles.requestMetaText}>
                    {request.estimatedDistance} km • {request.estimatedDuration} min
                  </Text>
                  <Text style={styles.requestMetaText}>
                    {new Date(request.createdAt).toLocaleTimeString('en-ZA', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Upcoming Trips Section */}
        {upcomingTrips.length > 0 && (
          <View style={styles.upcomingSection}>
            <Text style={styles.subheading}>
              Upcoming Trips ({upcomingTrips.length})
            </Text>
            {upcomingTrips.map((trip) => (
              <TouchableOpacity
                key={trip._id}
                style={styles.upcomingCard}
                onPress={() => {
                  setSelectedTrip(trip);
                  setShowTripDetailModal(true);
                }}
              >
                <View style={styles.upcomingHeader}>
                  <View>
                    <Text style={styles.upcomingParent}>{trip.parentName}</Text>
                    <Text style={styles.upcomingTime}>
                      {new Date(trip.date).toLocaleDateString('en-ZA')} at{' '}
                      {trip.pickupTime}
                    </Text>
                  </View>
                  <View style={styles.countdownBadge}>
                    <Ionicons name="time-outline" size={16} color="#5A0FC8" />
                    <Text style={styles.countdownText}>
                      {trip.timeUntilPickup}
                    </Text>
                  </View>
                </View>
                <View style={styles.upcomingLocations}>
                  <View style={styles.upcomingLocation}>
                    <Ionicons name="radio-button-on" size={12} color="#00C853" />
                    <Text style={styles.upcomingLocationText} numberOfLines={1}>
                      {trip.pickupLocation.address}
                    </Text>
                  </View>
                  <View style={styles.upcomingLocation}>
                    <Ionicons name="location" size={12} color="#FF5252" />
                    <Text style={styles.upcomingLocationText} numberOfLines={1}>
                      {trip.dropoffLocation.address}
                    </Text>
                  </View>
                </View>
                <View style={styles.upcomingFooter}>
                  <Text style={styles.upcomingFare}>R{trip.fare}</Text>
                  <TouchableOpacity
                    style={styles.startButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleStartTrip(trip._id);
                    }}
                  >
                    <Text style={styles.startButtonText}>Start Trip</Text>
                    <Ionicons name="arrow-forward" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Trip History Section */}
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.subheading}>Trip Management</Text>
            <TouchableOpacity
              onPress={() => setShowTripHistory(!showTripHistory)}
              style={styles.toggleButton}
            >
              <Text style={styles.toggleButtonText}>
                {showTripHistory ? 'Hide' : 'Show'} All Trips
              </Text>
              <Ionicons
                name={showTripHistory ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#5A0FC8"
              />
            </TouchableOpacity>
          </View>

          {showTripHistory && (
            <>
              {/* Filter Buttons */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterContainer}
              >
                {(['all', 'pending', 'accepted', 'in-progress', 'completed', 'cancelled'] as TripFilter[]).map((filter) => (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      styles.filterButton,
                      selectedFilter === filter && styles.filterButtonActive,
                    ]}
                    onPress={() => setSelectedFilter(filter)}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        selectedFilter === filter && styles.filterButtonTextActive,
                      ]}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1).replace('-', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Trip List */}
              {getFilteredTrips().length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="car-outline" size={48} color="#CCC" />
                  <Text style={styles.emptyStateText}>
                    No {selectedFilter !== 'all' ? selectedFilter : ''} trips found
                  </Text>
                </View>
              ) : (
                getFilteredTrips().map((trip) => (
                  <TouchableOpacity
                    key={trip._id}
                    style={styles.historyCard}
                    onPress={() => {
                      setSelectedTrip(trip);
                      setShowTripDetailModal(true);
                    }}
                  >
                    <View style={styles.historyHeader}>
                      <View>
                        <Text style={styles.historyParent}>{trip.parentName}</Text>
                        <Text style={styles.historyDate}>
                          {new Date(trip.date).toLocaleDateString('en-ZA')}
                        </Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(trip.status) + '20' }]}>
                        <Ionicons
                          name={getStatusIcon(trip.status) as any}
                          size={16}
                          color={getStatusColor(trip.status)}
                        />
                        <Text style={[styles.statusText, { color: getStatusColor(trip.status) }]}>
                          {trip.status.charAt(0).toUpperCase() + trip.status.slice(1).replace('-', ' ')}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.historyMeta}>
                      <Text style={styles.historyMetaText}>
                        R{trip.actualFare || trip.fare}
                      </Text>
                      <Text style={styles.historyMetaText}>•</Text>
                      <Text style={styles.historyMetaText}>
                        {trip.estimatedDistance || '—'} km
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </>
          )}
        </View>

        {/* Earnings Today */}
        <Text style={styles.subheading}>Earnings Today</Text>
        <LinearGradient
          colors={['#5A0FC8', '#5A0FC8']}
          style={styles.earningCard}
        >
          <Text style={styles.earningAmountWhite}>
            R{stats.todayEarnings}
          </Text>
        </LinearGradient>

        {/* Feature Buttons */}
        <View style={styles.buttonRow}>
          <LinearGradient
            colors={['#5A0FC8', '#5A0FC8']}
            style={styles.featureButton}
          >
            <TouchableOpacity onPress={() => router.push('/driver-wallet')}>
              <MaterialCommunityIcons name="wallet" size={28} color="#fff" />
              <Text style={styles.buttonTextWhite}>Wallet</Text>
            </TouchableOpacity>
          </LinearGradient>

          <LinearGradient
            colors={['#5A0FC8', '#5A0FC8']}
            style={styles.featureButton}
          >
            <TouchableOpacity onPress={() => router.push('/driver-childen')}>
              <Ionicons name="people" size={28} color="#fff" />
              <Text style={styles.buttonTextWhite}>Children</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Bottom Buttons */}
        <View style={styles.bottomRow}>
          <TouchableOpacity style={styles.emergencyButton}>
            <Text style={styles.emergencyText}>Emergency SOS</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => router.push('/driver-settings')}
          >
            <Ionicons name="settings-outline" size={28} color="#5A0FC8" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Trip Request Modal */}
      <Modal
        visible={showRequestModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRequestModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Trip Request</Text>
              <TouchableOpacity
                onPress={() => setShowRequestModal(false)}
                style={styles.modalClose}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedRequest && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Parent</Text>
                  <Text style={styles.modalValue}>{selectedRequest.parentName}</Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Children</Text>
                  {selectedRequest.children.map((child, index) => (
                    <Text key={index} style={styles.modalValue}>
                      • {child.childName}
                    </Text>
                  ))}
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Pickup</Text>
                  <View style={styles.modalLocationRow}>
                    <Ionicons name="radio-button-on" size={16} color="#00C853" />
                    <Text style={styles.modalLocationText}>
                      {selectedRequest.pickupLocation.address}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Drop-off</Text>
                  <View style={styles.modalLocationRow}>
                    <Ionicons name="location" size={16} color="#FF5252" />
                    <Text style={styles.modalLocationText}>
                      {selectedRequest.dropoffLocation.address}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Trip Details</Text>
                  <View style={styles.modalDetailRow}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.modalDetailText}>
                      {new Date(selectedRequest.date).toLocaleDateString('en-ZA')}
                    </Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.modalDetailText}>
                      {selectedRequest.pickupTime}
                    </Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Ionicons name="navigate-outline" size={16} color="#666" />
                    <Text style={styles.modalDetailText}>
                      {selectedRequest.estimatedDistance} km •{' '}
                      {selectedRequest.estimatedDuration} min
                    </Text>
                  </View>
                </View>

                <View style={styles.modalFareSection}>
                  <Text style={styles.modalFareLabel}>Trip Fare</Text>
                  <Text style={styles.modalFareValue}>
                    R{selectedRequest.fare}
                  </Text>
                </View>
              </ScrollView>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.declineButton]}
                onPress={handleDeclineTrip}
                disabled={processingRequest}
              >
                {processingRequest ? (
                  <ActivityIndicator color="#FF3B30" />
                ) : (
                  <>
                    <Ionicons name="close-circle" size={20} color="#FF3B30" />
                    <Text style={styles.declineButtonText}>Decline</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.acceptButton]}
                onPress={handleAcceptTrip}
                disabled={processingRequest}
              >
                {processingRequest ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text style={styles.acceptButtonText}>Accept</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Trip Detail Modal */}
      <Modal
        visible={showTripDetailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTripDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Trip Details</Text>
              <TouchableOpacity
                onPress={() => setShowTripDetailModal(false)}
                style={styles.modalClose}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedTrip && (
              <ScrollView style={styles.modalBody}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedTrip.status) + '20', alignSelf: 'flex-start', marginBottom: 20 }]}>
                  <Ionicons
                    name={getStatusIcon(selectedTrip.status) as any}
                    size={18}
                    color={getStatusColor(selectedTrip.status)}
                  />
                  <Text style={[styles.statusText, { color: getStatusColor(selectedTrip.status), fontSize: 16 }]}>
                    {selectedTrip.status.charAt(0).toUpperCase() + selectedTrip.status.slice(1).replace('-', ' ')}
                  </Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Parent</Text>
                  <Text style={styles.modalValue}>{selectedTrip.parentName}</Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Pickup</Text>
                  <View style={styles.modalLocationRow}>
                    <Ionicons name="radio-button-on" size={16} color="#00C853" />
                    <Text style={styles.modalLocationText}>
                      {selectedTrip.pickupLocation.address}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Drop-off</Text>
                  <View style={styles.modalLocationRow}>
                    <Ionicons name="location" size={16} color="#FF5252" />
                    <Text style={styles.modalLocationText}>
                      {selectedTrip.dropoffLocation.address}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Trip Details</Text>
                  <View style={styles.modalDetailRow}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.modalDetailText}>
                      {new Date(selectedTrip.date).toLocaleDateString('en-ZA')}
                    </Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.modalDetailText}>
                      {selectedTrip.pickupTime}
                    </Text>
                  </View>
                  {selectedTrip.estimatedDistance && (
                    <View style={styles.modalDetailRow}>
                      <Ionicons name="navigate-outline" size={16} color="#666" />
                      <Text style={styles.modalDetailText}>
                        {selectedTrip.estimatedDistance} km
                        {selectedTrip.estimatedDuration && ` • ${selectedTrip.estimatedDuration} min`}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.modalFareSection}>
                  <Text style={styles.modalFareLabel}>Trip Fare</Text>
                  <Text style={styles.modalFareValue}>
                    R{selectedTrip.actualFare || selectedTrip.fare}
                  </Text>
                </View>

                {selectedTrip.status === 'in-progress' && (
                  <TouchableOpacity
                    style={styles.completeButton}
                    onPress={() => handleCompleteTrip(selectedTrip._id)}
                  >
                    <Ionicons name="checkmark-done-circle" size={20} color="#fff" />
                    <Text style={styles.completeButtonText}>Complete Trip</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f6f6f6' },
  logo: { width: 60, height: 60, resizeMode: 'contain' },
  headerBackground: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  welcome: { fontSize: 16, color: '#fff', marginBottom: 4 },
  carRegistration: { fontSize: 13, color: '#E0E0E0', marginBottom: 8 },
  heading: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  activeToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  contentContainer: { padding: 20 },
  subheading: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 10,
    color: '#333',
  },
  statusCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  requestsSection: {
    marginBottom: 20,
  },
  requestCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestParent: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  requestFare: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF9800',
  },
  requestLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  requestLocationText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  requestMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  requestMetaText: {
    fontSize: 12,
    color: '#999',
  },
  upcomingSection: {
    marginBottom: 20,
  },
  upcomingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  upcomingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  upcomingParent: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  upcomingTime: {
    fontSize: 13,
    color: '#666',
  },
  countdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0E6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  countdownText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5A0FC8',
  },
  upcomingLocations: {
    marginBottom: 12,
  },
  upcomingLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  upcomingLocationText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  upcomingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  upcomingFare: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00C853',
  },
  startButton: {
    backgroundColor: '#5A0FC8',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  startButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  historySection: {
    marginBottom: 20,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  toggleButtonText: {
    color: '#5A0FC8',
    fontSize: 14,
    fontWeight: '600',
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#5A0FC8',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyParent: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  historyDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  historyMetaText: {
    fontSize: 13,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
  earningCard: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 20,
  },
  earningAmountWhite: { fontWeight: 'bold', fontSize: 28, color: '#fff' },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  featureButton: {
    width: '48%',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonTextWhite: { fontWeight: 'bold', color: '#fff', marginTop: 8 },
  emergencyButton: {
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  emergencyText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  settingsButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  modalClose: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalValue: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  modalLocationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  modalLocationText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    lineHeight: 20,
  },
  modalDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  modalDetailText: {
    fontSize: 14,
    color: '#666',
  },
  modalFareSection: {
    backgroundColor: '#F0E6FF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalFareLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5A0FC8',
  },
  modalFareValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#5A0FC8',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  declineButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#FF3B30',
  },
  declineButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  acceptButton: {
    backgroundColor: '#00C853',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});