import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#1a1433' },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: 'bold' },
        contentStyle: { backgroundColor: '#0d0a1f' },
      }}
    />
  );
}
