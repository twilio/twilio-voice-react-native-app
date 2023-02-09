import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import Call from './Call';
import TabNavigator from './TabNavigator';
import { type StackParamList } from '../types';

const Stack = createNativeStackNavigator<StackParamList>();

const StackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="App"
        options={{ headerShown: false }}
        component={TabNavigator}
      />
      <Stack.Screen name="Call" component={Call} />
    </Stack.Navigator>
  );
};

export default StackNavigator;
