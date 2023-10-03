/* eslint-disable */
'use strict';
const axios = require('axios');
const process = require('node:process');
const NGROK_URL = 'http://localhost:4040/api/tunnels';
const ACCOUNT_SID = process.env.ACCOUNT_SID;
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const client = require('twilio')(ACCOUNT_SID, AUTH_TOKEN);
const fs = require('fs');

async function getNgrokTunnel() {
  const { data: ngrokResponse } = await axios.get(NGROK_URL);
  if (!'tunnels' in ngrokResponse) {
    throw new Error(
      `unexpected ngrok response: ${JSON.stringify(ngrokResponse, null, 2)}`,
    );
  }
  const { tunnels } = ngrokResponse;
  if (!Array.isArray(tunnels)) {
    throw new Error(
      `tunnels is not an array: ${JSON.stringify(tunnels, null, 2)}`,
    );
  }
  if (tunnels.length !== 1) {
    throw new Error(
      `not exactly 1 ngrok tunnel: ${JSON.stringify(tunnels, null, 2)}`,
    );
  }
  return tunnels[0];
}

async function main() {
  const tunnel = await getNgrokTunnel();

  const twimlApp = await client.applications.create({
    voiceUrl: `${tunnel.public_url}/twiml`,
  });

  fs.appendFile('../.env', `CURRENT_TWIML_APP_SID=${twimlApp.sid}\n`, (err) => {
    if (err) {
      console.log(err);
      process.exitCode = 1;
    }
  });

  console.log(JSON.stringify(twimlApp, null, 2));
}
main().catch(console.error);
