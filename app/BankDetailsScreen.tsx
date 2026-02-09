import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';

const BankDetailsScreen = () => {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  const [bank, setBank] = useState('');
  const [name, setName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [amount, setAmount] = useState('');

  const handleLoad = () => {
    if (cardNumber.length !== 16) {
      Alert.alert('Error', 'Card number must be 16 digits');
      return;
    }
    if (+expiryYear < currentYear) {
      Alert.alert('Error', 'Expiration year must be this year or later');
      return;
    }
    if (cvv.length !== 3) {
      Alert.alert('Error', 'CVV must be 3 digits');
      return;
    }

    Alert.alert('Success', 'Payment details are valid!');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bank Details</Text>
        <View style={{ width: 22 }} /> {/* placeholder for alignment */}
      </View>

      <Text style={styles.headerText}>ENTER YOUR PAYMENT DETAILS</Text>

      <View style={styles.form}>
        {/* Bank Picker */}
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={bank}
            onValueChange={(itemValue) => setBank(itemValue)}
          >
            <Picker.Item label="Select bank" value="" />
            <Picker.Item label="Capitec" value="Capitec" />
            <Picker.Item label="FNB" value="FNB" />
            <Picker.Item label="TymBank" value="TymBank" />
            <Picker.Item label="Absa Bank" value="Absa" />
            <Picker.Item label="African Bank" value="African" />
            <Picker.Item label="Nedbank" value="Nedbank" />
            <Picker.Item label="Standard Bank" value="Standard" />
          </Picker>
        </View>

        {/* Card Details */}
        <TextInput
          style={styles.input}
          placeholder="Name on card"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Card number"
          keyboardType="numeric"
          maxLength={16}
          value={cardNumber}
          onChangeText={setCardNumber}
        />

        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Expiration month"
            keyboardType="numeric"
            maxLength={2}
            value={expiryMonth}
            onChangeText={setExpiryMonth}
          />
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Expiration year"
            keyboardType="numeric"
            maxLength={4}
            value={expiryYear}
            onChangeText={setExpiryYear}
          />
        </View>

        <TextInput
          style={styles.input}
          placeholder="CVV"
          keyboardType="numeric"
          maxLength={3}
          value={cvv}
          onChangeText={setCvv}
        />
        <TextInput
          style={styles.input}
          placeholder="R amount"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <TouchableOpacity style={styles.button} onPress={handleLoad}>
          <Text style={styles.buttonText}>Load</Text>
        </TouchableOpacity>
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
    backgroundColor: '#5A0FC8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    marginVertical: 20,
  },
  form: {
    paddingHorizontal: 20,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 5,
    marginBottom: 15,
    overflow: 'hidden',
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#5A0FC8',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default BankDetailsScreen;
