import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const WalletLoadVoucher = () => {
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherAmount, setVoucherAmount] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  const router = useRouter();

  const handleVoucherLoad = () => {
    if (!voucherCode.trim() || !voucherAmount.trim()) {
      Alert.alert('Error', 'Please enter both voucher code and amount.');
      return;
    }
    setIsLoaded(true);
    Alert.alert(
      'Success',
      `Voucher ${voucherCode} loaded successfully!\nAmount: R${voucherAmount}`
    );
  };

  const handleDone = () => {
    router.push('/Parent-wallet' as any);
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Load Voucher</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Inputs */}
      <View style={styles.content}>
        <TextInput
          style={styles.input}
          placeholder="Enter voucher code"
          value={voucherCode}
          onChangeText={setVoucherCode}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter voucher amount"
          value={voucherAmount}
          onChangeText={setVoucherAmount}
          keyboardType="numeric"
        />

        {/* Buttons */}
        {!isLoaded ? (
          <TouchableOpacity style={styles.button} onPress={handleVoucherLoad}>
            <Text style={styles.buttonText}>Load Voucher</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleDone}>
            <Text style={styles.buttonText}>Done</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 15,
    backgroundColor: '#5A0FC8',
  },
  backButton: {
    marginRight: 10,
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginRight: 30,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  input: {
    width: '90%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#5A0FC8',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default WalletLoadVoucher;
