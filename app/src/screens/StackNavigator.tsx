import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Text } from 'react-native';
import { useSelector } from 'react-redux';
import Call from './Call';
import TabNavigator from './TabNavigator';
import { type StackParamList } from '../types';
import SignIn from './SignIn';
import { type State } from '../store/app';

const Stack = createNativeStackNavigator<StackParamList>();

const StackNavigator = () => {
  const user = useSelector((state: State) => state.voice.user);

  if (user === null) {
    return <Text>Application not bootstrapped.</Text>;
  }

  if (user?.status === 'pending') {
    return null;
  }

  const screens =
    user?.status === 'fulfilled' && user.accessToken ? (
      <>
        <Stack.Screen
          name="App"
          options={{ headerShown: false }}
          component={TabNavigator}
        />
        <Stack.Screen name="Call" component={Call} />
      </>
    ) : (
      <Stack.Screen
        name="Sign In"
        options={{ headerShown: false }}
        component={SignIn}
      />
    );

  return <Stack.Navigator>{screens}</Stack.Navigator>;
};

export default StackNavigator;
