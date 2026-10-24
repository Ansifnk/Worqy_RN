import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNav from './src/navigations/AppNav';
import { AppProvider } from './src/context/AppContext';

const App = () => {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <AppProvider>
        <AppNav />
      </AppProvider>
    </SafeAreaProvider>
  );
};

export default App;