import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useSelector } from 'react-redux';
import Call from './Call';
import TabNavigator from './TabNavigator';
import { type StackParamList } from '../types';
import SignIn from './SignIn';
import { type State } from '../store/app';

const Stack = createNativeStackNavigator<StackParamList>();

const StackNavigator = () => {
  const user = useSelector((state: State) => state.voice.user);
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      {user?.status === 'fulfilled' && user.accessToken ? (
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
