import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ListRenderItem,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

type Child = {
  id: string;
  name: string;
  address: string;
  age: string;
  photo: any;
};

const childrenData: Child[] = [
  { id: '1', name: 'Mbali Maseko', address: '25 5th Road, Sandton', age: '6 years', photo: require('../assets/images/child-profile-1.jpeg') },
  { id: '2', name: 'Tim Maseko', address: '25 5th Road, Sandton', age: '5 years', photo: require('../assets/images/child-profile-2.jpeg') },
  { id: '3', name: 'Tim Blake', address: '25 Cormane Drive, Sandton', age: '9 years', photo: require('../assets/images/child-profile-3.jpeg') },
  { id: '4', name: 'Tokolo Musne', address: 'Erex Methor Road, Empiston', age: '11 years', photo: require('../assets/images/child-profile-4.jpeg') },
  { id: '5', name: 'Siyanda Mteatha', address: '25 Hudson Street, Mabatho', age: '6 years', photo: require('../assets/images/child-profile-5.jpeg') },
];

const ChildrenScreen: React.FC = () => {
  const router = useRouter();

  const renderChild: ListRenderItem<Child> = ({ item }) => (
    <View style={styles.childContainer}>
      <View style={{ flex: 1 }}>
        <Text style={styles.childName}>{item.name}</Text>
        <Text style={styles.childAddress}>{item.address}</Text>
      </View>
      <View style={styles.childInfo}>
        <Text style={styles.childAge}>{item.age}</Text>
        <Image source={item.photo} style={styles.childImage} />
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      {/* Header */}
      <LinearGradient colors={['#5A0FC8', '#5A0FC8']} style={styles.headerBackground}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Children</Text>
          <View style={{ width: 24 }} /> {/* placeholder for spacing */}
        </View>
      </LinearGradient>

      {/* List */}
      <FlatList<Child>
        data={childrenData}
        keyExtractor={(item) => item.id}
        renderItem={renderChild}
        contentContainerStyle={{ padding: 20 }}
      />

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/create-tripplan')}
        >
          <Text style={styles.buttonText}>Create Trip Plan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/trip-plan')}
        >
          <Text style={styles.buttonText}>Trip Plan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChildrenScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F3EFFF',
  },
  headerBackground: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  childContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  childName: {
    fontSize: 16,
    color: '#5A0FC8',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  childAddress: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  childAge: {
    fontSize: 14,
    color: '#703e98',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  childImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  childInfo: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 15,
  },
  button: {
    flex: 1,
    backgroundColor: '#5A0FC8',
    paddingVertical: 12,
    borderRadius: 20,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',  },
});
