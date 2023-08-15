# 1.0.0-beta.1 (Ongoing)
* Android API >= 30 devices now don't have their microphones turn off upon inactivity. 

## Known Issues
* Audio device selection is not working as expected on iOS platforms for bluetooth devices.
  * If a bluetooth audio device is connected to the iOS device, then selecting other audio devices has inconsistent behavior.

## App

### Features
* Incoming call support
  * Users are now automatically registered based on their Auth0 emails, and can receive calls.
* Outgoing call support
  * Users can make outgoing calls to clients and PSTN numbers.
* Auth0 example Authentication
  * Auth0 implemented as the example Authentication service 
* Detox e2e testing
* Added the ability to select an audio device within the active call screen.

### Changes
* Upgraded Twilio Voice SDK to `1.0.0-beta.2`.
* Upgraded React Native from `0.70.6` to `0.70.9`.
  * Potentially fixes iOS builds for newer versions of Xcode.
* Added tests
  * Added e2e tests for outgoing calls
  * Added unit tests for store and screens

## Server

### Features
* Improved the developer experience
  * Added linting to server
* Platform based token vending
  * The token vending logic will adjust for either iOS or Android platforms.
