import React from 'react';
import { StyleSheet, View, Button, Image, Text } from 'react-native';
import { useDispatch } from 'react-redux';
import { login, checkLoginStatus } from '../../store/user';
import { Dispatch } from '../../store/app';

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
  const dispatch = useDispatch<Dispatch>();

  React.useEffect(() => {
    dispatch(checkLoginStatus());
  }, [dispatch]);

  const handleLogin = () => {
    dispatch(login());
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
        <Button title="Log in" color="#0263E0" onPress={handleLogin} />
      </View>
      <View style={styles.helloFigureContainer}>
        <Image source={HelloFigure} resizeMode="contain" />
      </View>
    </View>
  );
};

export default SignIn;
