import React from 'react';
import { useAuth0 } from 'react-native-auth0';
import { StyleSheet, View, Button, Image, Text } from 'react-native';
import config from '../../../config';
import { useDispatch } from 'react-redux';
import { setAccessToken } from '../../store/user';

const TwilioLogo = require('../../../assets/icons/logo-twilio-red.png');
const HelloFigure = require('../../../assets/icons/hello-figure.png');

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F4F4F6',
    height: '100%',
    display: 'flex',
    alignContent: 'center',
  },
  helloFigureContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  body: {
    marginHorizontal: 40,
  },
  label: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    letterSpacing: 0,
    color: '#121C2D',
  },
  logoContainer: {
    marginTop: 140,
    marginLeft: 18,
  },
  text: {
    marginBottom: 20,
  },
});

const SignIn: React.FC = () => {
  const { authorize, getCredentials } = useAuth0();
  const dispatch = useDispatch();

  const onLogin = async () => {
    try {
      await authorize({
        scope: config.auth0Scope,
        audience: config.audience,
      });
      const { accessToken } = await getCredentials();
      dispatch(setAccessToken(accessToken));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={TwilioLogo} resizeMode="contain" />
      </View>
      <View style={styles.body}>
        <Text style={styles.text}>
          Welcome to Twilio's Voice SDK Reference App. Log in to get started!
        </Text>
        <Button title="Log in" color="#0263E0" onPress={onLogin} />
      </View>
      <View style={styles.helloFigureContainer}>
        <Image source={HelloFigure} resizeMode="contain" />
      </View>
    </View>
  );
};

export default SignIn;
