import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  createBottomTabNavigator,
  type BottomTabNavigationOptions,
} from '@react-navigation/bottom-tabs';
import React from 'react';
import { Image } from 'react-native';
import { Provider } from 'react-redux';
import { store } from './store/app';
import Home from './screens/Home';
import Dialer from './screens/Dialer';
import Call from './screens/Call';
import { StackParamList, TabParamList } from './types';

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
    <Tab.Navigator>
      <Tab.Screen name="Home" component={Home} options={homeTabOptions} />
      <Tab.Screen name="Dialer" component={Dialer} options={dialerTabOptions} />
    </Tab.Navigator>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="App"
            options={{ headerShown: false }}
            component={Other}
          />
          <Stack.Screen name="Call" component={Call} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

export default App;
