# 1.0.0-beta.1 (Ongoing)

## App

### Features
* Incoming call support
  * Users are now automatically registered based on their Auth0 emails, and can receive calls.
* Outgoing call support
  * Users can make outgoing calls to clients and PSTN numbers.
* Auth0 example Authentication
  * Auth0 implemented as the example Authentication service 
* Detox e2e testing

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
