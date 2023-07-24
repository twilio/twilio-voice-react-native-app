import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { Provider } from 'react-redux';
import StackNavigator from './screens/StackNavigator';
import { defaultStore } from './store/app';
import {
  bootstrapAudioDevices,
  bootstrapCalls,
  bootstrapCallInvites,
  bootstrapUser,
  bootstrapNavigation,
} from './store/bootstrap';
import { navigationRef } from './util/navigation';

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
  React.useEffect(() => {
    const bootstrap = async () => {
      await defaultStore.dispatch(bootstrapAudioDevices());
      await defaultStore.dispatch(bootstrapUser());
      await defaultStore.dispatch(bootstrapCalls());
      await defaultStore.dispatch(bootstrapCallInvites());
      await defaultStore.dispatch(bootstrapNavigation());
    };

    bootstrap();
  }, []);

  return (
    <Provider store={defaultStore}>
      <NavigationContainer ref={navigationRef}>
        <StackNavigator />
      </NavigationContainer>
    </Provider>
  );
};

export default App;
