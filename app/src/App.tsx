import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  createBottomTabNavigator,
  type BottomTabNavigationOptions,
} from '@react-navigation/bottom-tabs';
import { useAuth0, Auth0Provider } from 'react-native-auth0';
import React from 'react';
import { Image } from 'react-native';
import { Provider } from 'react-redux';
import { store } from './store/app';
import Home from './screens/Home';
import Dialer from './screens/Dialer';
import Call from './screens/Call';
import SignIn from './screens/SignIn';
import { StackParamList, TabParamList } from './types';
import config from './auth0-config';

/**
 * We want to import this as soon as possible in the application lifecycle to
 * initialize our application state and bind to the twilio-voice-react-native
 * SDK.
 */
import './util/voice';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<StackParamList>();

const HomeSource = require('../assets/icons/home.png');
const HomeSelectedSource = require('../assets/icons/home-selected.png');
const DialpadSource = require('../assets/icons/dialpad-dark.png');
const DialpadSelectedSource = require('../assets/icons/dialpad-selected.png');

const Other: React.FC = () => {
  const homeTabOptions: BottomTabNavigationOptions = {
    tabBarIcon: ({ focused, size }) => {
      return focused ? (
        <Image
          source={HomeSelectedSource}
          resizeMode="contain"
          style={{ maxHeight: size }}
        />
      ) : (
        <Image
          source={HomeSource}
          resizeMode="contain"
          style={{ maxHeight: size }}
        />
      );
    },
  };

  const dialerTabOptions: BottomTabNavigationOptions = {
    tabBarIcon: ({ focused, size }) => {
      return focused ? (
        <Image
          source={DialpadSelectedSource}
          resizeMode="contain"
          style={{ maxHeight: size }}
        />
      ) : (
        <Image
          source={DialpadSource}
          resizeMode="contain"
          style={{ maxHeight: size }}
        />
      );
    },
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Tab.Screen name="Home" component={Home} options={homeTabOptions} />
      <Tab.Screen name="Dialer" component={Dialer} options={dialerTabOptions} />
    </Tab.Navigator>
  );
};

const Auth0App: React.FC = () => {
  const { user } = useAuth0();
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}>
          {user ? (
            <>
              <Stack.Screen
                name="App"
                options={{ headerShown: false }}
                component={Other}
              />
              <Stack.Screen name="Call" component={Call} />
            </>
          ) : (
            <>
              <Stack.Screen name="SignIn" component={SignIn} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

const App = () => {
  return (
    <Auth0Provider domain={config.domain} clientId={config.clientId}>
      <Auth0App />
    </Auth0Provider>
  );
};

export default App;
