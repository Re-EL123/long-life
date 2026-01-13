import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const CreateAccount = () => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: any = {};
    if (!name) newErrors.name = 'Name is required';
    if (!surname) newErrors.surname = 'Surname is required';
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Enter a valid email';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!role) newErrors.role = 'Please select a role';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);

    try {
      const res = await fetch('https://temp-weld-rho.vercel.app/api/auth/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name,
          surname,
          email,
          password,
          role, // "parent" or "driver"
        }),
      });

      const data = await res.json();
      console.log('Server response:', data); // Debug log

      if (!res.ok) {
        Alert.alert('Error', data.message || 'Failed to create account');
      } else {
        Alert.alert(
          'Success', 
          'Account created successfully!',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/LoginPage')
            }
          ]
        );
      }
    } catch (err) {
      console.error('Registration error:', err);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.appBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Create Account</Text>
        <Image
          source={require('../assets/images/logo3.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formCard}>
          <Text style={styles.label}>Name:</Text>
          <TextInput
            placeholder="Enter your name"
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

          <Text style={styles.label}>Surname:</Text>
          <TextInput
            placeholder="Enter your surname"
            style={styles.textInput}
            value={surname}
            onChangeText={setSurname}
            autoCapitalize="words"
          />
          {errors.surname && <Text style={styles.errorText}>{errors.surname}</Text>}

          <Text style={styles.label}>Email:</Text>
          <TextInput
            placeholder="Enter your email"
            keyboardType="email-address"
            style={styles.textInput}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <Text style={styles.label}>Password:</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Enter a password"
              secureTextEntry={!showPassword}
              style={styles.textInputFlex}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={22}
                color="#333"
                style={{ marginLeft: 10 }}
              />
            </TouchableOpacity>
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          <Text style={styles.label}>Confirm Password:</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Confirm your password"
              secureTextEntry={!showConfirmPassword}
              style={styles.textInputFlex}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Ionicons
                name={showConfirmPassword ? 'eye-off' : 'eye'}
                size={22}
                color="#333"
                style={{ marginLeft: 10 }}
              />
            </TouchableOpacity>
          </View>
          {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

          <Text style={styles.label}>Select Role:</Text>
          <View style={styles.choiceContainer}>
            <TouchableOpacity
              style={[styles.choiceButton, role === 'parent' && styles.choiceSelected]}
              onPress={() => setRole('parent')}
            >
              <Text style={[styles.choiceText, role === 'parent' && styles.choiceTextSelected]}>
                Parent
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.choiceButton, role === 'driver' && styles.choiceSelected]}
              onPress={() => setRole('driver')}
            >
              <Text style={[styles.choiceText, role === 'driver' && styles.choiceTextSelected]}>
                Driver
              </Text>
            </TouchableOpacity>
          </View>
          {errors.role && <Text style={styles.errorText}>{errors.role}</Text>}
        </View>

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Create Account</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default CreateAccount;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  appBar: {
    height: 100,
    backgroundColor: '#5A0FC8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  backBtn: {
    padding: 6,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  logo: {
    width: 55,
    height: 40,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 50,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  label: {
    fontSize: 15,
    color: '#333',
    marginBottom: 6,
    marginTop: 10,
    fontWeight: '600',
  },
  textInput: {
    padding: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    marginTop: 5,
    height: 45,
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
    color: '#000',
  },
  choiceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 10,
  },
  choiceButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  choiceSelected: {
    backgroundColor: '#5A0FC8',
    borderColor: '#5A0FC8',
  },
  choiceText: {
    color: '#333',
    fontWeight: '600',
  },
  choiceTextSelected: {
    color: '#fff',
  },
  button: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#5A0FC8',
    borderRadius: 8,
    width: '60%',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    minHeight: 45,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 3,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 10,
    marginTop: 5,
    height: 45,
  },
  textInputFlex: {
    flex: 1,
    height: '100%',
    color: '#000',
  },
});
