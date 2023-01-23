import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store/app';
import Login from './components/Login';

import './util/voice';

const App = () => {
  return (
    <Provider store={store}>
      <Login />
    </Provider>
  );
};

export default App;
