import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store/app';
import Login from './components/Login';
import Home from './screens/Home';

/**
 * We want to import this as soon as possible in the application lifecycle to
 * initialize our application state and bind to twilio-voice.
 */
import './util/voice';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Screen name="Home" component={Home} />
      </NavigationContainer>
    </Provider>
  );
};

export default App;
