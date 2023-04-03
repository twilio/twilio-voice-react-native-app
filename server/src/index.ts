import { createExpressApp } from './server';
import { getPort, getServerCredentials } from './utils/env';
import { log, warn } from './utils/log';

async function main() {
  log('Ahoy! Starting Twilio Voice React Native server...');

  const serverCredentials = getServerCredentials();
  if (typeof serverCredentials === 'undefined') {
    warn(
      'Incomplete Server Credentials, please validate your environment ' +
        'variables.',
    );
    return;
  }

  const port = getPort() ?? 3030;

  const app = createExpressApp(serverCredentials);

  app.listen(port, () =>
    log(
      'Twilio Voice React Native server succesfully started on ' +
        `port "${port}".`,
    ),
  );
}

main();
