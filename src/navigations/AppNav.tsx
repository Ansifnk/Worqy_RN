import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import {
  NavigationContainer,
  NavigatorScreenParams,
  createNavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNav, { BottomTabParamList } from './BottomTabNav';
import LoginScreen from '../screens/login/LoginScreen';
import SignupScreen from '../screens/signup/SignupScreen';
import WelcomeScreen from '../screens/welcome/WelcomeScreen';
import TaskDetailScreen from '../screens/tasks/TaskDetailScreen';
import InvoiceDetailScreen from '../screens/invoices/InvoiceDetailScreen';
import AddEditInvoiceScreen from '../screens/invoices/AddEditInvoiceScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { useAppContext } from '../context/AppContext';
import { colors } from '../utils/colors';

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
  Main: NavigatorScreenParams<BottomTabParamList> | undefined;
  TaskDetail: { taskId?: string; isNew?: boolean } | undefined;
  InvoiceDetail: { invoiceId: string } | undefined;
  AddEditInvoice: { invoiceId?: string; isEdit?: boolean } | undefined;
  Profile: undefined;
};

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNav: React.FC = () => {
  const { user, loading } = useAppContext();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!loading && navigationRef.isReady()) {
      if (!user) {
        navigationRef.reset({
          index: 0,
          routes: [{ name: 'Welcome' }],
        });
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        key={user ? 'authenticated' : 'unauthenticated'}
        initialRouteName={user ? 'Main' : 'Welcome'}
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {user ? (
          <>
            <Stack.Screen name="Main" component={BottomTabNav} />
            <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
            <Stack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} />
            <Stack.Screen name="AddEditInvoice" component={AddEditInvoiceScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="Main" component={BottomTabNav} />
            <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
            <Stack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} />
            <Stack.Screen name="AddEditInvoice" component={AddEditInvoiceScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppNav;

