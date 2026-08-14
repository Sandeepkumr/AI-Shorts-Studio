import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SelectCharactersScreen() {
  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.text}>Select Characters Screen</Text>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#020A10',
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#F5F7F8',
    fontSize: 20,
    fontWeight: '700',
  },
});
