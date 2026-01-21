// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { checkDriverOnboarding } from '../../utils/checkOnboarding';

export default function TabLayout() {
  const router = useRouter();

  useEffect(() => {
    const verifyDriverOnboarding = async () => {
      try {
        const { isDriver, completed, needsAuth } = await checkDriverOnboarding();
        
        // If user is a driver and hasn't completed onboarding, redirect
        if (isDriver && !completed && !needsAuth) {
          router.replace('/driver-onboarding');
        }
      } catch (error) {
        console.error('Error verifying onboarding:', error);
      }
    };

    verifyDriverOnboarding();
  }, [router]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#7E2EFF',
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: 'Trips',
          tabBarIcon: ({ color }) => <Ionicons name="car" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
