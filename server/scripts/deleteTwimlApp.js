/* eslint-disable */
'use strict';
require('dotenv').config({ path: __dirname + '/../.env' });
const process = require('node:process');
const ACCOUNT_SID = process.env.ACCOUNT_SID;
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const client = require('twilio')(ACCOUNT_SID, AUTH_TOKEN);

async function main() {
  await client.applications(process.env.CURRENT_TWIML_APP_SID).remove();
}

main().catch(console.error);
