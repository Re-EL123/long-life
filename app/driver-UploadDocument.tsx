import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";

export default function UploadDocumentsScreen() {
  const [documents, setDocuments] = useState<{
    driversLicense: string | null;
    idCopy: string | null;
    prpd: string | null;
    bankConfirmation: string | null;
    selfie: string | null;
    proofOfAddress: string | null;
    vehicleLicenseDisc: string | null;
    inspectionLetter: string | null;
  }>({
    driversLicense: null,
    idCopy: null,
    prpd: null,
    bankConfirmation: null,
    selfie: null,
    proofOfAddress: null,
    vehicleLicenseDisc: null,
    inspectionLetter: null,
  });

  const pickDocument = async (key: string) => {
    let result = await DocumentPicker.getDocumentAsync({});
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setDocuments({ ...documents, [key]: result.assets[0].name });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload Documents</Text>
      </View>

      {/* Instructions */}
      <Text style={styles.instructions}>
        All documents should be certified and not older than 3 months
      </Text>

      {/* Document Upload Fields */}
      {Object.keys(documents).map((key, index) => (
        <TouchableOpacity
          key={index}
          style={styles.uploadField}
          onPress={() => pickDocument(key)}
        >
          <Text style={styles.uploadLabel}>{formatLabel(key)}</Text>
          <Ionicons name="cloud-upload-outline" size={20} color="#666" />
        </TouchableOpacity>
      ))}

      {/* Upload Button */}
      <TouchableOpacity style={styles.uploadButton}>
        <Text style={styles.uploadButtonText}>Upload</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function formatLabel(key: string) {
  switch (key) {
    case "driversLicense":
      return "Drivers License";
    case "idCopy":
      return "ID Copy";
    case "prpd":
      return "PrPD";
    case "bankConfirmation":
      return "Bank Confirmation";
    case "selfie":
      return "Selfie";
    case "proofOfAddress":
      return "Proof of Address";
    case "vehicleLicenseDisc":
      return "Vehicle License Disc";
    case "inspectionLetter":
      return "Inspection Letter";
    default:
      return key;
  }
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: "#5A0FC8", // Solid purple header
  },
  backBtn: {
    marginRight: 10,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  instructions: {
    fontSize: 14,
    color: "#444",
    marginBottom: 15,
    textAlign: "center",
  },
  uploadField: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  uploadLabel: {
    fontSize: 16,
    color: "#333",
  },
  uploadButton: {
    backgroundColor: "#5A0FC8", // Solid purple
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
