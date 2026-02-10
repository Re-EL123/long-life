// app/_layout.tsx
import React from 'react';
import { Stack, SplashScreen } from 'expo-router';
import { useFonts } from 'expo-font';
import { SocketProvider } from '../contexts/SocketContext';

// Prevent auto-hide until fonts are loaded
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    // add any other custom fonts here
  });

  if (!fontsLoaded) {
    // keep splash screen while fonts load
    return null;
  }

  // hide splash once fonts are ready
  SplashScreen.hideAsync();

  return (
    <SocketProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SocketProvider>
  );
}
