import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { Provider } from 'react-redux';
import { createStore, logActionType } from './store/app';
import StackNavigator from './screens/StackNavigator';
import { bootstrapApp } from './store/bootstrap';

const store = createStore(logActionType);

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
