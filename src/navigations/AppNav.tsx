import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import {
  NavigationContainer,
  NavigatorScreenParams,
  createNavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNav, { BottomTabParamList } from './BottomTabNav';
import AIChatScreen from '../screens/chat/AIChatScreen';
import LoginScreen from '../screens/login/LoginScreen';
import SignupScreen from '../screens/signup/SignupScreen';
import WelcomeScreen from '../screens/welcome/WelcomeScreen';
import TaskDetailScreen from '../screens/tasks/TaskDetailScreen';
import InvoiceDetailScreen from '../screens/invoices/InvoiceDetailScreen';
import AddEditInvoiceScreen from '../screens/invoices/AddEditInvoiceScreen';
import ClientDetailScreen from '../screens/clients/ClientDetailScreen';
import { ProjectDetailScreen } from '../screens/projects/ProjectDetailScreen';
import { AddEditProjectScreen } from '../screens/projects/AddEditProjectScreen';
import ScheduleScreen from '../screens/schedule/ScheduleScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import SubscriptionPlansScreen from '../screens/subscription/SubscriptionPlansScreen';
import SubscriptionDetailScreen from '../screens/subscription/SubscriptionDetailScreen';
import { useAppContext } from '../context/AppContext';
import { colors } from '../utils/colors';

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
  Main: NavigatorScreenParams<BottomTabParamList> | undefined;
  AIChat: undefined;
  TaskDetail: { taskId?: string; isNew?: boolean } | undefined;
  InvoiceDetail: { invoiceId: string } | undefined;
  AddEditInvoice: { invoiceId?: string; isEdit?: boolean } | undefined;
  ClientDetail: { clientId: string };
  ProjectDetail: { projectId: string };
  AddEditProject: { projectId?: string; isEdit?: boolean; initialData?: any } | undefined;
  Schedule: { date?: string; scheduleId?: string } | undefined;
  Profile: undefined;
  SubscriptionPlans: { isMandatory?: boolean } | undefined;
  SubscriptionDetail: undefined;
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
      if (user) {
        if (!user.isSubscribed) {
          navigationRef.reset({
            index: 0,
            routes: [{ name: 'SubscriptionPlans', params: { isMandatory: true } }],
          });
        } else {
          navigationRef.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          });
        }
      } else {
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

  const initialRoute = user
    ? user.isSubscribed
      ? 'Main'
      : 'SubscriptionPlans'
    : 'Welcome';

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        key={user ? `auth-${user.id}-${user.isSubscribed ? 'sub' : 'unsub'}` : 'unauthenticated'}
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {user ? (
          <>
            <Stack.Screen name="Main" component={BottomTabNav} />
            <Stack.Screen
              name="SubscriptionPlans"
              component={SubscriptionPlansScreen}
              initialParams={{ isMandatory: !user.isSubscribed }}
            />
            <Stack.Screen name="SubscriptionDetail" component={SubscriptionDetailScreen} />
            <Stack.Screen
              name="AIChat"
              component={AIChatScreen}
              options={{
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
            <Stack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} />
            <Stack.Screen name="AddEditInvoice" component={AddEditInvoiceScreen} />
            <Stack.Screen name="ClientDetail" component={ClientDetailScreen} />
            <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
            <Stack.Screen name="AddEditProject" component={AddEditProjectScreen} />
            <Stack.Screen name="Schedule" component={ScheduleScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
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
