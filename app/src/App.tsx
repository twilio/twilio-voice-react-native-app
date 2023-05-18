import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { Provider } from 'react-redux';
import { defaultStore } from './store/app';
import StackNavigator from './screens/StackNavigator';
import { bootstrapUser } from './store/bootstrap';

const App = () => {
  /**
   * NOTE:
   * When Redux Toolkit dispatches a Thunk, it will put an `AbortController`
   * into the returned Promise as the `abort` member. Invoking the `abort`
   * method will prevent further actions from being dispatched in the Thunk.
   *
   * When a React component is unmounted, it will invoke the return value of any
   * `useEffect` functions. In this case, if the `App` component is unmounted
   * then the `abort` functions are called so the `bootstrap` actions can no
   * longer dispatch actions.
   */
  React.useEffect(() => defaultStore.dispatch(bootstrapUser()).abort, []);

  return (
    <Provider store={defaultStore}>
      <NavigationContainer>
        <StackNavigator />
      </NavigationContainer>
    </Provider>
  );
};

export default App;
