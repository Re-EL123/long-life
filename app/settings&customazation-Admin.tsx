import React, { useState } from "react"; 
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const schoolsData = [
  { id: "1", name: "Pretoria Girls", address: "24 Fulcum St, Runnemedsane", contact: "022 786 2345" },
  { id: "2", name: "Richwood", address: "206 E Andrus Ave, Crayham", contact: "011 875 1932" },
  { id: "3", name: "Bethany", address: "5 Kessler St, Northpoint", contact: "014 445 0538" },
];

export default function SchoolProfileScreen() {
  const [search, setSearch] = useState("");

  const filteredSchools = schoolsData.filter((school) =>
    school.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>⚙️ Settings & Customization</Text>

      <View style={styles.tabs}>
        <Text style={styles.tabWhite}>App Settings</Text>
        <Text style={styles.tabActive}>School Profile</Text>
        <Text style={styles.tabWhite}>Log Out</Text>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search by school name"
        placeholderTextColor="#999"
        value={search}
        onChangeText={setSearch}
      />

      {/* Table Headers */}
      <View style={styles.tableHeader}>
        <Text style={styles.headerText}>School</Text>
        <Text style={styles.headerText}>Address</Text>
        <Text style={styles.headerText}>Contact</Text>
      </View>

      <FlatList
        data={filteredSchools}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.tableRow}>
            <Text style={styles.rowText}>{item.name}</Text>
            <Text style={styles.rowText}>{item.address}</Text>
            <Text style={styles.rowText}>{item.contact}</Text>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="pencil" size={18} color="white" />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#5A0FC8", // consistent purple header
    marginBottom: 20,
    textAlign: "center",
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  tabWhite: {
    fontSize: 16,
    color: "#5A0FC8",
    backgroundColor: "#fff",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    fontWeight: "bold",
  },
  tabActive: {
    fontSize: 16,
    color: "#fff",
    backgroundColor: "#5A0FC8",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    fontWeight: "bold",
  },
  searchInput: {
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    color: "#333",
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#5A0FC8",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  headerText: {
    color: "#fff",
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  rowText: {
    color: "#333",
    flex: 1,
    textAlign: "center",
    fontSize: 14,
  },
  editButton: {
    backgroundColor: "#5A0FC8",
    padding: 6,
    borderRadius: 10,
    marginLeft: 8,
  },
});
