import React from 'react';
import { StyleSheet, View, Image, Text, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import { loginAndRegister } from '../../store/voice/registration';
import { type Dispatch } from '../../store/app';

const ArrowForward = require('../../../assets/icons/arrow-forward.png');
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
    marginTop: '50%',
    marginLeft: 18,
  },
  text: {
    marginBottom: 20,
  },
  loginScreenButton: {
    marginTop: 10,
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
});

const SignIn: React.FC = () => {
  const dispatch = useDispatch<Dispatch>();

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
          onPress={handleLogin}>
          <Text style={styles.loginText}>Log in</Text>
          <Image
            source={ArrowForward}
            resizeMode="contain"
            style={styles.arrowForward}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.helloFigureContainer}>
        <Image source={HelloFigure} resizeMode="contain" />
      </View>
    </View>
  );
};

export default SignIn;
