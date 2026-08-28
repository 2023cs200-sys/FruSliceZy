import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export const options = {
  title: 'FruSliceZy',
  headerShown: false,
};

export default function MainScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>FruSliceZy</Text>
      <Text style={styles.subtitle}>Motion Controller</Text>

      <Link href="/connect" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>CONNECT</Text>
        </Pressable>
      </Link>

      <Link href="/settings" asChild>
        <Pressable style={[styles.button, styles.secondaryButton]}>
          <Text style={styles.buttonText}>SETTINGS</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0d0a1f',
    padding: 24,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#8f85b3',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 56,
  },
  button: {
    backgroundColor: '#7c4dff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 48,
    marginBottom: 16,
    minWidth: 240,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#2a2150',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
