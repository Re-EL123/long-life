import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function route() {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color="#fff" />
      </TouchableOpacity>

      <Image style={styles.logo} source={require('../assets/images/LANDING PAGE.png')} />
      <Text style={styles.text}>Welcome</Text>
      <Text style={styles.text}>Please select your user type</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            router.push("/parent-landingpage");
          }}
        >
          <Text style={styles.buttonText}>Parent</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            router.push("/LoginPage");
          }}
        >
          <Text style={styles.buttonText}>Driver</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5A0FC8', // solid purple background
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  backBtn: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
    padding: 10,
  },
  logo: {
    height: 300,
    width: 298,
    marginBottom: 20,
  },
  text: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  buttonContainer: {
    marginTop: 20,
    width: 230,
  },
  button: {
    backgroundColor: 'white',
    borderRadius: 5,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'blue',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
});
