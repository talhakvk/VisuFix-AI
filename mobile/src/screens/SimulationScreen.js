import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SimulationScreen({ route }) {
  const { fault } = route.params;
  return (
    <View style={styles.container}>
      <Text style={styles.text}>WP8'de implement edilecek</Text>
      <Text style={styles.subtext}>Fault ID: {fault?.id}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  text: { fontSize: 18, fontWeight: '500', color: '#333' },
  subtext: { fontSize: 14, color: '#888', marginTop: 8 },
});
