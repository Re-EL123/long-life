import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const WalletScreen = () => {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Wallet</Text>
        <View style={{ width: 20 }} />
      </View>

      {/* Wallet Balance */}
      <Text style={styles.balanceText}>Wallet Balance: R236,89</Text>

      {/* Wallet Image */}
      <View style={styles.walletWrapper}>
        <Image
          source={{
            uri: 'https://img.freepik.com/free-vector/wallet-with-money-calendar_23-2148781977.jpg',
          }}
          style={styles.walletImage}
          resizeMode="contain"
        />
      </View>

      {/* Section Title */}
      <Text style={styles.sectionTitle}>Load Wallet</Text>

      {/* Buttons */}
      <TouchableOpacity style={styles.loadButton} onPress={() => router.push('/parent-loadBank')}>
        <Text style={styles.loadButtonText}>Bank</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.loadButton} onPress={() => router.push('/parent-loadVoucher' as any)}>
        <Text style={styles.loadButtonText}>Voucher</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#fff',
    minHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#5A0FC8',
    paddingVertical: 20,
    paddingHorizontal: 15,
    justifyContent: 'space-between',
    borderRadius: 0,
  },
  backArrow: {
    color: '#fff',
    fontSize: 24,
    fontFamily: 'Montserrat',
    fontWeight: 'bold',
  },
  headerText: {
    color: '#fff',
    fontSize: 24,
    fontFamily: 'Montserrat',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  balanceText: {
    fontSize: 14,
    fontFamily: 'Montserrat',
    color: '#222',
    marginBottom: 15,
    textAlign: 'center',
  },
  walletWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  walletImage: {
    width: 150,
    height: 120,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'Montserrat',
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 10,
    textAlign: 'center',
  },
  loadButton: {
    backgroundColor: '#5A0FC8',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginBottom: 20,
    width: '60%',
    alignItems: 'center',
  },
  loadButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Montserrat',
    textAlign: 'center',
  },
});

export default WalletScreen;
