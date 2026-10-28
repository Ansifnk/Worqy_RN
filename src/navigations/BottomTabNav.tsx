import React from 'react';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import CustomTabBar from './components/CustomTabBar';
import HomeScreen from '../screens/home/HomeScreen';
import { ProjectsAndClientsScreen } from '../screens/projects/ProjectsAndClientsScreen';
import TasksScreen from '../screens/tasks/TasksScreen';
import InvoicesScreen from '../screens/invoices/InvoicesScreen';

export type BottomTabParamList = {
  Home: undefined;
  Projects: undefined;
  AIChatTab: undefined;
  Tasks: undefined;
  Invoices: undefined;
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
        name="Projects"
        component={ProjectsAndClientsScreen}
        options={{ tabBarLabel: 'Projects' }}
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
        name="Tasks"
        component={TasksScreen}
        options={{ tabBarLabel: 'Tasks' }}
      />
      <Tab.Screen
        name="Invoices"
        component={InvoicesScreen}
        options={{ tabBarLabel: 'Invoices' }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNav;
