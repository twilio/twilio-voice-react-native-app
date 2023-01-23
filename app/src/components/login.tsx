import React from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { type State } from '../store/app';
import { useTypedDispatch } from '../store/common';
import { authenticateUser } from '../store/user';
import { getToken } from '../store/voice/token';
import {
  makeOutgoingCall,
  disconnectOutgoingCall
} from '../store/voice/outgoingCall';

const Login = () => {
  const dispatch = useTypedDispatch();

  const [username, setUsername] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const authHandler = React.useCallback(() => {
    dispatch(authenticateUser({ username, password }));
  }, [username, password]);
  const user = useSelector<State, State['user']>((state) => state.user);
  const isAuthenticated = React.useMemo(
    () => user?.status === 'fulfilled',
    [user]
  );
  const userText = React.useMemo(() => JSON.stringify(user), [user]);

  const tokenHandler = React.useCallback(() => {
    dispatch(getToken());
  }, []);
  const token = useSelector<State, State['voice']['token']>(
    (state) => state.voice.token
  );
  const hasToken = React.useMemo(() => token?.status === 'fulfilled', [token]);
  const tokenText = React.useMemo(() => JSON.stringify(token), [token]);

  const [to, setTo] = React.useState<string>('');
  const makeOutgoingCallHandler = React.useCallback(() => {
    dispatch(makeOutgoingCall({ to }));
  }, [to]);
  const outgoingCall = useSelector<State, State['voice']['outgoingCall']>(
    (state) => state.voice.outgoingCall
  );
  const disableDisconnectButton = React.useMemo(() => {
    return outgoingCall?.status === 'fulfilled'
      ? outgoingCall.value.state === 'disconnected'
      : true;
  }, [outgoingCall]);
  const outgoingCallText = React.useMemo(
    () => JSON.stringify(outgoingCall),
    [outgoingCall]
  );

  const disconnectOutgoingCallHandler = React.useCallback(() => {
    dispatch(disconnectOutgoingCall());
  }, []);

  return (
    <SafeAreaView>
      <StatusBar/>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic">
        <View>
          <Text>
            Twilio Voice React Native Reference App
          </Text>
        </View>
        <View>
          <Text>{userText}</Text>
          <TextInput
            placeholder="Username"
            onChangeText={setUsername}
          ></TextInput>
          <TextInput
            placeholder="Password"
            onChangeText={setPassword}
          ></TextInput>
          <Button onPress={authHandler} title="Login"></Button>
        </View>
        <View>
          <Text>{tokenText}</Text>
          <Button
            onPress={tokenHandler}
            title="Get Token"
            disabled={!isAuthenticated}
          ></Button>
        </View>
        <View>
          <TextInput
            placeholder="To"
            onChangeText={setTo}
          ></TextInput>
          <Text>{outgoingCallText}</Text>
          <Button
            onPress={makeOutgoingCallHandler}
            title="Make Outgoing Call"
            disabled={!hasToken}
          ></Button>
          <Button
            onPress={disconnectOutgoingCallHandler}
            title="Disconnect Call"
            disabled={disableDisconnectButton}
          ></Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({});

export default Login;
