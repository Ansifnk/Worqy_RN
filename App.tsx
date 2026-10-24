import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNav from './src/navigations/AppNav';

const App = () => {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />

      <AppNav />
    </SafeAreaProvider>
  );
};

export default App;