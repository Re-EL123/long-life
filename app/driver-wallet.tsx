import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function WalletScreen() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      {/* App Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => router.push('/driver-dashboard')}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.heading}>Wallet</Text>
        <Image source={require("../assets/images/logo3.png")} style={styles.logo} resizeMode="contain" />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Total Income Card */}
        <View style={styles.incomeCard}>
          <Text style={styles.subtitle}>Total income</Text>
          <Text style={styles.heading}>R6 900.00</Text>
          <Text style={styles.body}>↑ 58%</Text>
        </View>

        {/* Withdraw Button */}
        <TouchableOpacity style={styles.button} onPress={() => router.push('/driver-withdraw')}>
          <Text style={styles.buttonText}>Withdraw</Text>
        </TouchableOpacity>

        {/* History */}
        <Text style={styles.heading}>History</Text>

        {["March", "February", "January", "December"].map((month, index) => (
          <View key={index} style={styles.historyItem}>
            <Text style={styles.heading}>{month}</Text>
            <Text style={styles.body}>Earnings: R7 500.00</Text>
            <Text style={styles.body}>
              Total trips: {index === 0 ? 56 : index === 1 ? 56 : index === 2 ? 40 : 36}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  appBar: {
    height: 120,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingTop: 40,
    backgroundColor: '#5A0FC8',
  },
  logo: { width: 60, height: 40 },
  content: { padding: 20, alignItems: "center" },

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
  button: {
    backgroundColor: '#5A0FC8',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginBottom: 20,
    width: "50%",
    alignItems: "center",
  },
  buttonText: {
    fontFamily: Platform.OS === 'ios' ? 'Montserrat' : 'sans-serif',
    fontWeight: '700',
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
  },
  incomeCard: {
    backgroundColor: '#5A0FC8',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    width: "100%",
    alignItems: "center",
  },
  historyItem: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    backgroundColor: '#5A0FC8',
    width: "100%",
    alignItems: "center",
  },
});
