import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const reviews = [
  { name: 'Alicia', time: '1 day', review: 'Great person with a sense of humor. Arrives on time.', image: require('../assets/images/alicia.jpg') },
  { name: 'Mark', time: '4 days', review: 'Grateful to have him as my child’s driver. He has care.', image: require('../assets/images/mark.jpg') },
  { name: 'Sam', time: '1 week', review: 'Good person.', image: require('../assets/images/sam.jpg') },
  { name: 'Maria', time: '2 weeks', review: 'Friendly person and funny.', image: require('../assets/images/maria.jpg') },
];

const ReviewsScreen = () => {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.root}>
      {/* Top Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reviews</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Review Cards */}
      <View style={styles.cardContainer}>
        {reviews.map((item, index) => (
          <View key={index} style={styles.reviewCard}>
            <Image source={item.image} style={styles.driverImage} />
            <View style={styles.reviewDetails}>
              <View style={styles.nameRow}>
                <Text style={styles.driverName}>{item.name}</Text>
                <Text style={styles.reviewTime}>{item.time}</Text>
              </View>
              <View style={styles.starRow}>
                {[...Array(5)].map((_, i) => (
                  <Ionicons key={i} name="star" size={16} color="#FFD700" />
                ))}
              </View>
              <Text style={styles.reviewText}>{item.review}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default ReviewsScreen;

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    backgroundColor: '#fff',
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    backgroundColor: '#5a0fc8', 
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  cardContainer: {
    margin: 20,
  },
  reviewCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  driverImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  reviewDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  driverName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  reviewTime: {
    fontSize: 12,
    color: '#888',
  },
  starRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  reviewText: {
    fontSize: 14,
    color: '#555',
  },
});
