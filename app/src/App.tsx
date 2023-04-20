import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from './store/app';
import StackNavigator from './screens/StackNavigator';
import { bootstrapApp } from './store/bootstrap';

const store = createStore();

const App = () => {
  React.useEffect(() => store.dispatch(bootstrapApp()).abort, []);

  return (
    <Provider store={store}>
      <NavigationContainer>
        <StackNavigator />
      </NavigationContainer>
    </Provider>
  );
};

export default App;
