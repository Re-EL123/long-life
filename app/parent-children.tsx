import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Icon from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Child {
  id: string;
  name: string;
  gender: "male" | "female";
  age?: number;
  grade?: string;
}

const ChildrenScreen = () => {
  const router = useRouter();
  const [childrenData, setChildrenData] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadChildren();
  }, []);

  // Refresh children when screen gains focus
  useEffect(() => {
    const unsubscribe = router.addListener?.('focus' as any, () => {
      loadChildren();
    });

    return unsubscribe;
  }, [router]);

  const loadChildren = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');

      if (!token || !userId) {
        Alert.alert('Error', 'Please log in first');
        router.replace('/LoginPage');
        return;
      }

      // Fetch children from backend
      const response = await fetch(`https://temp-weld-rho.vercel.app/api/user/children`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Transform backend data to match Child interface
        const transformedChildren = data.children.map((child: any) => ({
          id: child._id || child.id,
          name: child.name,
          gender: child.gender?.toLowerCase() === 'male' ? 'male' : 'female',
          age: child.age,
          grade: child.grade,
        }));

        setChildrenData(transformedChildren);
      } else if (response.status === 401) {
        Alert.alert('Session Expired', 'Please log in again');
        router.replace('/LoginPage');
      } else {
        console.error('Failed to fetch children:', response.status);
        // Optionally show error to user
      }
    } catch (error) {
      console.error('Error loading children:', error);
      Alert.alert('Error', 'Failed to load children. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadChildren();
  };

  const renderChild = ({ item }: { item: Child }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({ pathname: "/parent-childdetails", params: { childId: item.id } })
      }
    >
      <Icon
        name={item.gender === "male" ? "male" : "female"}
        size={40}
        color="#fff"
      />
      <Text style={styles.childName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="people-outline" size={80} color="#ccc" />
      <Text style={styles.emptyText}>No children added yet</Text>
      <Text style={styles.emptySubtext}>Tap "Add Children" below to get started</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        {/* App Bar */}
        <View style={styles.appBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Children</Text>
          <Image
            source={require("../assets/images/logo3.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Loading Indicator */}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5A0FC8" />
          <Text style={styles.loadingText}>Loading children...</Text>
        </View>

        {/* Add Child Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/parent-AddChildDetails")}
        >
          <Text style={styles.addButtonText}>Add Children</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* App Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Children</Text>
        <Image
          source={require("../assets/images/logo3.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Children Grid */}
      <FlatList
        data={childrenData}
        renderItem={renderChild}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={[
          styles.list,
          childrenData.length === 0 && styles.listEmpty
        ]}
        ListEmptyComponent={renderEmptyState}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      {/* Add Child Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/parent-AddChildDetails")}
      >
        <Text style={styles.addButtonText}>Add Children</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ChildrenScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // white background
  },
  appBar: {
    height: 120,
    backgroundColor: "#5A0FC8", // solid purple
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingTop: 40, // status bar
  },
  backBtn: {
    padding: 6,
  },
  title: {
    fontFamily: "Montserrat",
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  logo: {
    width: 60,
    height: 40,
  },
  list: {
    padding: 20,
    justifyContent: "center",
  },
  listEmpty: {
    flexGrow: 1,
    justifyContent: "center",
  },
  card: {
    flex: 1,
    backgroundColor: "#5A0FC8", // solid purple
    borderRadius: 10,
    padding: 20,
    margin: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  childName: {
    marginTop: 10,
    fontFamily: "Montserrat",
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  addButton: {
    backgroundColor: "#5A0FC8", // solid purple
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: "center",
    marginBottom: 20,
    elevation: 3,
  },
  addButtonText: {
    fontFamily: "Montserrat",
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
    fontFamily: "Montserrat",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginTop: 20,
    fontFamily: "Montserrat",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
    fontFamily: "Montserrat",
  },
});
