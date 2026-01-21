import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const trips = [
  { id: "#126", name: "Boitumelo Khumalo", date: "15/01/2023", pickup: "12 Mati Ave kew", dropoff: "156 Katherine street sandown", pickTime: "07:30", dropTime: "15:30" },
  { id: "#127", name: "Themba Nxumalo", date: "15/01/2023", pickup: "25 Capricorn Drive Sandton", dropoff: "36 Kenya drive kelvin", pickTime: "07:12", dropTime: "14:20" },
  { id: "#128", name: "Kim Maluleke", date: "15/01/2023", pickup: "25 Tim Street Benmore", dropoff: "156 Katherine street sandown", pickTime: "06:30", dropTime: "15:15" },
  { id: "#129", name: "Thomas Mashilo", date: "15/01/2023", pickup: "25 Tim Street Benmore", dropoff: "156 Katherine street sandown", pickTime: "06:40", dropTime: "15:40" },
  { id: "#130", name: "Beauty Marope", date: "15/01/2023", pickup: "25 Tim Street Benmore", dropoff: "156 Katherine street sandown", pickTime: "06:50", dropTime: "15:35" },
  { id: "#131", name: "Tshepang Bafukazi", date: "15/01/2023", pickup: "25 Tim Street Benmore", dropoff: "156 Katherine street sandown", pickTime: "06:15", dropTime: "14:40" },
];

const TripsScreen = () => {
  const [activeTab, setActiveTab] = useState("On going");
  const [search, setSearch] = useState("");

  const filteredTrips = trips.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trips</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Status Tabs */}
        <View style={styles.tabContainer}>
          {[
            { label: "Completed", count: 12 },
            { label: "Pending", count: 1 },
            { label: "On going", count: 35 },
            { label: "Canceled", count: 5 },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.label}
              style={[styles.tab, activeTab === tab.label && styles.activeTab]}
              onPress={() => setActiveTab(tab.label)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.label && styles.activeTabText,
                ]}
              >
                {tab.label}
              </Text>
              <Text style={styles.count}>{tab.count}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Filter Row */}
        <View style={styles.filterRow}>
          <Ionicons name="options-outline" size={20} color="#333" />
          <View style={styles.filterBox}>
            <Text>All drivers</Text>
          </View>
          <TextInput
            style={styles.searchBar}
            placeholder="Search"
            value={search}
            onChangeText={setSearch}
          />
          <Ionicons name="search-outline" size={20} color="#333" />
        </View>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          {[
            "Trip ID",
            "Name",
            "Date",
            "Pick up Point",
            "Drop off Point",
            "Pick up Time",
            "Drop off Time",
          ].map((col, i) => (
            <Text key={i} style={styles.tableHeaderText}>
              {col}
            </Text>
          ))}
        </View>

        {/* Table Rows */}
        {filteredTrips.map((trip, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.cell}>{trip.id}</Text>
            <Text style={styles.cell}>{trip.name}</Text>
            <Text style={styles.cell}>{trip.date}</Text>
            <Text style={styles.cell}>{trip.pickup}</Text>
            <Text style={styles.cell}>{trip.dropoff}</Text>
            <Text style={styles.cell}>{trip.pickTime}</Text>
            <Text style={styles.cell}>{trip.dropTime}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default TripsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#5A0FC8",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    padding: 16,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginHorizontal: 4,
    paddingVertical: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  activeTab: {
    backgroundColor: "#e0e7ff",
    borderColor: "#1e40af",
    borderWidth: 1,
  },
  tabText: {
    fontSize: 13,
    color: "#333",
  },
  activeTabText: {
    fontWeight: "bold",
    color: "#1e40af",
  },
  count: {
    fontWeight: "bold",
    color: "#333",
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  filterBox: {
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  searchBar: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 8,
    marginRight: 4,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    backgroundColor: "#5A0FC8",
    borderRadius: 8,
    marginBottom: 8,
  },
  tableHeaderText: {
    flex: 1,
    fontWeight: "bold",
    fontSize: 12,
    textAlign: "center",
    color: "#fff",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: "#f9f9f9",
    marginBottom: 6,
    borderRadius: 8,
    elevation: 2,
  },
  cell: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    color: "#333",
    paddingHorizontal: 2,
  },
});
