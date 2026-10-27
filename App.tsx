import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/utils/queryClient';
import AppNav from './src/navigations/AppNav';
import { AppProvider } from './src/context/AppContext';

const App = () => {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <AppNav />
        </AppProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
};

export default App;