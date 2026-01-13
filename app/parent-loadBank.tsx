import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native';

import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';




import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// --- Load Wallet Screen ---
function LoadWalletScreen({ navigation }: any) {
  const [bank, setBank] = useState('');
  const [name, setName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [amount, setAmount] = useState('');

  const banks = [
    'Absa Bank',
    'African Bank',
    'Bidvest Bank',
    'Capitec Bank',
    'Discovery Bank',
    'First National Bank (FNB)',
    'Grindrod Bank',
    'Investec Bank',
    'Nedbank',
    'Sasfin Bank',
    'Standard Bank',
    'TymeBank',
  ];

  const handleLoad = async () => {
    if (!bank || !name || !cardNumber || !expiryMonth || !expiryYear || !cvv || !amount) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    const newBalance = parseFloat(amount);
    const today = new Date().toLocaleDateString();

  

    Alert.alert(
      'Success',
      `R${amount} loaded successfully from ${name}!`,
      [
        {
          text: 'OK',
          onPress: () =>
            navigation.navigate('wallet-details', {
              bank,
              name,
              amount: newBalance,
              date: today,
            }),
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <LinearGradient colors={['#5A0FC8', '#E64487']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wallet Load</Text>
        <View style={{ width: 20 }} />
      </LinearGradient>

      <ScrollView style={styles.container}>
        <Text style={styles.title}>Load Wallet</Text>
        <Text style={styles.subtitle}>ENTER YOUR PAYMENT DETAILS</Text>

        <View style={styles.pickerContainer}>
          <Picker selectedValue={bank} onValueChange={setBank}>
            <Picker.Item label="Select bank" value="" />
            {banks.map((b, i) => (
              <Picker.Item key={i} label={b} value={b} />
            ))}
          </Picker>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Name on card"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Card number"
          keyboardType="number-pad"
          value={cardNumber}
          onChangeText={setCardNumber}
        />

        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1, marginRight: 10 }]}
            placeholder="Exp. month"
            keyboardType="number-pad"
            value={expiryMonth}
            onChangeText={setExpiryMonth}
          />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Exp. year"
            keyboardType="number-pad"
            value={expiryYear}
            onChangeText={setExpiryYear}
          />
        </View>

        <TextInput
          style={styles.input}
          placeholder="CVV"
          keyboardType="number-pad"
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

        <View style={styles.cardLogos}>
          <Image
            source={{ uri: 'https://img.icons8.com/color/48/visa.png' }}
            style={styles.icon}
          />
          <Image
            source={{ uri: 'https://img.icons8.com/color/48/mastercard-logo.png' }}
            style={styles.icon}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLoad}>
          <Text style={styles.buttonText}>Load</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// --- Wallet Details Screen ---
function WalletDetailsScreen({ route, navigation }: any) {
  const [balance, setBalance] = useState(0);
  const [bank, setBank] = useState('');
  const [name, setName] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const params = route.params || {};
   
 
  }, [route.params]);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <LinearGradient colors={['#5A0FC8', '#E64487']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wallet Details</Text>
        <View style={{ width: 20 }} />
      </LinearGradient>

      <View style={styles.container}>
        <Text style={styles.title}>Your Wallet Balance</Text>
        <Text style={styles.balance}>R {balance.toFixed(2)}</Text>

        <Text style={styles.label}>Bank:</Text>
        <Text style={styles.value}>{bank || 'N/A'}</Text>

        <Text style={styles.label}>Name on Card:</Text>
        <Text style={styles.value}>{name || 'N/A'}</Text>

        <Text style={styles.label}>Date Loaded:</Text>
        <Text style={styles.value}>{date || 'N/A'}</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('load-wallet')}
        >
          <Text style={styles.buttonText}>Load More</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// --- Navigation Setup ---
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    
      <Stack.Navigator
        initialRouteName="load-wallet"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="load-wallet" component={LoadWalletScreen} />
        <Stack.Screen name="wallet-details" component={WalletDetailsScreen} />
      </Stack.Navigator>
    
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: { color: '#000000ff', fontSize: 20, fontWeight: 'bold', marginLeft: 15 },
  container: { padding: 20, backgroundColor: '#fff', flex: 1 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 14, color: '#555', marginBottom: 20, textDecorationLine: 'underline' },
  pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginBottom: 15 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 12, marginBottom: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  cardLogos: { flexDirection: 'row', justifyContent: 'flex-start', marginVertical: 10 },
  icon: { width: 50, height: 30, resizeMode: 'contain', marginRight: 10 },
  button: { backgroundColor: '#5A0FC8', borderRadius: 8, padding: 15, alignItems: 'center', marginTop: 20 },
  buttonText: { fontSize: 16, fontWeight: 'bold', color: '#000000ff' },
  balance: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  label: { fontSize: 16, fontWeight: '600', marginTop: 10, color: '#555' },
  value: { fontSize: 16, color: '#111' },
});