import { createExpressApp } from './server';
import { getPort, getTwilioCredentials } from './utils/env';
import { log, warn } from './utils/log';

async function main() {
  log('Ahoy! Starting Twilio Voice React Native server...');

  const twilioCredentials = getTwilioCredentials();
  if (typeof twilioCredentials === 'undefined') {
    warn(
      'Incomplete Twilio Credentials, please validate your environment ' +
      'variables.'
    );
    return;
  }

  const port = getPort() ?? 3030;

  const app = createExpressApp(twilioCredentials);

  app.listen(
    port,
    () => log(
      'Twilio Voice React Native server succesfully started on ' +
      `port "${port}".`
    ),
  );
}

main();
