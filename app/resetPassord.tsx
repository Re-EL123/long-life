import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  Alert,
  Image,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const ResetPasswordScreen = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = () => {
    Keyboard.dismiss();

    if (password.length < 9) {
      Alert.alert('Error', 'Password must be at least 9 characters.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    Alert.alert('Success', 'Password reset successfully!');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Reset Password</Text>
        <View style={{ width: 22 }} /> {/* placeholder to center title */}
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>Create a new password</Text>

        <Text style={styles.label}>New password</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter new password"
            placeholderTextColor="#888"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color="#555" />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Confirm password</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter password"
            placeholderTextColor="#888"
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={22} color="#555" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ResetPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    height: 80,
    backgroundColor: '#5A0FC8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  topBarTitle: {
    fontFamily: 'Montserrat',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  subtitle: {
    fontFamily: 'Montserrat',
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 20,
    textAlign: 'center',
  },
  label: {
    fontFamily: 'Montserrat',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
    color: '#000',
  },
  inputWrapper: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    fontFamily: 'Montserrat',
    fontSize: 14,
    color: '#000',
  },
  button: {
    backgroundColor: '#5A0FC8',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    fontFamily: 'Montserrat',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
});
