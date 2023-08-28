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
