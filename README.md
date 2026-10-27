# Twilio Voice React Native Reference App

This project consists of a backend server and a React Native app that demonstrate best practices for developing a Twilio Programmable Voice application using the [Twilio Voice React Native SDK](https://github.com/twilio/twilio-voice-react-native)

## Features

* Dialpad for making outgoing calls to a phone number and other registered clients
* Registering for and receiving incoming calls
* Active call screen to interact with and control ongoing calls
* Login flow for authenticating and authorizing users

![login](https://user-images.githubusercontent.com/35968892/227046749-f2d3cc70-cfee-44c6-ae22-9e7a1c71c9fb.png)
![dialer](https://user-images.githubusercontent.com/35968892/227047077-b58f33b3-067a-4765-a645-75e1562f6607.png)
![active](https://user-images.githubusercontent.com/35968892/227046999-598f765f-3496-4e0d-83de-c7995bd616ce.png)

## Prerequisites

* Understanding of [Twilio Programmable Voice](https://www.twilio.com/docs/voice/sdks).
* Familiarity with the [Twilio Voice React Native SDK](https://github.com/twilio/twilio-voice-react-native)
* A [React Native Development Environment](https://reactnative.dev/docs/0.72/environment-setup).
* An LTS version of [NodeJS](https://nodejs.org/en/) as specified [here](app/.node-version).
* A Node package manager. Examples in this project have been tested using Yarn `1.x`.
* An [Auth0 Account](https://auth0.com/signup?place=header&type=button&text=sign%20up)

## Setting Up Auth0 Authentication

The Twilio Voice React Native Reference App implements Auth0 to demonstrate login flow for authenticating and authorizing users. Sign in to your Auth0 account and follow the steps below.

### Auth0 for the app

1. Create a new Auth0 `Native` app from the Auth0 user console, then enter your desired `Name`

2. Navigate to the settings tab of your newly created Auth0 Application. You will now need to fill out the fields labeled `Allowed Callback Urls` and `Allowed Logout Urls`. Depending on your use case enter the iOS format, Android format, or both.

> Allowed Callback Url format iOS

```
org.reactjs.native.example.twiliovoicereactnativereferenceapp.auth0://{YourDomain}/ios/org.reactjs.native.example.twiliovoicereactnativereferenceapp/callback
```

> Allowed Callback Url format Android

```
com.twiliovoicereactnativereferenceapp.auth0://{YourDomain}/android/com.twiliovoicereactnativereferenceapp/callback
```

> Allowed Logout Url format iOS

```
org.reactjs.native.example.twiliovoicereactnativereferenceapp.auth0://{YourDomain}/ios/org.reactjs.native.example.twiliovoicereactnativereferenceapp/callback
```

> Allowed Logout Url format Android

```
com.twiliovoicereactnativereferenceapp.auth0://{YourDomain}/android/com.twiliovoicereactnativereferenceapp/callback
```

### Auth0 for the server

Create a new Auth0 `API` from the Auth0 user console, then enter your desired `Name` and `Identifier`.

## Structure

* A React Native application under:
  ```
  app/
  ```

* A backend server under:
  ```
  server/
  ```

Please see the `README.md` files within each sub-folder for more information about that component.

## Testing

See [docs/e2e-testing.md](./docs/e2e-testing.md) if you plan to e2e test your fork of this app.

## Known Issues

See [docs/known-issues.md](./docs/known-issues.md) for details on known issues and workarounds.

## Community Contributions and Support

This repository is publicly available and maintained by Twilio under a limited external contribution model.

Due to limited maintenance capacity, external pull requests are not currently accepted.

GitHub Issues may be used to report reproducible bugs or provide feature feedback about this application. Issues are reviewed on a best-effort basis, with no SLA or guaranteed response.

GitHub Issues are not an official Twilio support channel. For production issues, general usage questions, or account-specific assistance, please contact [Twilio Support](https://help.twilio.com/). If you have a Twilio account manager, you may also escalate through them.

Do not share [Personally Identifiable Information (PII)](https://www.twilio.com/docs/glossary/what-is-personally-identifiable-information-pii) or sensitive account information, including access tokens, API keys, and credentials, in issues, logs, or screenshots.

Report security vulnerabilities privately through [Twilio's Vulnerability Disclosure Program](https://www.twilio.com/en-us/security/vulnerability-disclosure-program), rather than public GitHub Issues.

See [CONTRIBUTING.md](https://github.com/twilio/twilio-voice-react-native-app/blob/main/CONTRIBUTING.md) for reporting guidance.

## Related

* [Twilio Voice React Native](https://github.com/twilio/twilio-voice-react-native)
* [Twilio Voice JS](https://github.com/twilio/twilio-voice.js)
* [Twilio Voice iOS](https://github.com/twilio/voice-quickstart-ios)
* [Twilio Voice Android](https://github.com/twilio/voice-quickstart-android)

## License

See [LICENSE](LICENSE)
