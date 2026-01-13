import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ChildDetailsScreen() {
  const router = useRouter();

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
        <Text style={styles.heading}>Alicia Mokoena</Text>
        <Text style={styles.subtitle}>Age: 7 | Grade: 2</Text>

        <View style={styles.detailsBox}>
          <Text style={styles.detailLabel}>School:</Text>
          <Text style={styles.detailValue}>Curro School, Centurion</Text>

          <Text style={styles.detailLabel}>Home Address:</Text>
          <Text style={styles.detailValue}>1193 Khanya Street, Katlehong</Text>

          <Text style={styles.detailLabel}>School Address:</Text>
          <Text style={styles.detailValue}>Curro School, Centurion</Text>

          <Text style={styles.detailLabel}>Parent Name:</Text>
          <Text style={styles.detailValue}>Mr. Mokoena</Text>

          <Text style={styles.detailLabel}>Relationship:</Text>
          <Text style={styles.detailValue}>Father</Text>

          <Text style={styles.detailLabel}>Contact:</Text>
          <Text style={styles.detailValue}>+27 82 456 7890</Text>
        </View>
      </ScrollView>

      {/* Edit Button */}
      <TouchableOpacity style={styles.editButton}>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingTop: 40,
  },
  backBtn: {
    padding: 6,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  logo2: {
    width: 60,
    height: 40,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
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
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  detailsBox: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  detailLabel: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#5A0FC8',
    marginTop: 12,
  },
  detailValue: {
    color: '#333',
    fontSize: 14,
    marginTop: 2,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#5A0FC8',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 10,
    position: 'absolute',
    bottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  editText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: "center",
  },
});
