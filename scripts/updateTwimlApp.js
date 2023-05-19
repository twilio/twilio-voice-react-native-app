"use strict";
const https = require("node:https");
const http = require("node:http");
const process = require("node:process");
const NGROK_URL = "http://localhost:4040/api/tunnels";
const TWIML_APP_URL = (accountSid, appSid) =>
  `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Applications/${appSid}.json`;
const ACCOUNT_SID = process.env.ACCOUNT_SID;
const TWIML_APP_SID = process.env.TWIML_APP_SID;
const API_KEY_SID = process.env.API_KEY_SID;
const API_KEY_SECRET = process.env.API_KEY_SECRET;

function createJsonResponseHandler(resolve, reject) {
  return (response) => {
    const statusCode = response.statusCode;
    const contentType = response.headers["content-type"];
    if (statusCode !== 200) {
      response.resume();
      return reject(new Error(`status code: ${statusCode}`));
    }
    if (!/application\/json/.test(contentType)) {
      response.resume();
      return reject(new Error(`content type: ${contentType}`));
    }
    response.setEncoding("utf8");
    const rawDataChunks = [];
    response.on("data", (chunk) => {
      rawDataChunks.push(chunk);
    });
    response.on("end", () => {
      resolve(JSON.parse(rawDataChunks.join()));
    });
  };
}

function requestJson(url, options, useHttps = true) {
  let request;
  let promise = new Promise((resolve, reject) => {
    request = (useHttps ? https : http)
      .request(url, options, createJsonResponseHandler(resolve, reject))
      .on("error", reject);
  });
  return { request, promise };
}

async function getNgrokTunnel() {
  const { request, promise } = requestJson(
    NGROK_URL,
    {
      method: "GET",
    },
    false
  );
  request.end();
  const ngrokResponse = await promise;
  if (!"tunnels" in ngrokResponse) {
    throw new Error(
      `unexpected ngrok response: ${JSON.stringify(ngrokResponse, null, 2)}`
    );
  }
  const { tunnels } = ngrokResponse;
  if (!Array.isArray(tunnels)) {
    throw new Error(
      `tunnels is not an array: ${JSON.stringify(tunnels, null, 2)}`
    );
  }
  if (tunnels.length !== 1) {
    throw new Error(
      `not exactly 1 ngrok tunnel: ${JSON.stringify(tunnels, null, 2)}`
    );
  }
  return tunnels[0];
}

async function updateTwimlApp(
  voiceUrl,
  accountSid,
  appSid,
  apiKeySid,
  apiKeySecret
) {
  const url = TWIML_APP_URL(accountSid, appSid);
  const postData = new URLSearchParams({
    VoiceUrl: voiceUrl,
  }).toString();
  const { request, promise } = requestJson(url, {
    method: "POST",
    auth: `${apiKeySid}:${apiKeySecret}`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(postData),
    },
  });
  request.write(postData);
  request.end();
  return promise;
}

async function main() {
  const tunnel = await getNgrokTunnel();
  const twimlApp = await updateTwimlApp(
    `${tunnel.public_url}/twiml`,
    ACCOUNT_SID,
    TWIML_APP_SID,
    API_KEY_SID,
    API_KEY_SECRET
  );
  console.log(JSON.stringify(twimlApp, null, 2));
}
main().catch(console.error);
