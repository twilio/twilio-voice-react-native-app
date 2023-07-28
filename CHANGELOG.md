# 1.0.0-beta.1 (Ongoing)

## Known Issues
* Audio device selection is not working as expected on iOS platforms for bluetooth devices.
  * If a bluetooth audio device is connected to the iOS device, then selecting other audio devices has inconsistent behavior.

## App
* Upgrade Twilio Voice SDK to `1.0.0-beta.2`.
* Upgrade React Native from `0.70.6` to `0.70.9`.
  * Potentially fixes iOS builds for newer versions of Xcode.
* Added e2e tests for outgoing calls
* Added unit tests for store and screens
* Add linting to server

### Features
* Added the ability to select an audio device within the active call screen.
