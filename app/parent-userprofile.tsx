import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ActivityIndicator, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

const UserProfileScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    surname: '',
    role: '',
    email: '',
    phone: '',
    location: '',
    children: []
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      
      // Check if running on web
      if (Platform.OS === 'web') {
        // Use browser geolocation API for web
        return new Promise((resolve) => {
          if (!navigator.geolocation) {
            Alert.alert('Error', 'Geolocation is not supported by your browser');
            resolve(null);
            return;
          }

          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                const { latitude, longitude } = position.coords;
                
                // Try reverse geocoding
                try {
                  const [address] = await Location.reverseGeocodeAsync({
                    latitude,
                    longitude,
                  });

                  if (address) {
                    const formattedAddress = [
                      address.streetNumber,
                      address.street,
                      address.district,
                      address.city,
                      address.region,
                      address.postalCode,
                      address.country
                    ].filter(Boolean).join(', ');

                    resolve({
                      address: formattedAddress || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                      latitude,
                      longitude,
                    });
                    return;
                  }
                } catch (geocodeError) {
                  console.log('Reverse geocoding not available on web, using coordinates');
                }

                // Fallback to coordinates if geocoding fails
                resolve({
                  address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                  latitude,
                  longitude,
                });
              } catch (error) {
                console.error('Error processing location:', error);
                resolve(null);
              }
            },
            (error) => {
              console.error('Geolocation error:', error);
              let errorMessage = 'Unable to get your location. ';
              
              switch(error.code) {
                case error.PERMISSION_DENIED:
                  errorMessage += 'Please enable location access in your browser settings.';
                  break;
                case error.POSITION_UNAVAILABLE:
                  errorMessage += 'Location information is unavailable.';
                  break;
                case error.TIMEOUT:
                  errorMessage += 'Location request timed out.';
                  break;
                default:
                  errorMessage += 'Please try again later.';
              }
              
              Alert.alert('Location Error', errorMessage);
              resolve(null);
            },
            {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 10000
            }
          );
        });
      }
      
      // Mobile (iOS/Android) - use expo-location
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to get your current location.'
        );
        return null;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Reverse geocode to get address
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address) {
        // Format address
        const formattedAddress = [
          address.streetNumber,
          address.street,
          address.district,
          address.city,
          address.region,
          address.postalCode,
          address.country
        ].filter(Boolean).join(', ');

        return {
          address: formattedAddress || `${location.coords.latitude}, ${location.coords.longitude}`,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
      }

      return {
        address: `${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get current location. Please try again.');
      return null;
    } finally {
      setLocationLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      // Get stored user data from AsyncStorage
      const token = await AsyncStorage.getItem('token');
      const role = await AsyncStorage.getItem('role');
      const userName = await AsyncStorage.getItem('userName');
      const userEmail = await AsyncStorage.getItem('userEmail');
      const userId = await AsyncStorage.getItem('userId');

      if (!token || !userId) {
        // No user logged in, redirect to login
        Alert.alert('Error', 'Please log in first');
        router.replace('/LoginPage');
        return;
      }

      // Fetch full user profile from backend
      try {
        const res = await fetch(`https://temp-weld-rho.vercel.app/api/user/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (res.ok) {
          const data = await res.json();
          
          // Get current location if not set or if user wants to update
          let locationData = data.user.location || data.user.address;
          
          // If no location stored, get current location
          if (!locationData || locationData === 'Not provided') {
            const currentLocation = await getCurrentLocation();
            if (currentLocation) {
              locationData = currentLocation.address;
              
              // Update backend with current location
              try {
                await fetch(`https://temp-weld-rho.vercel.app/api/user/profile`, {
                  method: 'PUT',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    location: currentLocation.address,
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                  }),
                });
              } catch (updateError) {
                console.log('Could not update location on backend:', updateError);
              }
            }
          }
          
          setUserData({
            name: data.user.name || userName || '',
            surname: data.user.surname || '',
            role: data.user.role || role || '',
            email: data.user.email || userEmail || '',
            phone: data.user.phone || 'Not provided',
            location: locationData || 'Not provided',
            children: data.user.children || []
          });
        } else {
          // Fallback to stored data if API fails
          const currentLocation = await getCurrentLocation();
          
          setUserData({
            name: userName || 'User',
            surname: '',
            role: role || 'user',
            email: userEmail || '',
            phone: 'Not provided',
            location: currentLocation ? currentLocation.address : 'Not provided',
            children: []
          });
        }
      } catch (fetchError) {
        console.error('Error fetching user profile:', fetchError);
        
        // Use cached data as fallback
        setUserData({
          name: userName || 'User',
          surname: '',
          role: role || 'user',
          email: userEmail || '',
          phone: 'Not provided',
          location: 'Not provided',
          children: []
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // Use cached data as fallback
      const userName = await AsyncStorage.getItem('userName');
      const userEmail = await AsyncStorage.getItem('userEmail');
      const role = await AsyncStorage.getItem('role');
      
      setUserData({
        name: userName || 'User',
        surname: '',
        role: role || 'user',
        email: userEmail || '',
        phone: 'Not provided',
        location: 'Not provided',
        children: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshLocation = async () => {
    Alert.alert(
      'Update Location',
      'Do you want to update your location to your current position?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Update',
          onPress: async () => {
            const currentLocation = await getCurrentLocation();
            if (currentLocation) {
              setUserData(prev => ({
                ...prev,
                location: currentLocation.address
              }));

              // Update backend
              try {
                const token = await AsyncStorage.getItem('token');
                const updateRes = await fetch(`https://temp-weld-rho.vercel.app/api/user/profile`, {
                  method: 'PUT',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    location: currentLocation.address,
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                  }),
                });
                
                if (updateRes.ok) {
                  Alert.alert('Success', 'Location updated successfully');
                } else {
                  Alert.alert('Warning', 'Location updated locally but could not sync with server');
                }
              } catch (error) {
                console.error('Error updating location:', error);
                Alert.alert('Warning', 'Location updated locally but could not sync with server');
              }
            }
          }
        }
      ]
    );
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all stored data
              await AsyncStorage.multiRemove([
                'token',
                'role',
                'userId',
                'userName',
                'userEmail'
              ]);
              
              // Redirect to login
              router.replace('/LoginPage');
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          }
        }
      ]
    );
  };

  // Format role for display
  const formatRole = (role) => {
    if (!role) return 'User';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  // Get full name
  const getFullName = () => {
    const fullName = `${userData.name} ${userData.surname}`.trim();
    return fullName || 'User Name';
  };

  // Get children names
  const getChildrenNames = () => {
    if (userData.children && userData.children.length > 0) {
      return userData.children.map(child => child.name || child).join(', ');
    }
    return 'No linked children';
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* App Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Profile</Text>

        <View style={styles.avatarPlaceholder}>
          <FontAwesome name="user-circle" size={60} color="#555" />
        </View>
      </View>

      {/* Info Card */}
      <View style={styles.card}>
        <Text style={styles.heading}>Full Name: {getFullName()}</Text>
        <Text style={styles.body}>User Role: {formatRole(userData.role)}</Text>
        <Text style={styles.body}>Email: {userData.email}</Text>
        <Text style={styles.body}>Phone Number: {userData.phone}</Text>
        
        <View style={styles.locationContainer}>
          <Text style={styles.body}>
            Location: {locationLoading ? 'Getting location...' : userData.location}
          </Text>
          <TouchableOpacity 
            onPress={handleRefreshLocation}
            disabled={locationLoading}
            style={styles.refreshButton}
          >
            <FontAwesome 
              name="refresh" 
              size={14} 
              color="#5A0FC8" 
            />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.body}>Linked Children: {getChildrenNames()}</Text>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.button} onPress={handleSignOut}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default UserProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5A0FC8', // purple background
    alignItems: 'center',
  },
  header: {
    width: '100%',
    backgroundColor: '#5A0FC8',
    paddingVertical: 40,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  avatarPlaceholder: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 60,
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '90%',
    backgroundColor: '#fff', // white background
    borderRadius: 12,
    padding: 20,
    marginTop: -50,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333', // dark gray border
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 10,
  },
  body: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
    marginBottom: 6,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  refreshButton: {
    marginLeft: 8,
    padding: 4,
  },
  button: {
    backgroundColor: '#5A0FC8',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 40,
    marginTop: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
});
