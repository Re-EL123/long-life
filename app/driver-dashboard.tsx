import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { FontAwesome5, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';


export default function DriverDashboard() {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#5A0FC8", "#5A0FC8"]}
        style={styles.headerBackground}
      >
        <View style={styles.topRow}>
          <Image source={require('@/assets/images/logo2.png')} style={styles.logo} />
          <Ionicons name="notifications-outline" size={24} color="white" />
        </View>
        <Text style={styles.welcome}>Welcome Shaun</Text>
        <Text style={styles.heading}>DASHBOARD</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.subheading}>Recent earnings</Text>
        <View style={styles.earningsContainer}>
          <LinearGradient colors={["#5A0FC8", "#5A0FC8"]} style={styles.earningCard}>
            <FontAwesome5 name="money-bill-wave" size={24} color="white" />
            <Text style={styles.earningAmountWhite}>+R600</Text>
            <Text style={styles.earningLabelWhite}>Lekwalo</Text>
          </LinearGradient>
          <LinearGradient colors={["#5A0FC8", "#5A0FC8"]} style={styles.earningCard}>
            <FontAwesome5 name="money-bill-wave" size={24} color="white" />
            <Text style={styles.earningAmountWhite}>+R700</Text>
            <Text style={styles.earningLabelWhite}>Sibo</Text>
          </LinearGradient>
          <LinearGradient colors={["#5A0FC8", "#5A0FC8"]} style={styles.earningCard}>
            <FontAwesome5 name="money-bill-wave" size={24} color="white" />
            <Text style={styles.earningAmountWhite}>+R500</Text>
            <Text style={styles.earningLabelWhite}>Nthabiseng</Text>
          </LinearGradient>
        </View>

        <View style={styles.tripContainer}>
          <Text style={styles.subheading}>Today&#39;s trips</Text>
          <Text style={styles.seeAll} onPress={() => router.push('/collectionTrip')}>See all</Text>
        </View>

        <View style={styles.tripCard}>
          <Text>Lekwalo driving to destination</Text>
        </View>
        <View style={styles.tripCard}>
          <Text>Theoelo dropped off 13:30</Text>
        </View>

        <View style={styles.buttonRow}>
<LinearGradient colors={["#5A0FC8", "#5A0FC8"]} style={styles.featureButton}>
  <TouchableOpacity onPress={() => router.push('/driver-wallet')}>
    <MaterialCommunityIcons name="wallet" size={28} color="#fff" />
    <Text style={styles.buttonTextWhite}>Wallet</Text>
  </TouchableOpacity>
</LinearGradient>
          <LinearGradient colors={["#5A0FC8", "#5A0FC8"]} style={styles.featureButton}>
            <TouchableOpacity onPress={() => router.push('/driver-childen')}>
            <Ionicons name="people" size={28} color="#fff" />
            <Text style={styles.buttonTextWhite}>Children</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <View style={styles.bottomRow}>
          <TouchableOpacity style={styles.emergencyButton}>
            <Text style={styles.emergencyText}>Emergency SOS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsButton} onPress={() => {
                              router.push("/driver-settings");
                            }}>
            <Ionicons name="settings-outline" size={28} color="#5A0FC8" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>

    
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  headerBackground: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  welcome: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  contentContainer: {
    padding: 20,
  },
  subheading: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  earningsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  earningCard: {
    padding: 12,
    borderRadius: 16,
    width: '30%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  earningAmountWhite: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 8,
    color: '#fff',
  },
  earningLabelWhite: {
    fontSize: 14,
    marginTop: 4,
    color: '#fff',
  },
  tripContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  seeAll: {
    color: '#5A0FC8',
    textDecorationLine: 'underline',
  },
  tripCard: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  featureButton: {
    width: '48%',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonTextWhite: {
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  emergencyButton: {
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  emergencyText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});
