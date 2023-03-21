# Twilio Voice React Native Reference

This project consists of a backend server and a React Native app that demonstrate best practices for developing a Twilio Programmable Voice application.

## Features

- Dialpad for making outgoing calls to a phone number
- Active call screen to interact with and control ongoing calls
- Login flow for authenticating and authorizing users

### Planned Features

- App to app calls
- Registration and notifications for incoming calls

![dialer](https://user-images.githubusercontent.com/22135968/223575482-53f733b4-c828-4dd1-b100-7cc945a52c9f.jpg)
![active](https://user-images.githubusercontent.com/22135968/223575472-f112ab20-f11c-4f54-9432-3640ddbb0f1c.jpg)

## Prerequisites

- Understanding of [Twilio Programmable Voice](https://www.twilio.com/docs/voice/sdks).
- A [React Native Development Environment](https://reactnative.dev/docs/0.70/environment-setup).
- Latest LTS version of [NodeJS](https://nodejs.org/en/).
- A Node package manager. Examples in this project will use the latest version of [Yarn v1](https://classic.yarnpkg.com/lang/en/).
- Create a free tier [Auth0 Account](https://auth0.com/signup?place=header&type=button&text=sign%20up)

## Setting Up Auth0 Authentication

This app implements Auth0 to demonstrate login flow for authenticating and authorizing users

Sign In to your Auth0 account

### Auth0 for the client

Create a new Auth0 `Native` app from the Auth0 user console

- Input your desired `Name`

![auth0reactnative](https://user-images.githubusercontent.com/35968892/226486988-5dc0172d-0f46-4957-916b-385c2bdeaf8b.png)

### Auth0 for the server

Create a new Auth0 `API` from the Auth0 user console

- Input your desired `Name`
- Input your desired `Identifier`, recommend use pattern `https://{Name}/api`

![auth0api](https://user-images.githubusercontent.com/35968892/226484829-1544e9db-a258-4986-adcf-923364e759ef.png)

## Structure

- A React Native application under:

  ```
  app/
  ```

- A backend server under:
  ```
  server/
  ```

Please see the `README.md` files within each sub-folder for more information about that component.

## Related

- [Twilio Voice React Native](https://github.com/twilio/twilio-voice-react-native)
- [Twilio Voice JS](https://github.com/twilio/twilio-voice.js)
- [Twilio Voice iOS](https://github.com/twilio/voice-quickstart-ios)
- [Twilio Voice Android](https://github.com/twilio/voice-quickstart-android)

## License

See [LICENSE](LICENSE)
