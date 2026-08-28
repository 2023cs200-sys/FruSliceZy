import { StyleSheet, Text, View } from 'react-native';

export const options = {
  title: 'Connect',
};

export default function ConnectScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connect</Text>
      <Text style={styles.placeholder}>
        IP input and WebSocket connection will be implemented in Phase 4.
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
