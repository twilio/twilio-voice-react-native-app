import { Call as TwilioCall } from '@twilio/voice-react-native-sdk';
import {
  createBottomTabNavigator,
  type BottomTabNavigationOptions,
} from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import ActiveCallBanner from '../components/ActiveCallBanner';
import {
  useActiveCall,
  useActiveCallRemoteParticipant,
  useActiveCallStatus,
} from '../hooks/activeCall';
import Home from './Home';
import Dialer from './Dialer';
import { type TabParamList, type StackNavigationProp } from '../types';

const HomeSource = require('../../assets/icons/home.png');
const HomeSelectedSource = require('../../assets/icons/home-selected.png');
const DialpadSource = require('../../assets/icons/dialpad-dark.png');
const DialpadSelectedSource = require('../../assets/icons/dialpad-selected.png');

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
};

const TabNavigator: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<'App'>>();

  const handleActiveCallBannerPress = React.useCallback(() => {
    navigation.navigate('Call');
  }, [navigation]);

  const activeCall = useActiveCall();
  const remoteParticipant = useActiveCallRemoteParticipant(activeCall);
  const callStatus = useActiveCallStatus(activeCall);

  const banner = React.useMemo(() => {
    if (activeCall?.status !== 'fulfilled') {
      return null;
    }

    if (activeCall.callInfo.state === TwilioCall.State.Disconnected) {
      return null;
    }

    return (
      <ActiveCallBanner
        title={remoteParticipant}
        subtitle={callStatus}
        onPress={handleActiveCallBannerPress}
      />
    );
  }, [activeCall, remoteParticipant, callStatus, handleActiveCallBannerPress]);

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
        </Tab.Navigator>
      </View>
    ),
    [],
  );

  return (
    <View style={styles.container}>
      {banner}
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
