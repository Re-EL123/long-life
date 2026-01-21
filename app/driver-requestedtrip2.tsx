import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

type RideRequest = {
  id: number;
  name: string;
  image: string;
  pickup: string;
  destination: string;
  distance: string;
  amount: string;
};

const rideRequests: RideRequest[] = [
  {
    id: 1,
    name: 'Alicia',
    image: 'https://randomuser.me/api/portraits/women/1.jpg',
    pickup: '11193 Khanya Street, Katlehong',
    destination: 'Curro school, Centurion',
    distance: '18km',
    amount: 'R180',
  },
  {
    id: 2,
    name: 'Mike',
    image: 'https://randomuser.me/api/portraits/men/1.jpg',
    pickup: '909 Thokoza Street, Palmride',
    destination: 'TornHill High School',
    distance: '19km',
    amount: 'R430',
  },
  {
    id: 3,
    name: 'Gily',
    image: 'https://randomuser.me/api/portraits/men/2.jpg',
    pickup: '890 Avenue, Parktown',
    destination: 'TornHill High School',
    distance: '19km',
    amount: 'R93',
  },
  {
    id: 4,
    name: 'Mike',
    image: 'https://randomuser.me/api/portraits/men/3.jpg',
    pickup: '890 Mandela Road, Palmride',
    destination: 'Girls High School',
    distance: '6km',
    amount: 'R58',
  },
];

const RequestRidePage2: React.FC = () => {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.appBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Requested trip</Text>
        <Image
          source={require("../assets/images/logo3.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {rideRequests.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Image source={{ uri: item.image }} style={styles.avatar} />
              <View>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.time}>20 sec ago</Text>
              </View>
            </View>

            <Text style={styles.details}>
              Pick up: {item.pickup}{'\n'}
              Destination: {item.destination}{'\n'}
              Distance: {item.distance}{'\n'}
              <Text style={styles.amount}>Amount: {item.amount}</Text>
            </Text>

            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>View Request</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default RequestRidePage2;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 25,
    marginRight: 12,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  time: {
    fontSize: 12,
    color: 'gray',
  },
  details: {
    fontSize: 14,
    marginBottom: 10,
    lineHeight: 20,
  },
  amount: {
    fontWeight: 'bold',
    color: '#5A0FC8',
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: '#5A0FC8', // solid purple
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  appBar: {
    height: 120,
    backgroundColor: '#5A0FC8', // solid purple
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingTop: 40,
  },
  backBtn: {
    padding: 6,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logo: {
    width: 60,
    height: 40,
  },
});
