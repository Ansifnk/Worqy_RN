import React from 'react';
import { NavigationContainer, NavigatorScreenParams } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNav, { BottomTabParamList } from './BottomTabNav';
import LoginScreen from '../screens/login/LoginScreen';

export type RootStackParamList = {
  Login: undefined;
  Main: NavigatorScreenParams<BottomTabParamList> | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNav: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Main"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Main" component={BottomTabNav} />
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNav;
