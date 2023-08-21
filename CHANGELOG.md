# 1.0.0-beta.1 (In Progress)

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
* The call state and duration are now persisted between JS runtimes.
  * In effect, on Android, if a user is in an active call and closes the app,
  when they reopen the app while still in the active call, it will show the
  proper call duration and state.

## Server

### Features
* Improved the developer experience
  * Added linting to server
* Platform based token vending
  * The token vending logic will adjust for either iOS or Android platforms.
