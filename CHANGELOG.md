# 1.1.0 (Oct 30, 2024)

## App

### Changes
* Now using `1.2.0` of the `@twilio/voice-react-native-sdk` package. This fixes
  several issues, please see the release notes of that project for more details.
  See the `@twilio/voice-react-native-sdk` changelog
  [here](https://github.com/twilio/twilio-voice-react-native/blob/8e6530f4a79b514931f6474c0c601c65eafb8cf7/CHANGELOG.md#110-aug-20-2024).
* Now using `0.72.17` of React Native. This fixes several build issues on newer
  Android and iOS versions.

# 1.0.0 (Mar 25, 2024)

The Twilio Voice React Native Reference App has reached milestone `1.0.0` and is
considered Generally Available (GA). Included in this release are the following.

## App

### Changes
* Refactored and simplified navigators. Now, movement between screens is more
explicit and has finer control.
* Upgraded Twilio Voice SDK to `1.0.0`.
* Refactored Android implementation to use newly refactored Android Voice React Native SDK
* Flipper is causing some build issues on Xcode version 15.3.
  An option to disable Flipper during `pod install` has been added to the Podfile of this project.
  To disable Flipper:
  ```
  NO_FLIPPER=1 pod install
  ```
  To continue using Flipper as normal, no changes are necessary to your workflow:
  ```
  pod install
  ```
  See [docs/known-issues.md](./docs/known-issues.md) for more information.

### Fixes
* iOS call timer, no longer shows negative numbers
* iOS splash screen centered for larger screens

# 1.0.0-beta.1 (Aug 23, 2023)

## App

### Features
* Incoming call support
  * Users are now automatically registered based on their Auth0 emails, and can
  receive calls.
* Outgoing call support
  * Users can make outgoing calls to clients and PSTN numbers.
* Auth0 example Authentication
  * Auth0 implemented as the example Authentication service
* Added the ability to select an audio device within the active call screen.
* Added unregistration from the Voice SDK upon logout.
* Tapping on the call invite notification will bring the call invite screen to
the foreground on Android devices.
  * Note that iOS will have similar UX because CallKit will handle the call
  invite UX. It is, however, not within the responsibility of the React
  environment.

### Changes
* Upgraded Twilio Voice SDK to `1.0.0-beta.3`.
* Upgraded React Native from `0.70.6` to `0.70.9`.
  * Potentially fixes iOS builds for newer versions of Xcode.
* Added tests
  * Added e2e tests using Detox for incoming and outgoing calls
  * Added unit tests for store and screens
* Upgrade react-native-auth0 to `3.0.0`
  * Minimum supported version for iOS is 13
* Splash screen iOS and Android

### Fixes
* The call state, duration and outgoing parameters are now persisted between JS
runtimes.
  * In effect, on Android, if a user is in an active call and closes the app,
  when they reopen the app while still in the active call, it will show the
  proper call duration, state, and outgoing call parameters (such as identity).

## Server

### Features
* Improved the developer experience
  * Added linting to server
* Platform based token vending
  * The token vending logic will adjust for either iOS or Android platforms.
