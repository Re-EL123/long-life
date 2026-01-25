import { Stack } from 'expo-router';
import { SocketProvider } from '../contexts/SocketContext';

export default function Layout() {
  return (
    <SocketProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SocketProvider>
  );
}
