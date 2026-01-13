import { Text, View, StyleSheet, SafeAreaView, Image, Button, ImageBackground, TextInput } from "react-native";
import { Link, router, Stack } from 'expo-router';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

export default function Index() {
  return ( <View style={styles.container}>
    <ImageBackground
      style={styles.backgound}
      source={require('../assets/images/background.jpg')}
    >
      <Image style={styles.logo} source={require('../assets/images/LANDING PAGE.png')} />
      
      
      <Text>Dashboard</Text>      
     
    
    </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
     
     
     
   },
   buttonContainer: {
     margin: 50,
     width: 230,
     padding: 10,
   },
   buttonContainer2: {
     margin: 1,
     width: 230,
   },
   logo: {
     height: 300,
     width: 298,
   },
   backgound:{
     flex: 1,
      paddingVertical: 100,
      alignItems: 'center',
   }
 });
