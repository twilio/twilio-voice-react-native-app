import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';

/**
 * We want to import this as soon as possible in the application lifecycle to
 * initialize our application state and bind to the twilio-voice-react-native
 * SDK.
 */
import './util/voice';

AppRegistry.registerComponent(appName, () => App);
