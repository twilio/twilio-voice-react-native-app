import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useSelector } from 'react-redux';
import ActiveCall from './ActiveCall';
import TabNavigator from './TabNavigator';
import { type StackParamList } from './types';
import SignIn from './SignIn';
import { type State } from '../store/app';
import CallInvite from './CallInvite';
import Busy from '../components/Busy';

const Stack = createNativeStackNavigator<StackParamList>();

const StackNavigator = () => {
  const user = useSelector((state: State) => state.user);
  const loginAndRegister = useSelector(
    (state: State) => state.loginAndRegister,
  );

  const isBootstrapping = loginAndRegister?.status === 'pending';
  if (isBootstrapping) {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="Busy"
          options={{ headerShown: false }}
          component={Busy}
        />
      </Stack.Navigator>
    );
  }

  const isLoggedIn =
    user?.status === 'fulfilled' &&
    user.accessToken &&
    loginAndRegister?.status === 'fulfilled';
  if (!isLoggedIn) {
    return (
      <Stack.Navigator>
        <Stack.Screen name="Sign In" component={SignIn} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="App"
        options={{ headerShown: false }}
        component={TabNavigator}
      />
      <Stack.Screen name="Call" component={ActiveCall} />
      <Stack.Screen name="Incoming Call" component={CallInvite} />
    </Stack.Navigator>
  );
};

export default StackNavigator;
