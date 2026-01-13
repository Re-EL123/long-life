import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';

const ResetPasswordScreen = () => {
  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require('../assets/images/LANDING PAGE.png')}
        style={styles.logo}
      />

      {/* Title */}
      <Text style={styles.title}>Reset Password</Text>

      {/* Send Code Button */}
      <TouchableOpacity
        style={styles.sendCodeButton}
        onPress={() => router.push("/resetPassord")}
      >
        <Text style={styles.sendCodeText}>Send code</Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Don’t have an account?</Text>
        <TouchableOpacity>
          <Text style={styles.createNow}>Create now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ResetPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5A0FC8', // solid purple background
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 180,
    height: 180,
    borderRadius: 90,
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
  },
  sendCodeButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 40,
  },
  sendCodeText: {
    color: '#3a0ca3',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    color: '#fff',
  },
  createNow: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
