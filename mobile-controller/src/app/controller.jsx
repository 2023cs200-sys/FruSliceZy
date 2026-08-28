import { StyleSheet, Text, View } from 'react-native';

export const options = {
  title: 'Controller',
};

export default function ControllerScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Controller</Text>
      <Text style={styles.placeholder}>
        Motion-controlled gameplay screen will be implemented in Phase 4.
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
