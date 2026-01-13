import React from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function AboutUsScreen() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
        <Image
          source={require("@/assets/images/logo2.png")}
          style={styles.logo}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Introduction */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <FontAwesome5 name="users" size={18} color="#5A0FC8" />
            <Text style={styles.sectionTitle}>Who We Are</Text>
          </View>
          <Text style={styles.sectionText}>
            Safe School Ride is a reliable and secure transport service designed
            to ensure that children travel safely between school and home. Our
            mission is to provide parents with peace of mind and drivers with a
            structured system to manage trips efficiently.
          </Text>
        </View>

        {/* Our Mission */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="flag" size={20} color="#5A0FC8" />
            <Text style={styles.sectionTitle}>Our Mission</Text>
          </View>
          <Text style={styles.sectionText}>
            We aim to build trust between parents, schools, and drivers by
            offering a safe, transparent, and technology-driven solution. Our
            platform ensures that every trip is tracked, every driver is vetted,
            and every child is safe.
          </Text>
        </View>

        {/* What We Offer */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="local-offer" size={20} color="#5A0FC8" />
            <Text style={styles.sectionTitle}>What We Offer</Text>
          </View>
          <Text style={styles.sectionText}>
            - Real-time trip tracking{"\n"}
            - Verified and trained drivers{"\n"}
            - Easy communication between parents and drivers{"\n"}
            - Secure payment and withdrawal system{"\n"}
            - Detailed trip history and earnings reports
          </Text>
        </View>

        {/* Vision */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="eye" size={20} color="#5A0FC8" />
            <Text style={styles.sectionTitle}>Our Vision</Text>
          </View>
          <Text style={styles.sectionText}>
            To become the most trusted child transport solution in the country,
            ensuring safety, comfort, and reliability for every family.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: "#5A0FC8",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  logo: {
    width: 70,
    height: 50,
    resizeMode: "contain",
  },
  content: {
    padding: 20,
    backgroundColor: "#fff",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#5A0FC8",
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#555",
  },
});
