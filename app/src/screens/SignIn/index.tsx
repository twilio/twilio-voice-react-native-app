import React from 'react';
import { StyleSheet, View, Image, Text, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { loginAndRegister } from '../../store/loginAndRegister';
import { type Dispatch, type State } from '../../store/app';

const ArrowForward = require('../../../assets/icons/arrow-forward.png');
const TwilioLogo = require('../../../assets/icons/logo-twilio-red.png');
const HelloFigure = require('../../../assets/icons/hello-figure.png');
const ErrorWarning = require('../../../assets/icons/error.png');

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
    marginTop: '45%',
    marginLeft: 18,
  },
  text: {
    marginBottom: 20,
    lineHeight: 20,
  },
  loginScreenButton: {
    marginTop: 10,
    marginBottom: 10,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: '#0263E0',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fff',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginText: {
    color: '#FFFFFF',
    textAlign: 'center',
    weight: 600,
    size: 14,
  },
  arrowForward: {
    width: 20,
    height: 20,
    marginLeft: 4,
  },
  errorWarning: {
    height: 20,
    width: 20,
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'row',
    width: '90%',
  },
  errorText: {
    paddingLeft: 4,
    lineHeight: 20,
    fontSize: 14,
    color: '#D61F1F',
  },
});

const SignIn: React.FC = () => {
  const dispatch = useDispatch<Dispatch>();
  const errorMessage = useSelector((state: State) => {
    if (state.voice.accessToken.status === 'rejected') {
      switch (state.voice.accessToken.reason) {
        case 'TOKEN_RESPONSE_NOT_OK':
          return state.voice.accessToken.error.message || '';
        default:
          return '';
      }
    }
  });

  const handleLogin = async () => {
    const loginAction = await dispatch(loginAndRegister());
    if (loginAndRegister.rejected.match(loginAction)) {
      console.error(loginAction.payload || loginAction.error);
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
        <TouchableOpacity
          style={styles.loginScreenButton}
          onPress={handleLogin}
          testID="login_button">
          <Text style={styles.loginText}>Log in</Text>
          <Image
            source={ArrowForward}
            resizeMode="contain"
            style={styles.arrowForward}
          />
        </TouchableOpacity>
        {errorMessage && (
          <View style={styles.errorContainer}>
            <Image
              source={ErrorWarning}
              style={styles.errorWarning}
              resizeMode="contain"
            />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}
      </View>
      <View style={styles.helloFigureContainer}>
        <Image source={HelloFigure} resizeMode="contain" />
      </View>
    </View>
  );
};

export default SignIn;
