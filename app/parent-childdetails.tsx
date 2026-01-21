import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';

const API_BASE_URL = 'https://temp-weld-rho.vercel.app';

interface ChildData {
  _id?: string;
  id?: string;
  name: string;
  surname?: string; // ✅ ADDED - was missing
  age?: number;
  grade?: string;
  schoolName?: string;
  homeAddress?: string;
  schoolAddress?: string;
  parentName?: string;
  relationship?: string;
  parentContact?: string;
  gender?: string;
}

export default function ChildDetailsScreen() {
  const router = useRouter();
  const { childId } = useLocalSearchParams();
  const [child, setChild] = useState<ChildData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      if (childId && typeof childId === 'string') {
        console.log('[ChildDetails] Screen focused, fetching data for:', childId);
        fetchChildDetails();
      } else {
        setError('No child ID provided');
        setLoading(false);
      }
    }, [childId])
  );

  const fetchChildDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('[ChildDetails] Fetching for childId:', childId);

      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem('userToken');
      console.log('[ChildDetails] Token retrieved:', !!token);

      if (!token) {
        console.error('[ChildDetails] No token found in storage');
        
        // Try to refresh from stored user data
        const userData = await AsyncStorage.getItem('userData');
        console.log('[ChildDetails] Stored userData exists:', !!userData);
        
        setError('Authentication required');
        Alert.alert(
          'Session Expired',
          'Please login again to continue.',
          [
            {
              text: 'Go to Login',
              onPress: () => {
                router.replace('/login');
              },
            },
          ]
        );
        setLoading(false);
        return;
      }

      const url = `${API_BASE_URL}/api/user/children/${childId}`;
      console.log('[ChildDetails] Making request to:', url);
      console.log('[ChildDetails] Using token:', token.substring(0, 20) + '...');

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log('[ChildDetails] Response status:', response.status);

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.error('[ChildDetails] Unauthorized (401/403)');
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.removeItem('userData');

          setError('Session expired');
          Alert.alert(
            'Unauthorized',
            'Your session has expired. Please login again.',
            [
              {
                text: 'Go to Login',
                onPress: () => {
                  router.replace('/login');
                },
              },
            ]
          );
          return;
        }

        if (response.status === 404) {
          setError('Child not found');
          Alert.alert(
            'Not Found',
            'This child record does not exist.',
            [
              {
                text: 'Go Back',
                onPress: () => router.back(),
              },
            ]
          );
          return;
        }

        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('[ChildDetails] Response data received:', !!data);

      const childData: ChildData = data.child || data;
      console.log('[ChildDetails] Parsed child data:', childData);

      if (!childData || typeof childData !== 'object') {
        throw new Error('Invalid child data received');
      }

      setChild(childData);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch child details';
      console.error('[ChildDetails] Fetch error:', err);
      setError(errorMessage);

      Alert.alert(
        'Error',
        `${errorMessage}\n\nPlease check your connection and try again.`,
        [
          {
            text: 'Retry',
            onPress: () => fetchChildDetails(),
          },
          {
            text: 'Go Back',
            onPress: () => router.back(),
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (child) {
      const childIdValue = child._id || child.id;
      console.log('[ChildDetails] Navigating to edit-child with ID:', childIdValue);

      if (!childIdValue) {
        Alert.alert('Error', 'Child ID is missing. Cannot edit.');
        return;
      }

      router.push({
        pathname: '/edit-child',
        params: { childId: childIdValue },
      });
    }
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <View style={styles.appBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Children</Text>
          <Image
            source={require('../assets/images/logo3.png')}
            style={styles.logo2}
            resizeMode="contain"
          />
        </View>
        <ActivityIndicator size="large" color="#5A0FC8" />
        <Text style={{ marginTop: 10, color: '#999' }}>Loading child details...</Text>
      </View>
    );
  }

  // Error state
  if (error || !child) {
    return (
      <View style={styles.container}>
        <View style={styles.appBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Children</Text>
          <Image
            source={require('../assets/images/logo3.png')}
            style={styles.logo2}
            resizeMode="contain"
          />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
          <Ionicons name="alert-circle-outline" size={48} color="#999" />
          <Text style={{ color: '#666', fontSize: 16, marginTop: 15, textAlign: 'center' }}>
            {error || 'Child details not found'}
          </Text>
          <TouchableOpacity
            style={{ marginTop: 25, paddingVertical: 10, paddingHorizontal: 25, backgroundColor: '#5A0FC8', borderRadius: 8 }}
            onPress={fetchChildDetails}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ✅ FIXED - Display full name with surname
  const fullName = child.surname 
    ? `${child.name} ${child.surname}` 
    : child.name || 'Unknown';

  return (
    <View style={styles.container}>
      {/* App Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Children</Text>
        <Image
          source={require('../assets/images/logo3.png')}
          style={styles.logo2}
          resizeMode="contain"
        />
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image
          source={require('../assets/images/child-profile-6.jpeg')}
          style={styles.avatar}
        />
        <Text style={styles.heading}>{fullName}</Text>
        <Text style={styles.subtitle}>
          Age: {child.age || 'N/A'} | Grade: {child.grade || 'N/A'}
        </Text>

        <View style={styles.detailsBox}>
          {/* ✅ ADDED - Display gender if available */}
          {child.gender && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Gender:</Text>
              <Text style={styles.detailValue}>
                {child.gender.charAt(0).toUpperCase() + child.gender.slice(1)}
              </Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>School:</Text>
            <Text style={styles.detailValue}>{child.schoolName || 'N/A'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Home Address:</Text>
            <Text style={styles.detailValue}>{child.homeAddress || 'N/A'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>School Address:</Text>
            <Text style={styles.detailValue}>{child.schoolAddress || 'N/A'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Parent Name:</Text>
            <Text style={styles.detailValue}>{child.parentName || 'N/A'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Relationship:</Text>
            <Text style={styles.detailValue}>{child.relationship || 'N/A'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Contact:</Text>
            <Text style={styles.detailValue}>{child.parentContact || 'N/A'}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Floating Edit Button */}
      <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
        <Feather name="edit" size={18} color="#fff" />
        <Text style={styles.editText}>Edit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  appBar: {
    height: 120,
    backgroundColor: '#5A0FC8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 40,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 5,
  },
  backBtn: {
    padding: 6,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  logo2: {
    width: 60,
    height: 40,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
    alignItems: 'center',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginTop: 10,
    marginBottom: 15,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  detailsBox: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#5A0FC8',
    marginBottom: 2,
  },
  detailValue: {
    color: '#333',
    fontSize: 14,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#5A0FC8',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    position: 'absolute',
    bottom: 25,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  editText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});