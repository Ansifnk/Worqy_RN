import React from 'react';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import CustomTabBar from './components/CustomTabBar';
import HomeScreen from '../screens/home/HomeScreen';
import ExploreScreen from '../screens/explore/ExploreScreen';
import BookingsScreen from '../screens/bookings/BookingsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

export type BottomTabParamList = {
  Home: undefined;
  Customers: undefined;
  Schedule: undefined;
  Pages: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

const renderTabBar = (props: BottomTabBarProps) => <CustomTabBar {...props} />;

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
        name="Customers"
        component={ExploreScreen}
        options={{ tabBarLabel: 'Customers' }}
      />
      <Tab.Screen
        name="Schedule"
        component={BookingsScreen}
        options={{ tabBarLabel: 'Schedule' }}
      />
      <Tab.Screen
        name="Pages"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Pages' }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNav;
