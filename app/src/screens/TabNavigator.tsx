import {
  createBottomTabNavigator,
  type BottomTabNavigationOptions,
} from '@react-navigation/bottom-tabs';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ActiveCallBanner from '../components/ActiveCallBanner';
import { useConnectedActiveCallBanner } from '../components/ActiveCallBanner/hooks';
import Home from './Home';
import Dialer from './Dialer';
import About from './About';
import { type TabParamList } from './types';
import { getEnvVariable } from '../util/env';

const HomeSource = require('../../assets/icons/home.png');
const HomeSelectedSource = require('../../assets/icons/home-selected.png');
const DialpadSource = require('../../assets/icons/dialpad-dark.png');
const DialpadSelectedSource = require('../../assets/icons/dialpad-selected.png');
const AboutSource = require('../../assets/icons/info.png');
const AboutSelectedSource = require('../../assets/icons/info-selected.png');

const Tab = createBottomTabNavigator<TabParamList>();

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
  tabBarTestID: 'dialer_button',
};

const aboutTabOptions: BottomTabNavigationOptions = {
  tabBarIcon: ({ focused, size }) => {
    return focused ? (
      <Image
        source={AboutSelectedSource}
        resizeMode="contain"
        style={{ maxHeight: size }}
      />
    ) : (
      <Image
        source={AboutSource}
        resizeMode="contain"
        style={{ maxHeight: size }}
      />
    );
  },
};

const TabNavigator: React.FC = () => {
  const bannerProps = useConnectedActiveCallBanner();
  const isAboutPageEnabled = React.useMemo(() => {
    return getEnvVariable('ENABLE_ABOUT_PAGE') === 'true';
  }, []);
  const safeAreaInsets = useSafeAreaInsets();

  const screen = React.useMemo(
    () => (
      <View style={styles.screens}>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
          }}>
          <Tab.Screen name="Home" component={Home} options={homeTabOptions} />
          <Tab.Screen
            name="Dialer"
            component={Dialer}
            options={dialerTabOptions}
          />
          {isAboutPageEnabled && (
            <Tab.Screen
              name="About"
              component={About}
              options={aboutTabOptions}
            />
          )}
        </Tab.Navigator>
      </View>
    ),
    [isAboutPageEnabled],
  );

  return (
    <View
      style={{
        ...styles.container,
        paddingTop: safeAreaInsets.top,
      }}>
      <ActiveCallBanner {...bannerProps} />
      {screen}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
  },
  screens: {
    flexGrow: 1,
  },
});

export default TabNavigator;
