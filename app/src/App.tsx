import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store/app';
import StackNavigator from './screens/StackNavigator';
import { bootstrapApp } from './store/bootstrap';

const App = () => {
  React.useEffect(() => {
    store.dispatch(bootstrapApp());
  }, []);

  return (
    <Provider store={store}>
      <NavigationContainer>
        <StackNavigator />
      </NavigationContainer>
    </Provider>
  );
};

export default App;
