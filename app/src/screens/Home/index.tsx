import React from 'react';
import { useAuth0 } from 'react-native-auth0';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableHighlight,
} from 'react-native';

const TwilioLogo = require('../../../assets/icons/logo-twilio-red.png');

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F4F4F6',
    height: '100%',
    display: 'flex',
    alignContent: 'center',
  },
  body: {
    marginHorizontal: 40,
    marginTop: 30,
  },
  client: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userText: {
    fontWeight: '700',
    fontSize: 24,
    marginTop: 8,
  },
  logoContainer: {
    marginTop: 100,
    marginLeft: 18,
  },
  logoutText: {
    color: '#0263E0',
    textDecorationLine: 'underline',
    padding: 0,
  },
});

const Home: React.FC = () => {
  const { user, clearSession } = useAuth0();

  const onLogout = async () => {
    try {
      await clearSession();
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={TwilioLogo} resizeMode="contain" />
      </View>
      <View style={styles.body}>
        <Text>Ahoy!</Text>
        <View style={styles.client}>
          <Text>Client ID:</Text>
          <TouchableHighlight onPress={onLogout}>
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableHighlight>
        </View>
        <Text style={styles.userText}>{user?.email}</Text>
      </View>
    </View>
  );
};

export default Home;
