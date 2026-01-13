import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function WithdrawScreen() {
  const router = useRouter();

  const handleWithdraw = () => {
    Alert.alert(
      "Confirm Withdrawal",
      "Are you sure you want to withdraw this amount?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Withdraw",
          style: "destructive",
          onPress: () => {
            router.push("/driver-wallet");
            Alert.alert("Withdrawal Requested", "You have requested a withdrawal.");
          },
        },
      ]
    );
  };

  return (
    <View style={styles.root}>
      {/* App Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => router.push('/driver-wallet')}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.heading}>Withdraw</Text>
        <Image source={require('../assets/images/logo2.png')} style={styles.logo} />
      </View>

      {/* Total Income Card */}
      <View style={styles.incomeCard}>
        <Text style={styles.subtitle}>Total income</Text>
        <Text style={styles.heading}>R6 900.00</Text>
        <Text style={styles.body}>↑ 58%</Text>
      </View>

      {/* Withdraw Form */}
      <View style={styles.formContainer}>
        <Text style={[styles.body, { color: '#5A0FC8' }]}>Enter withdrawal amount</Text>
        <TextInput
          placeholder="R 0,00"
          placeholderTextColor="#888"
          style={styles.input}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.button} onPress={handleWithdraw}>
          <Text style={styles.buttonText}>Request Withdrawal</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  appBar: {
    height: 120,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#5A0FC8', // solid purple
  },
  logo: { width: 70, height: 50, resizeMode: 'contain' },
  heading: {
    fontFamily: Platform.OS === 'ios' ? 'Montserrat' : 'sans-serif',
    fontWeight: '700',
    fontSize: 24,
    color: "#fff",
    textAlign: "center",
  },
  subtitle: {
    fontFamily: Platform.OS === 'ios' ? 'Montserrat' : 'sans-serif',
    fontWeight: '400',
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
  },
  body: {
    fontFamily: Platform.OS === 'ios' ? 'Montserrat' : 'sans-serif',
    fontWeight: '400',
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
  },
  incomeCard: { 
    backgroundColor: '#222', 
    borderRadius: 10, 
    padding: 20, 
    margin: 20, 
    alignItems: 'center' 
  },
  formContainer: { 
    backgroundColor: '#fff', 
    marginHorizontal: 20, 
    borderRadius: 10, 
    padding: 24, 
    alignItems: 'center' 
  },
  input: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Montserrat' : 'sans-serif',
    width: "100%",
    marginTop: 12,
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: '#5A0FC8', // solid purple
    borderRadius: 10,
    paddingVertical: 14,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    fontFamily: Platform.OS === 'ios' ? 'Montserrat' : 'sans-serif',
    fontWeight: '700',
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
  },
});
