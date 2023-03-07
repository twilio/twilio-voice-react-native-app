# Twilio Voice React Native Reference

This project consists of a backend server and React Native app demonstrating best practices for developing a Twilio Programmable Voice application.

## Prerequisites

- Understanding of [Twilio Programmable Voice](https://www.twilio.com/docs/voice/sdks)
- [React Native Development Environment](https://reactnative.dev/docs/environment-setup)
- Latest LTS version of [NodeJS](https://nodejs.org/en/)
- A Node package manager. Examples in this project will use the latest version of [Yarn v1](https://classic.yarnpkg.com/lang/en/).

## Features

* Dialpad for making outgoing calls
  * Call to a phone number
  * Call to a Twilio Client<sup>*</sup>
* Active call screen to interact with and control ongoing calls
* Login flow for authenticating and authorizing users<sup>*</sup>
* Registration and notifications for incoming calls<sup>*</sup>

<sup>*</sup> Planned for a future release.

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

## Related

- [Twilio Voice React Native](https://github.com/twilio/twilio-voice-react-native)
- [Twilio Voice JS](https://github.com/twilio/twilio-voice.js)
- [Twilio Voice iOS](https://github.com/twilio/voice-quickstart-ios)
- [Twilio Voice Android](https://github.com/twilio/voice-quickstart-android)

## License

See [LICENSE](LICENSE)
