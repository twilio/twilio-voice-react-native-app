import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableHighlight,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { StackNavigationProp } from '../types';
import { type Dispatch, type State } from '../../store/app';
import { logout } from '../../store/user';
import { unregister } from '../../store/voice/registration';

const TwilioLogo = require('../../../assets/icons/twilio-logo.png');

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
    marginLeft: 40,
  },
  logo: {
    height: 50,
    width: 150,
  },
  logoutText: {
    color: '#0263E0',
    textDecorationLine: 'underline',
    padding: 0,
  },
});

const Home: React.FC = () => {
  const dispatch = useDispatch<Dispatch>();
  const user = useSelector((state: State) => state.user);
  const navigation = useNavigation<StackNavigationProp<'App'>>();

  const handleLogout = async () => {
    navigation.reset({ routes: [{ name: 'Busy' }] });

    const logoutAction = await dispatch(logout());
    if (logout.rejected.match(logoutAction)) {
      console.error(logoutAction.payload || logoutAction.error);
      navigation.reset({
        routes: [{ name: 'App', params: { screen: 'Home' } }],
      });
      return;
    }

    const unregisterAction = await dispatch(unregister());
    if (unregister.rejected.match(unregisterAction)) {
      console.error(unregisterAction.payload || unregisterAction.error);
      navigation.reset({
        routes: [{ name: 'App', params: { screen: 'Home' } }],
      });
      return;
    }

    navigation.reset({ routes: [{ name: 'Sign In' }] });
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image style={styles.logo} source={TwilioLogo} resizeMode="contain" />
      </View>
      <View style={styles.body}>
        <Text>Ahoy!</Text>
        <View style={styles.client}>
          <Text>Client ID:</Text>
          <TouchableHighlight testID="logout_button" onPress={handleLogout}>
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableHighlight>
        </View>
        {user?.status === 'fulfilled' && (
          <Text style={styles.userText}>{user.email}</Text>
        )}
      </View>
    </View>
  );
};

export default Home;
