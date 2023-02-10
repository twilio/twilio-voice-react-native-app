import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store/app';
import StackNavigator from './screens/StackNavigator';
import { Auth0Provider } from 'react-native-auth0';
import config from './auth0-config';

const App = () => {
  return (
    <Auth0Provider domain={config.domain} clientId={config.clientId}>
      <Provider store={store}>
        <NavigationContainer>
          <StackNavigator />
        </NavigationContainer>
      </Provider>
    </Auth0Provider>
  );
};

export default App;
