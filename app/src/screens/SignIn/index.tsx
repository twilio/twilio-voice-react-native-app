import React from 'react';
import { useAuth0 } from 'react-native-auth0';
import { StyleSheet, View, Button, Image, Text } from 'react-native';

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
    marginTop: 100,
    marginLeft: 18,
  },
  text: {
    marginBottom: 20,
  },
});

const SignIn: React.FC = () => {
  const { authorize } = useAuth0();

  const onLogin = async () => {
    try {
      await authorize({ scope: 'openid profile email' });
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../../assets/icons/logo-twilio-red.png')}
          resizeMode="contain"
        />
      </View>
      <View style={styles.body}>
        <Text style={styles.text}>
          Welcome to Twilio's Voice SDK Reference App. Log in to get started!
        </Text>
        <Button title="Log in" color="#0263E0" onPress={onLogin} />
      </View>
      <View style={styles.helloFigureContainer}>
        <Image
          source={require('../../../assets/icons/hello-figure.png')}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

export default SignIn;
