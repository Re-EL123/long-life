import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const colors = {
  primary: '#5A0FC8', // dashboard purple
  background: '#fff',
  inputBorder: '#ccc',
  inputIcon: '#333',
  textPrimary: '#333',
  buttonText: '#fff',
  contactText: '#555',
};

export default function ContactScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = () => {
    alert("Message sent!");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact</Text>
        <Image source={require('@/assets/images/logo2.png')} style={styles.logo} />
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Text style={styles.title}>We’d love to help</Text>

        {/* Inputs */}
        <View style={styles.inputContainer}>
          <MaterialIcons name="person" size={20} color={colors.inputIcon} style={styles.icon} />
          <TextInput
            placeholder="Name"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialIcons name="email" size={20} color={colors.inputIcon} style={styles.icon} />
          <TextInput
            placeholder="Email"
            keyboardType="email-address"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputContainer}>
          <FontAwesome name="phone" size={20} color={colors.inputIcon} style={styles.icon} />
          <TextInput
            placeholder="Contact"
            keyboardType="phone-pad"
            style={styles.input}
            value={contact}
            onChangeText={setContact}
          />
        </View>

        <View style={[styles.inputContainer, styles.messageBox]}>
          <Ionicons name="chatbox-ellipses" size={20} color={colors.inputIcon} style={styles.icon} />
          <TextInput
            placeholder="Message"
            multiline
            numberOfLines={4}
            style={[styles.input, styles.textArea]}
            value={message}
            onChangeText={setMessage}
          />
        </View>

        {/* Send Button */}
        <TouchableOpacity style={[styles.sendButton, { backgroundColor: colors.primary }]} onPress={handleSend}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>

        {/* Contact Info */}
        <View style={styles.contactInfo}>
          <View style={styles.contactRow}>
            <FontAwesome name="phone" size={20} color={colors.contactText} />
            <Text style={styles.contactText}>011 258 66515</Text>
          </View>
          <View style={styles.contactRow}>
            <MaterialIcons name="email" size={20} color={colors.contactText} />
            <Text style={styles.contactText}>Admin@safe.co.za</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flexGrow: 1,
  },
  header: {
    height: 120,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
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
  form: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    alignSelf: "center",
    color: colors.textPrimary,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginBottom: 15,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  messageBox: {
    height: 100,
    alignItems: 'flex-start',
  },
  textArea: {
    height: '100%',
    textAlignVertical: 'top',
  },
  sendButton: {
    marginVertical: 20,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.buttonText,
  },
  contactInfo: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#ddd',
    paddingTop: 10,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  contactText: {
    marginLeft: 8,
    color: colors.contactText,
    fontSize: 14,
  },
});
