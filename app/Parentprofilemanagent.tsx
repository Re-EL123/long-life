import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ImageBackground, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, AntDesign, MaterialIcons, Entypo } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';

const options = [
  { label: 'User Profile Page', icon: <Feather name="user" size={28} color="#fff" />, route: '/parent-userprofile' }, 
  { label: 'Account Settings', icon: <Feather name="settings" size={28} color="#fff" />, route: '/driver-profilesettings' },
  { label: 'Edit Profile', icon: <Feather name="edit" size={28} color="#fff" />, route: '/parent-editProfile' },
  { label: 'Request Driver', icon: <MaterialIcons name="local-taxi" size={28} color="#fff" />, route: '/Parent-RequestDriver'},
  { label: 'Privacy settings', icon: <Feather name="lock" size={28} color="#fff" />, route: '/driver-privacyAndData' },
  { label: 'Activity Log', icon: <Entypo name="pie-chart" size={28} color="#fff" />, route: '/driver-activitylogs' },
  { label: 'Delete Profile', icon: <Feather name="trash-2" size={28} color="#fff" />, route: '/parent-deleteaccount' },
];

const ProfileManagementScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.appBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Profile Management</Text>
        <Image
          source={require("../assets/images/logo3.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.body}>
        {options.map((item, index) => {
          const isLastOdd = options.length % 2 === 1 && index === options.length - 1;

          return (
            <TouchableOpacity
              key={index}
              style={[styles.optionBox, isLastOdd && styles.centeredBox]}
              onPress={() => router.push(item.route as any)}
            >
              {item.icon}
              <Text style={styles.optionLabel}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default ProfileManagementScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  appBar: {
    height: 120,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingTop: 40,
    backgroundColor: "#5A0FC8",
    borderRadius: 0,
  },
  backBtn: {
    padding: 6,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "Montserrat",
    textAlign: "center",
  },
  logo: {
    width: 60,
    height: 40,
  },
  body: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  optionBox: {
    width: '48%',
    backgroundColor: '#5A0FC8',
    borderRadius: 10,
    paddingVertical: 30,
    paddingHorizontal: 10,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: "Montserrat",
    color: '#fff',
    marginTop: 12,
    textAlign: 'center',
  },
  centeredBox: {
    width: '100%',
    alignSelf: 'center',
  },
});
