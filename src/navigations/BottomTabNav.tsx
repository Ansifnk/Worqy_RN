import React from 'react';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import CustomTabBar from './components/CustomTabBar';
import HomeScreen from '../screens/home/HomeScreen';
import { ProjectsAndClientsScreen } from '../screens/projects/ProjectsAndClientsScreen';
import { TasksAndScheduleScreen } from '../screens/tasks/TasksAndScheduleScreen';
import { FinanceScreen } from '../screens/invoices/FinanceScreen';

export type BottomTabParamList = {
  Home: undefined;
  Work: { initialTab?: 'projects' | 'clients' } | undefined;
  AIChatTab: undefined;
  Planner: { initialTab?: 'tasks' | 'schedule' } | undefined;
  Finance: { initialTab?: 'invoices' | 'quotations' } | undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

const renderTabBar = (props: BottomTabBarProps) => <CustomTabBar {...props} />;

const EmptyScreen = () => null;

export const BottomTabNav: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={renderTabBar}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Work"
        component={ProjectsAndClientsScreen}
        options={{ tabBarLabel: 'Work' }}
      />
      <Tab.Screen
        name="AIChatTab"
        component={EmptyScreen}
        options={{ tabBarLabel: 'AI' }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            const parent = navigation.getParent();
            if (parent) {
              (parent as any).navigate('AIChat');
            } else {
              (navigation as any).navigate('AIChat');
            }
          },
        })}
      />
      <Tab.Screen
        name="Planner"
        component={TasksAndScheduleScreen}
        options={{ tabBarLabel: 'Planner' }}
      />
      <Tab.Screen
        name="Finance"
        component={FinanceScreen}
        options={{ tabBarLabel: 'Finance' }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNav;
