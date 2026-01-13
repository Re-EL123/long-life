import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const reviews = [
  {
    name: 'Alicia',
    time: '1 day',
    review: 'Great person with a sense of humor. Arrives in time',
    image: require('../assets/images/alicia.jpg'),
  },
  {
    name: 'Mark',
    time: '4 days',
    review: 'Grateful to have him as my child’s driver. He has care.',
    image: require('../assets/images/mark.jpg'),
  },
  {
    name: 'Sam',
    time: '1 week',
    review: 'Good person.',
    image: require('../assets/images/sam.jpg'),
  },
  {
    name: 'Maria',
    time: '2 weeks',
    review: 'Friendly person and funny.',
    image: require('../assets/images/maria.jpg'),
  },
];

const ReviewsScreen = () => {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.root}>
      {/* App Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.heading}>Reviews</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.card}>
        {reviews.map((driver, index) => (
          <View key={index} style={styles.reviewContainer}>
            <Image source={driver.image} style={styles.driverImage} />
            <View style={styles.reviewDetails}>
              <View style={styles.nameRow}>
                <Text style={styles.driverName}>{driver.name}</Text>
                <Text style={styles.reviewTime}>{driver.time}</Text>
              </View>
              <View style={styles.starRow}>
                {[...Array(5)].map((_, i) => (
                  <Ionicons key={i} name="star" size={16} color="#FFD700" />
                ))}
              </View>
              <Text style={styles.reviewText}>{driver.review}</Text>
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
    backgroundColor: '#000',
    paddingBottom: 40,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    justifyContent: 'space-between',
    backgroundColor: '#7f39b1ff',
  },
  heading: {
    fontFamily: Platform.OS === 'ios' ? 'Montserrat' : 'sans-serif',
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  card: {
    margin: 20,
  },
  reviewContainer: {
    flexDirection: 'row',
    backgroundColor: '#111',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    alignItems: 'flex-start',
  },
  driverImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
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
    fontFamily: Platform.OS === 'ios' ? 'Montserrat' : 'sans-serif',
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  reviewTime: {
    fontFamily: Platform.OS === 'ios' ? 'Montserrat' : 'sans-serif',
    fontSize: 14,
    color: '#888',
  },
  starRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  reviewText: {
    fontFamily: Platform.OS === 'ios' ? 'Montserrat' : 'sans-serif',
    fontSize: 14,
    color: '#fff',
    marginTop: 4,
  },
});
