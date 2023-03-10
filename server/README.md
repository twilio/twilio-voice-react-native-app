# Twilio Voice React Native Reference Server

The Twilio Voice React Native Reference Server is a supplementary backend service for the Twilio Voice React Native App. The instructions on how to use this server with the React Native App can be found [here](../app#setting-it-up-with-the-server).

### Routes

* `/token`
  For an end-user to make outgoing calls and receive incoming calls, the SDK needs a Twilio Access token. This Access Token should be minted and vended from an authenticated route. Once fetched, the Access Token can be passed to the SDK and used to make or receive calls. You can read more about Access Tokens [here](https://www.twilio.com/docs/iam/access-tokens).

* `/twiml`
  Twilio Access Tokens need be configured with an outgoing TwiML application. This TwiML App makes a request to an endpoint that responds with TwiML for every call the TwiML App handles. The endpoint that serves the TwiML to the TwiML App can perform business logic, such as call routing. The `/twiml` route included in this Server has some sample routing logic and complements the default behavior of the App. You can read more about TwiML [here](https://www.twilio.com/docs/voice/twiml).

### Environment Variables

See [example.env](example.env) for information on environment variables required to run the server.

### Running the Project Locally

* Install dependencies
  ```sh
  yarn
  ```

* Run locally
  ```sh
  yarn watch
  ```
