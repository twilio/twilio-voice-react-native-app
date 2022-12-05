import { createExpressApp } from './server';
import { getPort, getTwilioCredentials } from './util/env';

async function main() {
  console.log('Ahoy! Starting Twilio Voice React Native Reference server...');

  const twilioCredentials = getTwilioCredentials();
  if (typeof twilioCredentials === 'undefined') {
    console.warn(
      'Incomplete Twilio Credentials, please validate your environment ' +
      'variables.'
    );
    return;
  }

  let port = getPort();
  if (typeof port === 'undefined') {
    console.log(
      'No port set, using default of 3003'
    );
    port = 3003;
  }

  const app = createExpressApp(twilioCredentials);

  console.log('Twilio Voice React Native Reference server succesfully started.');
}

main();
