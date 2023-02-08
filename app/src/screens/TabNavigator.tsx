import {
  createBottomTabNavigator,
  type BottomTabNavigationOptions,
} from '@react-navigation/bottom-tabs';
import React from 'react';
import { Image } from 'react-native';
import Home from './Home';
import Dialer from './Dialer';
import { type TabParamList } from '../types';

const HomeSource = require('../assets/icons/home.png');
const HomeSelectedSource = require('../assets/icons/home-selected.png');
const DialpadSource = require('../assets/icons/dialpad-dark.png');
const DialpadSelectedSource = require('../assets/icons/dialpad-selected.png');

const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator: React.FC = () => {
  const homeTabOptions: BottomTabNavigationOptions = React.useMemo(
    () => ({
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
    }),
    [],
  );

  const dialerTabOptions: BottomTabNavigationOptions = React.useMemo(
    () => ({
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
    }),
    [],
  );

  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={Home} options={homeTabOptions} />
      <Tab.Screen name="Dialer" component={Dialer} options={dialerTabOptions} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
