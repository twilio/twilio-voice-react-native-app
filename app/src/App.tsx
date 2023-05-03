import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { Provider } from 'react-redux';
import { createStore, logActionType } from './store/app';
import StackNavigator from './screens/StackNavigator';
import { bootstrapApp } from './store/bootstrap';

const store = createStore(logActionType);

const App = () => {
  /**
   * NOTE:
   * When Redux Toolkit dispatches a Thunk, it will put an `AbortController`
   * into the returned Promise as the `abort` member. Invoking the `abort`
   * method will prevent further actions from being dispatched in the Thunk.
   *
   * When a React component is unmounted, it will invoke the return value of any
   * `useEffect` functions. In this case, if the `App` component is unmounted
   * then the `abort` function is called so the `bootstrapApp` action can no
   * longer dispatch actions.
   */
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
