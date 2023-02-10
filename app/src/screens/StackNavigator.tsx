import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import Call from './Call';
import TabNavigator from './TabNavigator';
import { type StackParamList } from '../types';
import { useAuth0 } from 'react-native-auth0';
import SignIn from './SignIn';

const Stack = createNativeStackNavigator<StackParamList>();

const StackNavigator = () => {
  const { user } = useAuth0();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      {user ? (
        <>
          <Stack.Screen
            name="App"
            options={{ headerShown: false }}
            component={TabNavigator}
          />
          <Stack.Screen name="Call" component={Call} />
        </>
      ) : (
        <Stack.Screen name="SignIn" component={SignIn} />
      )}
    </Stack.Navigator>
  );
};

export default StackNavigator;
