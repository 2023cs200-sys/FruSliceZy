import { StyleSheet, Text, View } from 'react-native';

export const options = {
  title: 'Settings',
};

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.placeholder}>
        Sensitivity and motion settings will be implemented in Phase 4.
      </Text>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  placeholder: {
    color: '#8f85b3',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 22,
  },
});
