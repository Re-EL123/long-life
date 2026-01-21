import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type SectionKey = "trip" | "account" | "membership" | "accessibility" | "guides";

const HelpPage: React.FC = () => {
  const router = useRouter();

  const [expanded, setExpanded] = useState<Record<SectionKey, boolean>>({
    trip: false,
    account: false,
    membership: false,
    accessibility: false,
    guides: false,
  });

  const toggleSection = (section: SectionKey) => {
    setExpanded((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const sections: { key: SectionKey; title: string }[] = [
    { key: "trip", title: "Help with a trip" },
    { key: "account", title: "Account" },
    { key: "membership", title: "Membership" },
    { key: "accessibility", title: "Accessibility" },
    { key: "guides", title: "Guides" },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* App Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <AntDesign name="left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.heading}>Help</Text>
        <View style={{ width: 24 }} /> {/* placeholder for spacing */}
      </View>

      <View style={styles.body}>
        {sections.map(({ key, title }) => (
          <TouchableOpacity
            key={key}
            style={styles.dropdown}
            onPress={() => toggleSection(key)}
          >
            <Text style={styles.dropdownText}>{title}</Text>
            {expanded[key] ? (
              <AntDesign name="up" size={16} color="#fff" />
            ) : (
              <AntDesign name="down" size={16} color="#fff" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

export default HelpPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  appBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: "#5A0FC8",
  },
  heading: {
    fontFamily: "Montserrat",
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  body: {
    padding: 20,
  },
  dropdown: {
    backgroundColor: "#111",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownText: {
    fontFamily: "Montserrat",
    fontSize: 14,
    color: "#fff",
  },
});
