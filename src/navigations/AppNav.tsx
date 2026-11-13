import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/home/HomeScreen';
import { ProjectsScreen } from '../screens/projects/ProjectsScreen';
import { ClientsScreen } from '../screens/clients/ClientsScreen';
import { TasksScreen } from '../screens/tasks/TasksScreen';
import { ScheduleScreen } from '../screens/schedule/ScheduleScreen';
import { InvoicesScreen } from '../screens/invoices/InvoicesScreen';
import { QuotationsScreen } from '../screens/invoices/QuotationsScreen';
import { ProjectsAndClientsScreen } from '../screens/projects/ProjectsAndClientsScreen';
import { TasksAndScheduleScreen } from '../screens/tasks/TasksAndScheduleScreen';
import { FinanceScreen } from '../screens/invoices/FinanceScreen';
import AIChatScreen from '../screens/chat/AIChatScreen';
import LoginScreen from '../screens/login/LoginScreen';
import SignupScreen from '../screens/signup/SignupScreen';
import OtpVerificationScreen from '../screens/signup/OtpVerificationScreen';
import WelcomeScreen from '../screens/welcome/WelcomeScreen';
import TaskDetailScreen from '../screens/tasks/TaskDetailScreen';
import AddEditTaskScreen from '../screens/tasks/AddEditTaskScreen';
import InvoiceDetailScreen from '../screens/invoices/InvoiceDetailScreen';
import AddEditInvoiceScreen from '../screens/invoices/AddEditInvoiceScreen';
import ClientDetailScreen from '../screens/clients/ClientDetailScreen';
import { ProjectDetailScreen } from '../screens/projects/ProjectDetailScreen';
import { AddEditProjectScreen } from '../screens/projects/AddEditProjectScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import SubscriptionPlansScreen from '../screens/subscription/SubscriptionPlansScreen';
import SubscriptionDetailScreen from '../screens/subscription/SubscriptionDetailScreen';
import { useAppContext } from '../context/AppContext';
import { isPlanNotExpired } from '../utils/subscriptionUtils';
import { colors } from '../utils/colors';

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
  OtpVerification: {
    email: string;
    name: string;
    password: string;
    source?: 'mobile';
  };
  Main: undefined;
  Home: undefined;
  Projects: undefined;
  Clients: undefined;
  Tasks: undefined;
  Schedule: { date?: string; scheduleId?: string } | undefined;
  Invoices: undefined;
  Quotations: undefined;
  Work: { initialTab?: 'projects' | 'clients' } | undefined;
  Planner: { initialTab?: 'tasks' | 'schedule' } | undefined;
  Finance: { initialTab?: 'invoices' | 'quotations' } | undefined;
  AIChat: undefined;
  TaskDetail: { taskId?: string; isNew?: boolean; prefillProject?: string; prefillProjectId?: string; prefillClientId?: string; prefillClientName?: string } | undefined;
  AddEditTask: { taskId?: string; isEdit?: boolean; initialData?: any; prefillProject?: string; prefillProjectId?: string; prefillClientId?: string; prefillClientName?: string } | undefined;
  AddTask: { prefillProject?: string; prefillProjectId?: string; prefillClientId?: string; prefillClientName?: string } | undefined;
  InvoiceDetail: { invoiceId: string } | undefined;
  AddEditInvoice: { invoiceId?: string; isEdit?: boolean; prefillClientId?: string; prefillClientName?: string } | undefined;
  ClientDetail: { clientId: string };
  ProjectDetail: { projectId: string };
  AddEditProject: { projectId?: string; isEdit?: boolean; initialData?: any } | undefined;
  Profile: undefined;
  SubscriptionPlans: { isMandatory?: boolean } | undefined;
  SubscriptionDetail: undefined;
};

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNav: React.FC = () => {
  const { user, loading } = useAppContext();
  const isFirstRender = useRef(true);

  const hasNotExpiredPlan = Boolean(user && isPlanNotExpired(user));

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!loading && navigationRef.isReady()) {
      if (user) {
        if (!hasNotExpiredPlan) {
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
  }, [user, loading, hasNotExpiredPlan]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const initialRoute = user
    ? hasNotExpiredPlan
      ? 'Main'
      : 'SubscriptionPlans'
    : 'Welcome';

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        key={user ? `auth-${user.id}-${hasNotExpiredPlan ? 'sub' : 'unsub'}` : 'unauthenticated'}
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {user ? (
          <>
            <Stack.Screen name="Main" component={HomeScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Projects" component={ProjectsScreen} />
            <Stack.Screen name="Clients" component={ClientsScreen} />
            <Stack.Screen name="Tasks" component={TasksScreen} />
            <Stack.Screen name="Schedule" component={ScheduleScreen} />
            <Stack.Screen name="Invoices" component={InvoicesScreen} />
            <Stack.Screen name="Quotations" component={QuotationsScreen} />
            <Stack.Screen name="Work" component={ProjectsAndClientsScreen} />
            <Stack.Screen name="Planner" component={TasksAndScheduleScreen} />
            <Stack.Screen name="Finance" component={FinanceScreen} />
            <Stack.Screen
              name="SubscriptionPlans"
              component={SubscriptionPlansScreen}
              initialParams={{ isMandatory: !hasNotExpiredPlan }}
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
            <Stack.Screen name="AddEditTask" component={AddEditTaskScreen} />
            <Stack.Screen name="AddTask" component={AddEditTaskScreen} />
            <Stack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} />
            <Stack.Screen name="AddEditInvoice" component={AddEditInvoiceScreen} />
            <Stack.Screen name="ClientDetail" component={ClientDetailScreen} />
            <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
            <Stack.Screen name="AddEditProject" component={AddEditProjectScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
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
