import { router } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <Image style={styles.logo} source={require('../assets/images/LANDING PAGE.png')} />
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            router.push("/route");
          }}
        >
          <Text style={styles.buttonText}>Get Started</Text>
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
  },
  buttonContainer: {
    marginTop: 50,
    width: 230,
    padding: 10,
  },
  logo: {
    height: 300,
    width: 298,
    marginBottom: 50,
  },
  button: {
    backgroundColor: 'white',
    borderRadius: 5,
    height: 40,
    width: 230,
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
