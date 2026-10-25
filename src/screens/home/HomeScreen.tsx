import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppContext } from '../../context/AppContext';

const HomeScreen = () => {
  const { user } = useAppContext();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Worqy Home</Text>
      <Text style={styles.subtitle}>
        {user ? `Welcome back, ${user.name}!` : 'Welcome to your workspace dashboard'}
      </Text>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
});