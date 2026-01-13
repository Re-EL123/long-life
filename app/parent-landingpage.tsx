import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";

export default function ParentLandingPage() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image 
        style={styles.logo} 
        source={require('../assets/images/LANDING PAGE.png')} 
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/login-parent")}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { marginTop: 20 }]}
          onPress={() => router.push("/createAccount")}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5A0FC8', 
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 300,
    height: 300,
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 230,
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'white',
    width: '100%',
    height: 50,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'blue',
  },
  buttonText: {
    color: 'blue',
    fontSize: 20,
    fontWeight: '600',
  },
});
