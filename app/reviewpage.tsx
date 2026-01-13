import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';

const reviews = [
  { id: 1, name: 'Alicia', rating: 4, comment: 'Great person with a sense of humor. Arrives in time', time: '1d', image: 'https://randomuser.me/api/portraits/women/1.jpg' },
  { id: 2, name: 'Mark', rating: 5, comment: 'Grateful to have him as my child’s driver. He has care.', time: '1d', image: 'https://randomuser.me/api/portraits/men/2.jpg' },
  { id: 3, name: 'Sam', rating: 4, comment: 'Good person.', time: '1d', image: 'https://randomuser.me/api/portraits/men/3.jpg' },
  { id: 4, name: 'Maria', rating: 5, comment: 'Friendly person and funny.', time: '1d', image: 'https://randomuser.me/api/portraits/women/4.jpg' },
];

export default function ReviewsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Reviews</Text>
        <View style={{ width: 22 }} /> {/* placeholder to center title */}
      </View>

      {/* Reviews List */}
      <ScrollView style={styles.reviewList}>
        {reviews.map((review) => (
          <View key={review.id} style={styles.reviewItem}>
            <Image source={{ uri: review.image }} style={styles.avatar} />
            <View style={styles.reviewText}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{review.name}</Text>
                <Text style={styles.time}>{review.time}</Text>
              </View>
              <Text style={styles.stars}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</Text>
              <Text style={styles.comment}>{review.comment}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 80,
    backgroundColor: '#5A0FC8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backArrow: {
    fontSize: 22,
    color: '#fff',
  },
  title: {
    fontFamily: 'Montserrat',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  reviewList: {
    padding: 16,
  },
  reviewItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  reviewText: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  name: {
    fontFamily: 'Montserrat',
    fontWeight: 'bold',
    fontSize: 16,
  },
  time: {
    fontFamily: 'Montserrat',
    fontSize: 14,
    color: '#777',
  },
  stars: {
    fontSize: 14,
    color: '#FFD700',
    marginVertical: 2,
  },
  comment: {
    fontFamily: 'Montserrat',
    fontSize: 14,
    color: '#444',
  },
});
