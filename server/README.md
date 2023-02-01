# Twilio Voice React Native App Server

## What is this Project?

The Twilio Voice React Native App Server is a supplementary backend service for the Twilio Voice React Native App. This App serves as an example for developers who want to leverage the power of Twilio Programmable Voice in a React Native App targetting mobile platforms (iOS and Android).

The App portion of this project can be found [here](https://github.com/twilio/twilio-voice-react-native-app/tree/main/app).

## Before you use this Project

* Please ensure that you have the latest version LTS version of Node.js, found [here](https://nodejs.org/en/).
* A Node package manager. Examples in this README will use the latest version of Yarn v1.

## How to use this Project

This Server component hosts several endpoints critical to the functionality of the App.

### Routes

* `/token`
  For an end-user to make outgoing calls and receive incoming calls, the SDK needs a Twilio Access token. This Access Token should be minted and vended from an **authenticated** route. Once fetched, the Access Token can be passed to the SDK and used to make or receive calls. You can read more about Access Tokens [here](https://www.twilio.com/docs/iam/access-tokens).

* `/twiml`
  Twilio Access Tokens need be configured with an "outgoing TwiML application". This TwiML App makes a request to an endpoint that responds with TwiML for every call the TwiML App handles. The endpoint that serves the TwiML to the TwiML App can perform business logic, such as call routing. The `/twiml` route included in this Server has some sample routing logic and complements the default behavior of the App. You can read more about TwiML [here](https://www.twilio.com/docs/voice/twiml).

#### `/twiml`

For the Twilio Programmable Voice TwiML App to work, it needs to fetch TwiML from this endpoint. When developing locally, we recommend a tool like `ngrok` to proxy this endpoint for the TwiML App to access.

### Running the Project Locally

* Install dependencies
  ```sh
  yarn
  ```

* Run locally
  ```sh
  yarn watch
  ```
